create table public.columns (
    id       uuid primary key default gen_random_uuid(),
    title    text not null,
    position text not null,
    archived boolean default false,
    created_at timestamptz default now()
);

create table public.cards (
    id          uuid primary key default gen_random_uuid(),
    column_id   uuid not null references public.columns(id),
    title       text not null,
    description text default '',
    position    text not null,
    archived    boolean default false,
    created_at  timestamptz default now()
);

alter table public.columns enable row level security;
alter table public.cards enable row level security;

create policy "Allow all for anon" on public.columns
    for all using (true) with check (true);

create policy "Allow all for anon" on public.cards
    for all using (true) with check (true);

alter publication supabase_realtime add table public.columns;
alter publication supabase_realtime add table public.cards;
