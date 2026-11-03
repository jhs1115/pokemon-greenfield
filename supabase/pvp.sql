-- Run after schema.sql. Only the authenticated Edge Function has service-role RPC access.
begin;
create table if not exists public.pvp_queue (
 user_id uuid primary key references auth.users(id) on delete cascade,
 slot integer not null check(slot between 1 and 3), team jsonb not null,
 created_at timestamptz not null default now(), heartbeat timestamptz not null default now()
);
create table if not exists public.pvp_matches (
 id uuid primary key default gen_random_uuid(),
 player1 uuid not null references auth.users(id),player2 uuid not null references auth.users(id),
 team1 jsonb not null,team2 jsonb not null, check(player1<>player2),
 picks1 jsonb,picks2 jsonb,pending1 jsonb,pending2 jsonb,
 phase text not null default 'select' check(phase in ('select','battle','resolving','finished')),
 round integer not null default 0,version integer not null default 0,
 deadline timestamptz not null default (now()+interval '30 seconds'),starts_at timestamptz not null default now(),
 seed jsonb not null,state jsonb,history jsonb not null default '[]',events jsonb not null default '[]',
 winner text check(winner in ('p1','p2','draw')),resolve_token uuid,lease_until timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists pvp_player1_active on public.pvp_matches(player1,phase);
create index if not exists pvp_player2_active on public.pvp_matches(player2,phase);
alter table public.pvp_queue enable row level security;
alter table public.pvp_matches enable row level security;
revoke all on public.pvp_queue,public.pvp_matches from public,anon,authenticated;
grant all on public.pvp_queue,public.pvp_matches to service_role;

create or replace function public.pvp_gateway(p_actor uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.pvp_matches; q public.pvp_queue; opponent public.pvp_queue; side integer;
 claimed boolean:=false; ready boolean:=false; requested uuid; chosen jsonb; seed_value jsonb;
begin
 if p_actor is null or not exists(select 1 from auth.users where id=p_actor) then raise exception 'AUTH_REQUIRED';end if;
 if p_action not in ('join','sync','leave','pick','submit') then raise exception 'INVALID_ACTION';end if;
 if p_payload->>'matchId' is not null then requested:=(p_payload->>'matchId')::uuid;end if;
 if requested is not null then
  select * into m from public.pvp_matches where id=requested and p_actor in (player1,player2) for update;
  if not found then raise exception 'NOT_PARTICIPANT';end if;
 else
  select * into m from public.pvp_matches where p_actor in(player1,player2) and phase<>'finished' order by created_at desc limit 1 for update;
 end if;
 if m.id is null then
  perform pg_advisory_xact_lock(7413815);
  -- A partner may have matched us while the first lookup was waiting.
  select * into m from public.pvp_matches where p_actor in(player1,player2) and phase<>'finished' order by created_at desc limit 1 for update;
  if m.id is null then
   if p_action='leave' then delete from public.pvp_queue where user_id=p_actor;return jsonb_build_object('status','idle');end if;
   if p_action='join' then
    if jsonb_typeof(p_payload->'team')<>'array' or jsonb_array_length(p_payload->'team')<>6 or (p_payload->>'slot')::integer not between 1 and 3 then raise exception 'SIX_REQUIRED';end if;
    if (select count(distinct x->>'id') from jsonb_array_elements(p_payload->'team') x)<>6 then raise exception 'DUPLICATE_POKEMON';end if;
    if exists(select 1 from jsonb_array_elements(p_payload->'team') x where coalesce(x->>'item','')<>'' group by x->>'item' having count(*)>1) then raise exception 'DUPLICATE_ITEM';end if;
    insert into public.pvp_queue(user_id,slot,team) values(p_actor,(p_payload->>'slot')::integer,p_payload->'team')
    on conflict(user_id) do update set team=excluded.team,slot=excluded.slot,heartbeat=clock_timestamp();
   end if;
   update public.pvp_queue set heartbeat=clock_timestamp() where user_id=p_actor returning * into q;
   if q.user_id is null then return jsonb_build_object('status','idle');end if;
   select * into opponent from public.pvp_queue where user_id<>p_actor and heartbeat>clock_timestamp()-interval '15 seconds' order by created_at,user_id limit 1 for update skip locked;
   if opponent.user_id is null then return jsonb_build_object('status','queued','queuedAt',q.created_at,'serverNow',clock_timestamp());end if;
   seed_value:=jsonb_build_array(floor(random()*65536)::integer,floor(random()*65536)::integer,floor(random()*65536)::integer,floor(random()*65536)::integer);
   insert into public.pvp_matches(player1,player2,team1,team2,seed) values(opponent.user_id,p_actor,opponent.team,q.team,seed_value) returning * into m;
   delete from public.pvp_queue where user_id in(p_actor,opponent.user_id);
  end if;
 end if;
 side:=case when m.player1=p_actor then 0 else 1 end;
 if p_action='leave' and m.phase<>'finished' then
  update public.pvp_matches set phase='finished',winner=case when side=0 then 'p2' else 'p1' end,resolve_token=null,lease_until=null,updated_at=clock_timestamp() where id=m.id returning * into m;
  return jsonb_build_object('status','match','match',to_jsonb(m),'claimed',false);
 end if;
 if p_action='pick' and m.phase='select' and clock_timestamp()<m.deadline then
  chosen:=p_payload->'picks';
  if jsonb_typeof(chosen)<>'array' or jsonb_array_length(chosen)<>3 or (select count(distinct x) from jsonb_array_elements_text(chosen) x)<>3 then raise exception 'THREE_REQUIRED';end if;
  if exists(select 1 from jsonb_array_elements_text(chosen) x where x !~ '^[0-5]$') then raise exception 'INVALID_PICK';end if;
  update public.pvp_matches set picks1=case when side=0 then coalesce(picks1,chosen) else picks1 end,picks2=case when side=1 then coalesce(picks2,chosen) else picks2 end where id=m.id returning * into m;
 end if;
 if p_action='submit' and m.phase='battle' then
  if (p_payload->>'round')::integer<>m.round then raise exception 'STALE_TURN';end if;
  if clock_timestamp()<m.starts_at then raise exception 'PLAYBACK_ACTIVE';end if;
  if clock_timestamp()<m.deadline then
   if jsonb_typeof(p_payload->'command')<>'object' then raise exception 'INVALID_COMMAND';end if;
   update public.pvp_matches set pending1=case when side=0 then coalesce(pending1,p_payload->'command') else pending1 end,pending2=case when side=1 then coalesce(pending2,p_payload->'command') else pending2 end where id=m.id returning * into m;
  end if;
 end if;
 if m.phase='select' and (m.picks1 is not null and m.picks2 is not null or clock_timestamp()>=m.deadline) then
  update public.pvp_matches set picks1=coalesce(picks1,'[0,1,2]'),picks2=coalesce(picks2,'[0,1,2]') where id=m.id returning * into m;ready:=true;
 elsif m.phase='battle' and (m.pending1 is not null and m.pending2 is not null or clock_timestamp()>=m.deadline) then ready:=true;
 elsif m.phase='resolving' and m.lease_until<clock_timestamp() then ready:=true;
 end if;
 if ready then
  update public.pvp_matches set phase='resolving',resolve_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '20 seconds',updated_at=clock_timestamp() where id=m.id returning * into m;claimed:=true;
 end if;
 return jsonb_build_object('status','match','match',to_jsonb(m),'claimed',claimed);
end;$$;

create or replace function public.pvp_finish(p_id uuid,p_token uuid,p_state jsonb,p_event jsonb,p_commands jsonb,p_winner text,p_delay integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.pvp_matches;next_start timestamptz;next_events jsonb;
begin
 select * into m from public.pvp_matches where id=p_id for update;
 if not found or m.phase<>'resolving' or m.resolve_token is distinct from p_token then raise exception 'RESOLUTION_EXPIRED';end if;
 next_start:=clock_timestamp()+make_interval(secs=>greatest(0,least(15000,p_delay))/1000.0);
 select coalesce(jsonb_agg(e order by n),'[]') into next_events from jsonb_array_elements(m.events||jsonb_build_array(p_event||jsonb_build_object('version',m.version+1))) with ordinality as x(e,n) where n>greatest(0,jsonb_array_length(m.events)+1-4);
 update public.pvp_matches set state=p_state,events=next_events,history=case when p_commands is null then history else history||jsonb_build_array(p_commands) end,
  round=m.round+1,version=m.version+1,phase=case when p_winner is null then 'battle' else 'finished' end,winner=p_winner,
  pending1=null,pending2=null,starts_at=next_start,deadline=next_start+interval '30 seconds',resolve_token=null,lease_until=null,updated_at=clock_timestamp()
 where id=p_id returning * into m;
 return to_jsonb(m);
end;$$;
revoke all on function public.pvp_gateway(uuid,text,jsonb),public.pvp_finish(uuid,uuid,jsonb,jsonb,jsonb,text,integer) from public,anon,authenticated;
grant execute on function public.pvp_gateway(uuid,text,jsonb),public.pvp_finish(uuid,uuid,jsonb,jsonb,jsonb,text,integer) to service_role;
commit;
