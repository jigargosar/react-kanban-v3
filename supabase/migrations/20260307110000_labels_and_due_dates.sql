create table public.labels (
    id         uuid primary key default gen_random_uuid(),
    board_id   uuid not null references public.boards(id),
    title      text not null,
    color      text not null,
    position   text not null,
    created_at timestamptz default now()
);

create table public.card_labels (
    card_id  uuid not null references public.cards(id),
    label_id uuid not null references public.labels(id),
    primary key (card_id, label_id)
);

alter table public.labels enable row level security;
alter table public.card_labels enable row level security;

create policy "Allow all for anon" on public.labels
    for all using (true) with check (true);

create policy "Allow all for anon" on public.card_labels
    for all using (true) with check (true);

alter publication supabase_realtime add table public.labels;
alter publication supabase_realtime add table public.card_labels;

alter table public.cards add column due_date timestamptz;
