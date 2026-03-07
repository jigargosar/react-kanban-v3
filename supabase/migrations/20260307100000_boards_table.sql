create table public.boards (
    id         uuid primary key default gen_random_uuid(),
    title      text not null,
    position   text not null,
    archived   boolean default false,
    created_at timestamptz default now()
);

alter table public.boards enable row level security;

create policy "Allow all for anon" on public.boards
    for all using (true) with check (true);

alter publication supabase_realtime add table public.boards;

alter table public.columns add column board_id uuid references public.boards(id);
