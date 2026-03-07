-- Comments table
create table if not exists comments (
    id uuid primary key default gen_random_uuid(),
    card_id uuid not null references cards(id) on delete cascade,
    author_name text not null default 'Anonymous',
    content text not null,
    created_at timestamptz not null default now()
);

create index idx_comments_card_id on comments(card_id);

alter table comments enable row level security;
create policy "Allow all access to comments" on comments for all using (true) with check (true);
alter publication supabase_realtime add table comments;

-- Cover color on cards
alter table cards add column if not exists cover_color text;
