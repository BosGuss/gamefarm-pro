# 🎮 GameFarm Pro — Next.js + Supabase + Netlify

## Tech Stack
- **Frontend:** Next.js 14 (Pages Router) + Tailwind CSS
- **Backend/Auth/DB:** Supabase (PostgreSQL + Auth + Realtime)
- **Deployment:** Netlify

---

## 🚀 เริ่มใช้งานใน VS Code

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.local.example .env.local
```
เปิดไฟล์ `.env.local` แล้วใส่ค่าจาก Supabase Dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. สร้างตารางใน Supabase (SQL Editor)
```sql
-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'customer',
  created_at timestamp default now()
);

-- Game Services
create table game_services (
  id serial primary key,
  game_name text not null,
  service_type text not null,
  price numeric not null,
  description text,
  created_at timestamp default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  booster_id uuid references profiles(id),
  service_id int references game_services(id),
  game_username text,
  game_password text,
  status text default 'pending',
  note text,
  created_at timestamp default now()
);

-- ข้อมูลบริการตัวอย่าง
insert into game_services (game_name, service_type, price, description) values
  ('ROV', 'ปั้มแรงค์ Diamond → Conqueror', 500, 'รับปั้มแรงค์ภายใน 7 วัน'),
  ('Genshin Impact', 'ฟาร์มของอัปเกรดตัวละคร', 300, 'เก็บ Resin และวัสดุครบตามที่ต้องการ'),
  ('Valorant', 'ไต่แรงค์ Gold → Platinum', 800, 'รับประกันไต่แรงค์ได้ตามเป้า'),
  ('ROV', 'แก้ไขปัญหาบัญชีและเควส', 200, 'แก้บัค เควสติดค้าง ปัญหาทั่วไป');

-- เปิด Row Level Security
alter table profiles enable row level security;
alter table orders enable row level security;

create policy "users_own_profile" on profiles for all using (auth.uid() = id);
create policy "customers_own_orders" on orders for all using (auth.uid() = customer_id);
```

### 4. รันโปรเจค
```bash
npm run dev
```
เปิด [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy บน Netlify

1. Push โค้ดขึ้น GitHub (`.env.local` ถูก `.gitignore` แล้ว)
2. ไปที่ [Netlify](https://netlify.com) → Add new site → Import from GitHub
3. Build settings จะถูกตั้งอัตโนมัติจาก `netlify.toml`
4. เพิ่ม Environment Variables ใน Netlify Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. กด **Deploy Site** ✅

---

## 📂 โครงสร้างโปรเจค
```
gamefarm-pro/
├── lib/
│   ├── supabase.js        # Supabase client
│   └── useAuth.js         # Custom hook สำหรับจัดการ Auth
├── pages/
│   ├── _app.js            # Global layout + CSS
│   ├── index.js           # Redirect อัตโนมัติ
│   ├── login.js           # หน้าเข้าสู่ระบบ / สมัครสมาชิก
│   ├── dashboard.js       # หน้าดูสถานะงาน (Realtime)
│   └── order.js           # หน้าส่งงานฟาร์มเกม
├── styles/
│   └── globals.css        # Tailwind CSS
├── .env.local.example     # Template ค่า Environment
├── netlify.toml           # Config สำหรับ Netlify
└── package.json
```
