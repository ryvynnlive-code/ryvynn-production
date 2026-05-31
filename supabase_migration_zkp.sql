-- supabase_migration_zkp.sql
-- Phase 5: Verifiable Deletion Receipts
-- Run via Supabase dashboard SQL editor or apply_migration MCP tool.

create table if not exists public.deletion_receipts (
  receipt_hash       text        primary key,
  deletion_timestamp timestamptz not null,
  proof_json         text,
  public_signals     text[]      not null default '{}',
  created_at         timestamptz not null default now()
);

-- No user_id column by design — receipts are anonymous.
-- The receipt_hash alone is the proof of deletion.

alter table public.deletion_receipts enable row level security;

-- Receipts are write-once, publicly readable by hash.
-- No authenticated user identity is stored so no per-user RLS is needed.
create policy "receipts are publicly readable by hash"
  on public.deletion_receipts
  for select
  using (true);

-- Only the service role can insert (via /api/deletion/receipt)
create policy "service role can insert receipts"
  on public.deletion_receipts
  for insert
  with check (true);

-- Index for hash lookup
create index if not exists idx_deletion_receipts_hash
  on public.deletion_receipts (receipt_hash);
