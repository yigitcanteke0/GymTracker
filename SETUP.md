# Kurulum Adımları

## 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) → New Project
2. Project Settings → API bölümünden şu değerleri kopyala:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Ortam Değişkenlerini Ayarla

`.env.local` dosyasını düzenle:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

## 3. Veritabanı Şemasını Kur

Supabase Dashboard → SQL Editor → `supabase/schema.sql` dosyasının tüm içeriğini yapıştır ve çalıştır.

Bu işlem şunları oluşturur:
- `muscle_groups` tablosu (8 kas grubu seed ile)
- `exercises` tablosu (50+ sistem egzersizi seed ile)
- `workouts` tablosu
- `workout_sets` tablosu
- Row Level Security politikaları

## 4. Supabase Auth Ayarları

Supabase Dashboard → Authentication → Providers:
- Email provider aktif olduğunu kontrol et
- (Opsiyonel) Email confirmation'ı development için kapat:
  Authentication → Email Templates → Confirm signup → deaktif

## 5. Yerel Geliştirme

```bash
npm run dev
```

`http://localhost:3000` adreste açılır.

## 6. Vercel'e Deploy

```bash
# GitHub repo oluştur ve push'la
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/KULLANICI/workout-tracker.git
git push -u origin main
```

Vercel Dashboard → Import Project → Repository seç → Environment Variables ekle:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

## Proje Yapısı

```
src/
├── app/
│   ├── page.tsx              # Dashboard (/)
│   ├── login/page.tsx        # Giriş (/login)
│   ├── signup/page.tsx       # Kayıt (/signup)
│   ├── auth/callback/        # OAuth callback
│   ├── workout/
│   │   ├── active/page.tsx   # Aktif antrenman (/workout/active)
│   │   └── [id]/page.tsx     # Antrenman detayı (/workout/:id)
│   ├── history/page.tsx      # Geçmiş (/history)
│   └── exercises/page.tsx    # Egzersiz kütüphanesi (/exercises)
├── components/
│   ├── ui/                   # Temel UI bileşenleri
│   └── workout/              # Antrenman spesifik bileşenler
├── lib/
│   ├── supabase/client.ts    # Browser Supabase client
│   ├── supabase/server.ts    # Server Supabase client
│   └── utils.ts              # Yardımcı fonksiyonlar
├── types/index.ts            # TypeScript tipleri
└── proxy.ts                  # Auth route koruması
supabase/
└── schema.sql                # Veritabanı şeması + seed data
```
