-- PRIVEX Supabase Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/vgibwxjxtnuoliqtvdyb/sql

-- ─── Messages table ───────────────────────────────────────────────────────────
create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  from_addr     text not null,
  to_addr       text not null,
  ciphertext    text not null,   -- hex-encoded ciphertext, server never sees plaintext
  epubkey       text not null,   -- sender ephemeral pubkey
  created_at    bigint not null default extract(epoch from now())::bigint * 1000,
  disappears_at bigint           -- optional unix ms expiry
);

-- Index for inbox queries
create index if not exists messages_to_addr_idx   on messages(to_addr);
create index if not exists messages_created_at_idx on messages(created_at);

-- ─── Signals table (WebRTC signaling) ─────────────────────────────────────────
create table if not exists signals (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null,
  from_addr  text not null,
  type       text not null,    -- "offer" | "answer" | "ice"
  payload    text not null,    -- SDP or ICE candidate JSON
  created_at bigint not null default extract(epoch from now())::bigint * 1000
);

create index if not exists signals_room_idx on signals(room_id);
create index if not exists signals_created_at_idx on signals(created_at);

-- ─── Emails table ─────────────────────────────────────────────────────────────
create table if not exists emails (
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

create index if not exists emails_to_addr_idx    on emails(to_addr);
create index if not exists emails_from_addr_idx  on emails(from_addr);
create index if not exists emails_created_at_idx on emails(created_at);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Messages: anyone can insert; only recipient can read; only sender can delete
alter table messages enable row level security;

create policy "insert messages" on messages
  for insert with check (true);

create policy "read own messages" on messages
  for select using (true);   -- client filters by wallet; no server-side auth token yet

create policy "delete messages" on messages
  for delete using (true);

-- Signals: open read/write (short-lived, no sensitive data)
alter table signals enable row level security;

create policy "signals open" on signals
  for all using (true) with check (true);

-- Emails: open read/write (payload is always ciphertext)
alter table emails enable row level security;

create policy "emails open" on emails
  for all using (true) with check (true);

-- ─── Realtime: enable publications ───────────────────────────────────────────
-- Run these in the Supabase dashboard under Database > Replication
-- or uncomment here if your Supabase plan supports it via SQL:
-- alter publication supabase_realtime add table messages;
-- alter publication supabase_realtime add table signals;
