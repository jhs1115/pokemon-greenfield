-- Run after schema.sql. All swaps and both save revisions commit atomically.
begin;
create table if not exists public.trade_rooms (
 id uuid primary key default gen_random_uuid(), code text unique not null,
 host uuid not null references auth.users(id) on delete cascade, guest uuid references auth.users(id) on delete cascade,
 host_slot int not null check(host_slot between 1 and 3), guest_slot int check(guest_slot between 1 and 3),
 offer1 jsonb, offer2 jsonb, ready1 boolean not null default false, ready2 boolean not null default false,
 version integer not null default 0, status text not null default 'open' check(status in ('open','completed','closed')),
 created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '30 minutes'),
 check(host is distinct from guest)
);
alter table public.trade_rooms add column if not exists version integer not null default 0;
alter table public.trade_rooms enable row level security;
revoke all on public.trade_rooms from public,anon,authenticated;
grant all on public.trade_rooms to service_role;

-- Move exactly the Pokemon's progress; held items stay with their original owner.
create or replace function public.trade_swap_state(s jsonb, outgoing int, incoming jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare k text:=outgoing::text; n text:=incoming->>'id'; item text; v jsonb; ids jsonb; party jsonb;
begin
 item:=s->'heldItems'->>k;
 if item is not null and item<>'' then
  s:=jsonb_set(s,'{inventory}',coalesce(s->'inventory','{}')||jsonb_build_object(item,coalesce((s->'inventory'->>item)::int,0)+1));
 end if;
 select coalesce(jsonb_agg(case when x=to_jsonb(outgoing) then to_jsonb(n::int) else x end order by ord),'[]') into ids from jsonb_array_elements(s->'owned') with ordinality t(x,ord);
 select coalesce(jsonb_agg(case when x=to_jsonb(outgoing) then to_jsonb(n::int) else x end order by ord),'[]') into party from jsonb_array_elements(s->'team') with ordinality t(x,ord);
 s:=s||jsonb_build_object('owned',ids,'team',party,'records',(coalesce(s->'records','{}')-k)||jsonb_build_object(n,incoming->'record'),
  'moveSets',(coalesce(s->'moveSets','{}')-k)||jsonb_build_object(n,incoming->'moves'),
  'abilitySets',(coalesce(s->'abilitySets','{}')-k)||jsonb_build_object(n,incoming->'ability'),
  'heldItems',coalesce(s->'heldItems','{}')-k,'pvpTeam','[]'::jsonb,'updatedAt',to_jsonb(clock_timestamp()));
 return s;
end;$$;
revoke all on function public.trade_swap_state(jsonb,int,jsonb) from public,anon,authenticated;
grant execute on function public.trade_swap_state(jsonb,int,jsonb) to service_role;

create or replace function public.trade_gateway(p_actor uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.trade_rooms%rowtype; a public.game_saves%rowtype; b public.game_saves%rowtype;
 side int; slot_no int; pid int; packet jsonb; newcode text;
begin
 if p_actor is null or not exists(select 1 from auth.users where id=p_actor) then raise exception 'AUTH_REQUIRED'; end if;
 if p_action in ('host','join') then
  slot_no:=(p_payload->>'slot')::int;
  if slot_no is null or slot_no not between 1 and 3 then raise exception 'INVALID_SLOT'; end if;
  if not exists(select 1 from public.game_saves where user_id=p_actor and slot=slot_no) then raise exception 'SAVE_REQUIRED'; end if;
 end if;
 -- Serialize membership creation. A user cannot join multiple open rooms.
 if p_action in ('host','join') then
  perform pg_advisory_xact_lock(712391);
  select * into r from public.trade_rooms where (host=p_actor or guest=p_actor) and status='open' and expires_at>clock_timestamp() order by created_at desc limit 1 for update;
  if found then
   if p_action='join' and r.code<>upper(trim(p_payload->>'code')) then raise exception 'ALREADY_IN_ROOM'; end if;
  elsif p_action='host' then
   loop
    newcode:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    begin
     insert into public.trade_rooms(code,host,host_slot) values(newcode,p_actor,slot_no) returning * into r;
     exit;
    exception when unique_violation then end;
   end loop;
  else
   select * into r from public.trade_rooms where code=upper(trim(p_payload->>'code')) for update;
   if not found or r.status<>'open' or r.expires_at<=clock_timestamp() then raise exception 'ROOM_NOT_FOUND'; end if;
   if r.host=p_actor then raise exception 'SELF_TRADE'; end if;
   if r.guest is not null then raise exception 'ROOM_FULL'; end if;
   update public.trade_rooms set guest=p_actor,guest_slot=slot_no,ready1=false,ready2=false where id=r.id returning * into r;
  end if;
 else
  select * into r from public.trade_rooms where id=(p_payload->>'roomId')::uuid for update;
  if not found or (p_actor<>r.host and p_actor is distinct from r.guest) then raise exception 'ROOM_NOT_FOUND'; end if;
 end if;
 side:=case when p_actor=r.host then 0 else 1 end;
 if r.status='open' and r.expires_at<=clock_timestamp() then update public.trade_rooms set status='closed' where id=r.id returning * into r; end if;
 if p_action='leave' and r.status='open' then
  update public.trade_rooms set status='closed',ready1=false,ready2=false where id=r.id returning * into r;
 elsif p_action in ('offer','confirm','unready') then
  if r.status<>'open' then raise exception 'ROOM_CLOSED'; end if;
  if p_action='unready' then
   update public.trade_rooms set ready1=false,ready2=false,version=version+1 where id=r.id returning * into r;
  elsif p_action='offer' then
   pid:=(p_payload->>'pokemon')::int;
   select * into a from public.game_saves where user_id=p_actor and slot=case when side=0 then r.host_slot else r.guest_slot end for update;
   if pid is null or pid not between 1 and 151 or not coalesce(a.state->'owned' @> jsonb_build_array(pid),false) or a.state->'records'->pid::text is null then raise exception 'NOT_OWNED'; end if;
   packet:=jsonb_build_object('id',pid,'record',a.state->'records'->pid::text,'moves',a.state->'moveSets'->pid::text,'ability',coalesce(a.state->'abilitySets'->pid::text,'0'::jsonb),'revision',a.revision);
   update public.trade_rooms set version=version+1,offer1=case when side=0 then packet else offer1 end,offer2=case when side=1 then packet else offer2 end,ready1=false,ready2=false where id=r.id returning * into r;
  else
   if r.guest is null or r.offer1 is null or r.offer2 is null then raise exception 'OFFER_REQUIRED'; end if;
   if (p_payload->>'version')::integer is distinct from r.version then raise exception 'OFFER_CHANGED'; end if;
   -- Same lock order for every trade, so other rooms cannot deadlock the save rows.
   perform 1 from public.game_saves where (user_id=r.host and slot=r.host_slot) or (user_id=r.guest and slot=r.guest_slot) order by user_id,slot for update;
   select * into a from public.game_saves where user_id=r.host and slot=r.host_slot;
   select * into b from public.game_saves where user_id=r.guest and slot=r.guest_slot;
   if a.revision is distinct from (r.offer1->>'revision')::bigint or b.revision is distinct from (r.offer2->>'revision')::bigint then raise exception 'SAVE_CHANGED'; end if;
   if a.state->'owned' @> jsonb_build_array((r.offer2->>'id')::int) or b.state->'owned' @> jsonb_build_array((r.offer1->>'id')::int) then raise exception 'ALREADY_OWNED'; end if;
   update public.trade_rooms set ready1=ready1 or side=0,ready2=ready2 or side=1 where id=r.id returning * into r;
   if r.ready1 and r.ready2 then
    update public.game_saves set state=public.trade_swap_state(a.state,(r.offer1->>'id')::int,r.offer2),revision=revision+1,updated_at=clock_timestamp() where user_id=r.host and slot=r.host_slot;
    update public.game_saves set state=public.trade_swap_state(b.state,(r.offer2->>'id')::int,r.offer1),revision=revision+1,updated_at=clock_timestamp() where user_id=r.guest and slot=r.guest_slot;
    update public.trade_rooms set status='completed' where id=r.id returning * into r;
   end if;
  end if;
 elsif p_action not in ('host','join','sync','leave') then raise exception 'INVALID_ACTION'; end if;
 return jsonb_build_object('id',r.id,'version',r.version,'code',r.code,'own',side,'slot',case when side=0 then r.host_slot else r.guest_slot end,'joined',r.guest is not null,'status',r.status,
  'offers',jsonb_build_array(r.offer1-'revision',r.offer2-'revision'),'ready',jsonb_build_array(r.ready1,r.ready2),'expiresAt',r.expires_at);
end;$$;
revoke all on function public.trade_gateway(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.trade_gateway(uuid,text,jsonb) to service_role;
commit;
