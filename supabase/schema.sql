-- ============================================================
-- RESTAURANTE PWA — Schema
-- ============================================================

-- Categorías del menú
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text default '🍽️',
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Items del menú
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  available boolean default true,
  created_at timestamptz default now()
);

-- Mesas
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  capacity int not null default 4,
  active boolean default true
);

-- Pedidos
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  table_number int,
  customer_name text,
  status text not null default 'pending'
    check (status in ('pending','in_progress','ready','delivering','delivered')),
  notes text,
  total numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Items de cada pedido
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name text not null,
  price numeric(10,2) not null,
  quantity int not null default 1
);

-- Reservas de mesa
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  party_size int not null,
  date date not null,
  time time not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Trigger: actualizar updated_at en orders
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- RLS
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reservations enable row level security;

-- Políticas públicas de lectura (menú visible sin auth)
create policy "public read categories" on categories for select using (true);
create policy "public read menu_items" on menu_items for select using (true);
create policy "public read tables" on tables for select using (true);

-- Pedidos: usuarios ven los suyos, insertan libremente
create policy "insert orders" on orders for insert with check (true);
create policy "select own orders" on orders for select using (auth.uid() = user_id or user_id is null);
create policy "insert order_items" on order_items for insert with check (true);
create policy "select order_items" on order_items for select using (true);

-- Reservas
create policy "insert reservations" on reservations for insert with check (true);
create policy "select own reservations" on reservations for select using (auth.uid() = user_id or user_id is null);

-- Perfil público de usuario (evita fallos al crear cuentas si existe trigger en auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "select own profile" on profiles
  for select using (auth.uid() = id);

create policy "insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "update own profile" on profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed: categorías base
insert into categories (name, emoji, sort_order) values
  ('Entradas', '🥗', 1),
  ('Platos Fuertes', '🍖', 2),
  ('Postres', '🍰', 3),
  ('Bebidas', '🥤', 4)
on conflict do nothing;
