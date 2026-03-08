create table checklist_items (
    id uuid primary key default gen_random_uuid(),
    card_id uuid not null references cards(id) on delete cascade,
    title text not null default '',
    checked boolean not null default false,
    position text not null,
    created_at timestamptz not null default now()
);

alter table checklist_items enable row level security;
create policy "Allow all access to checklist_items" on checklist_items for all using (true) with check (true);

alter publication supabase_realtime add table checklist_items;
