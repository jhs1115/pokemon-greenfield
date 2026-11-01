-- Run once in Supabase SQL Editor. Safe to run again for this schema version.
begin;
create table if not exists public.game_saves (
 user_id uuid not null references auth.users(id) on delete cascade,
 slot integer not null check (slot between 1 and 3),
 state jsonb not null check (jsonb_typeof(state) = 'object'),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now(),
 primary key (user_id, slot)
);
alter table public.game_saves enable row level security;
revoke all on public.game_saves from anon, authenticated;
grant select on public.game_saves to authenticated;
drop policy if exists "Read own slots" on public.game_saves;
create policy "Read own slots" on public.game_saves for select to authenticated using ((select auth.uid()) = user_id);

-- Writes go through the revision check; direct table inserts/updates are denied.
create or replace function public.save_game_slot(p_slot integer, p_state jsonb, p_expected_revision bigint, p_owner uuid)
returns table(revision bigint, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_revision bigint; v_time timestamptz;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_owner is distinct from v_uid then raise exception 'AUTH_MISMATCH'; end if;
 if p_slot is null or p_slot not between 1 and 3 or p_expected_revision is null or p_expected_revision < 0 then raise exception 'INVALID_SLOT'; end if;
 if p_state is null or jsonb_typeof(p_state) <> 'object' or octet_length(p_state::text) > 1048576 then raise exception 'INVALID_SAVE'; end if;
 if p_expected_revision = 0 then
  insert into public.game_saves as s(user_id,slot,state) values (v_uid,p_slot,p_state)
  on conflict (user_id,slot) do nothing returning s.revision,s.updated_at into v_revision,v_time;
 else
  update public.game_saves as s set state=p_state,revision=s.revision+1,updated_at=clock_timestamp()
  where s.user_id=v_uid and s.slot=p_slot and s.revision=p_expected_revision
  returning s.revision,s.updated_at into v_revision,v_time;
 end if;
 if not found then raise exception 'SAVE_CONFLICT'; end if;
 return query select v_revision,v_time;
end;
$$;
revoke all on function public.save_game_slot(integer,jsonb,bigint,uuid) from public,anon;
grant execute on function public.save_game_slot(integer,jsonb,bigint,uuid) to authenticated;
commit;
