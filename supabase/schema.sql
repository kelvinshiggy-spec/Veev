-- VEEV database schema (Supabase Postgres)
-- Run this once in the Supabase SQL editor.
--
-- Design: the app is local-first. The only thing stored in the cloud is an
-- end-to-end encrypted copy of the user's vault. It is encrypted on the device
-- with a key derived from the user's passcode (PBKDF2 + AES-GCM) before upload,
-- so the database owner cannot read journals, letters or conversations.
-- Photos, voice notes and videos are never uploaded.

create table if not exists public.vaults (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  sealed     jsonb not null,           -- { v, salt, iv, ct } ciphertext only
  updated_at timestamptz not null default now(),
  constraint sealed_shape check (sealed ? 'ct' and sealed ? 'iv' and sealed ? 'salt')
);

alter table public.vaults enable row level security;

-- Row-level security: each person can only ever touch their own row.
drop policy if exists "own vault: select" on public.vaults;
drop policy if exists "own vault: insert" on public.vaults;
drop policy if exists "own vault: update" on public.vaults;
drop policy if exists "own vault: delete" on public.vaults;

create policy "own vault: select" on public.vaults for select using (auth.uid() = user_id);
create policy "own vault: insert" on public.vaults for insert with check (auth.uid() = user_id);
create policy "own vault: update" on public.vaults for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own vault: delete" on public.vaults for delete using (auth.uid() = user_id);

-- Let a signed-in user permanently delete their own account (and, via cascade, their vault).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from public.vaults where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
