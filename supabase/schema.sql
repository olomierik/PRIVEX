-- PRIVEX Supabase Schema v2
-- SECURITY: Row Level Security enforced by wallet address header.
-- The client sends x-wallet-address on every request (set via supabase.ts interceptor).
-- Supabase passes custom headers through to Postgres as request.headers (jsonb).
-- RLS policies read current_wallet() to enforce per-user row visibility.
--
-- Run the FULL file in: https://supabase.com/dashboard/project/vgibwxjxtnuoliqtvdyb/sql
-- Drop and recreate if re-running.

-- ─── Helper: extract wallet address from request headers ──────────────────────
create or replace function current_wallet()
returns text
language sql
stable
as $$
  select nullif(
    lower(trim(
      (current_setting('request.headers', true)::jsonb ->> 'x-wallet-address')
    )),
    ''
  )
$$;

-- ─── Messages ─────────────────────────────────────────────────────────────────
drop table if exists messages cascade;
create table messages (
  id            uuid primary key default gen_random_uuid(),
  from_addr     text not null,
  to_addr       text not null,
  ciphertext    text not null,
  epubkey       text not null,
  created_at    bigint not null default extract(epoch from now())::bigint * 1000,
  disappears_at bigint
);

create index messages_to_addr_idx    on messages(to_addr);
create index messages_from_addr_idx  on messages(from_addr);
create index messages_created_at_idx on messages(created_at);

alter table messages enable row level security;

-- Only the sender can insert their own messages
create policy "messages: insert as self" on messages
  for insert
  with check (lower(from_addr) = current_wallet());

-- Only sender OR recipient can read a message
create policy "messages: read own" on messages
  for select
  using (
    lower(to_addr)   = current_wallet()
    or lower(from_addr) = current_wallet()
  );

-- Only the sender can delete their own messages
create policy "messages: delete own" on messages
  for delete
  using (lower(from_addr) = current_wallet());

-- ─── Signals (WebRTC — short-lived, no sensitive content) ─────────────────────
drop table if exists signals cascade;
create table signals (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null,
  from_addr  text not null,
  type       text not null,
  payload    text not null,
  created_at bigint not null default extract(epoch from now())::bigint * 1000
);

create index signals_room_idx       on signals(room_id);
create index signals_created_at_idx on signals(created_at);

alter table signals enable row level security;

-- Any authenticated wallet can post a signal
create policy "signals: insert as self" on signals
  for insert
  with check (current_wallet() is not null);

-- Only participants in the room can read signals
-- Room ID format: sorted(addrA, addrB) joined by ':' — enforced client-side
create policy "signals: read room participant" on signals
  for select
  using (
    current_wallet() is not null
    and (
      room_id like ('%' || current_wallet() || '%')
    )
  );

-- Sender can delete
create policy "signals: delete own" on signals
  for delete
  using (lower(from_addr) = current_wallet());

-- ─── Emails ───────────────────────────────────────────────────────────────────
drop table if exists emails cascade;
create table emails (
  id              uuid primary key default gen_random_uuid(),
  from_addr       text not null,
  to_addr         text not null,
  subject_cipher  text not null,
  body_cipher     text not null,
  subject_iv      text not null,
  body_iv         text not null,
  sender_pubkey   text not null,
  attachment_id   text,
  attachment_name text,
  attachment_size bigint,
  created_at      bigint not null default extract(epoch from now())::bigint * 1000,
  disappears_at   bigint,
  is_draft        boolean not null default false
);

create index emails_to_addr_idx    on emails(to_addr);
create index emails_from_addr_idx  on emails(from_addr);
create index emails_created_at_idx on emails(created_at);

alter table emails enable row level security;

-- Only sender can insert
create policy "emails: insert as self" on emails
  for insert
  with check (lower(from_addr) = current_wallet());

-- Sender can read sent mail + drafts; recipient can read received mail
create policy "emails: read own" on emails
  for select
  using (
    lower(to_addr)   = current_wallet()
    or lower(from_addr) = current_wallet()
  );

-- Sender can update drafts
create policy "emails: update own draft" on emails
  for update
  using (lower(from_addr) = current_wallet())
  with check (lower(from_addr) = current_wallet());

-- Sender or recipient can delete
create policy "emails: delete own" on emails
  for delete
  using (
    lower(from_addr) = current_wallet()
    or lower(to_addr) = current_wallet()
  );

-- ─── Public keys table (for key discovery) ────────────────────────────────────
drop table if exists pubkeys cascade;
create table pubkeys (
  wallet_addr text primary key,
  pubkey_hex  text not null,
  updated_at  bigint not null default extract(epoch from now())::bigint * 1000
);

alter table pubkeys enable row level security;

-- Anyone can read public keys (they are public by definition)
create policy "pubkeys: read all" on pubkeys
  for select
  using (true);

-- Only the wallet owner can upsert their own pubkey
create policy "pubkeys: upsert own" on pubkeys
  for insert
  with check (lower(wallet_addr) = current_wallet());

create policy "pubkeys: update own" on pubkeys
  for update
  using (lower(wallet_addr) = current_wallet())
  with check (lower(wallet_addr) = current_wallet());

-- ─── Handles table (handle → wallet + pubkey discovery) ──────────────────────
drop table if exists handles cascade;
create table handles (
  handle      text primary key,               -- e.g. "alice" (no @privex suffix)
  wallet_addr text not null unique,
  pubkey_hex  text not null,
  updated_at  bigint not null default extract(epoch from now())::bigint * 1000
);

create index handles_wallet_idx on handles(wallet_addr);

alter table handles enable row level security;

-- Anyone can read handles (they are public identities)
create policy "handles: read all" on handles
  for select
  using (true);

-- Only the wallet owner can register/update their own handle
create policy "handles: upsert own" on handles
  for insert
  with check (lower(wallet_addr) = current_wallet());

create policy "handles: update own" on handles
  for update
  using (lower(wallet_addr) = current_wallet())
  with check (lower(wallet_addr) = current_wallet());

-- ─── Realtime publications ────────────────────────────────────────────────────
-- Run in Supabase dashboard: Database > Replication > supabase_realtime
-- or uncomment:
-- alter publication supabase_realtime add table messages;
-- alter publication supabase_realtime add table signals;
-- alter publication supabase_realtime add table emails;
-- alter publication supabase_realtime add table pubkeys;
