create table public.spike_items (
    id       uuid primary key default gen_random_uuid(),
    text     text not null,
    position text not null,
    created  timestamptz default now()
);

alter table public.spike_items enable row level security;

create policy "Allow all for anon" on public.spike_items
    for all using (true) with check (true);

alter publication supabase_realtime add table public.spike_items;
