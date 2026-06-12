# 🎯 Spec: Foundation — تأسيس مشروع يلا حجز

> **الميزة:** Foundation — إعداد البيئة + قاعدة البيانات + البنية التحتية
> **المرحلة:** 1 (الأسبوع 1-2)
> **الحالة:** ⏳ في انتظار الموافقة
> **التاريخ:** 2026-06-12

---

## 📌 What — ماذا سننفذ؟

تأسيس المشروع بالكامل من الصفر، يشمل:

1. **مشروع Expo** (React Native) — تطبيق اللاعب (Android + iOS)
2. **مشروع Next.js** — لوحات تحكم أصحاب الملاعب والـ Admin
3. **Supabase Project** — قاعدة بيانات PostgreSQL + Auth + Storage + Realtime
4. **21 جدول SQL** — مع Migrations + RLS Policies + Functions + Triggers
5. **Seed Data** — بيانات تجريبية أولية
6. **Git + CI/CD** — GitHub repo + GitHub Actions + Vercel + EAS Build

---

## 🤔 Why — لماذا هذه المرحلة أولاً؟

- بدون أساس قوي (Schema + Auth + Storage)، كل الميزات اللاحقة ستبنى على قاعدة هشة
- الـ TypeScript Types المُولدة من Supabase ستمنع أخطاء Runtime
- الـ RLS Policies تحمي البيانات من البداية بدل إضافتها لاحقًا
- الـ `book_slot()` function يمنع Race Conditions من أول حجز

---

## 🏗️ التفاصيل التقنية

### 1. مشروع Expo (Mobile App)

| العنصر | القيمة |
|---|---|
| **الأمر** | `npx create-expo-app@latest ./apps/mobile --template tabs` |
| **UI Framework** | NativeWind v4 (Tailwind CSS for RN) |
| **Navigation** | Expo Router v4 |
| **State** | Zustand |
| **Data Fetching** | TanStack Query v5 |
| **Minimum SDK** | Android 7.0 (API 24) / iOS 15.0 |

**الحزم المطلوبة:**
```
nativewind tailwindcss
@supabase/supabase-js
zustand
@tanstack/react-query
react-native-maps
react-native-reanimated
expo-router
expo-secure-store
```

**بنية الملفات:**
```
apps/mobile/
├── app/                    # Expo Router
│   ├── (auth)/
│   ├── (tabs)/
│   └── _layout.tsx
├── components/
├── lib/supabase.ts
├── stores/
├── types/supabase.ts
├── constants/
├── assets/
├── tailwind.config.js
└── app.json
```

---

### 2. مشروع Next.js (Dashboard)

| العنصر | القيمة |
|---|---|
| **الأمر** | `npx create-next-app@latest ./apps/dashboard --typescript --tailwind --app --src-dir` |
| **Components** | Shadcn UI + Radix |
| **Charts** | Recharts |
| **Tables** | TanStack Table |
| **Forms** | React Hook Form + Zod |

**الحزم المطلوبة:**
```
@supabase/supabase-js @supabase/ssr
recharts
@tanstack/react-table
react-hook-form @hookform/resolvers zod
```

**Shadcn Components المطلوبة:**
```bash
npx shadcn@latest add button card input label dialog
npx shadcn@latest add table tabs select badge avatar
npx shadcn@latest add dropdown-menu sidebar toast
npx shadcn@latest add form calendar chart
```

**بنية الملفات:**
```
apps/dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (owner)/
│   │   │   ├── pitches/
│   │   │   ├── bookings/
│   │   │   ├── schedule/
│   │   │   └── earnings/
│   │   ├── (admin)/
│   │   │   ├── users/
│   │   │   ├── pitches/
│   │   │   ├── ads/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/           # Shadcn
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   └── utils.ts
│   └── types/supabase.ts
├── tailwind.config.ts
└── next.config.ts
```

---

### 3. Supabase Setup

| العنصر | القيمة |
|---|---|
| **Plan** | Free tier (للتطوير) → Pro عند الإطلاق |
| **Region** | أقرب منطقة لمصر (eu-central-1 أو me-south-1) |
| **Auth Providers** | Phone OTP + Google + Apple |
| **Storage Buckets** | `pitch-images`, `avatars`, `ad-images` |
| **Extensions** | uuid-ossp, postgis, pg_trgm, moddatetime |

---

### 4. قاعدة البيانات — 21 جدول

> التفاصيل الكاملة في [Yalla_Book_Database_Schema.md](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/Yalla_Book_Database_Schema.md)

#### ملفات Migration المطلوبة:

```
supabase/migrations/
├── 00001_extensions.sql              # PostGIS + uuid-ossp + pg_trgm
├── 00002_functions.sql               # update_updated_at_column()
├── 00003_users.sql                   # users table + trigger + indexes
├── 00004_pitches.sql                 # pitches + GIST index + trgm
├── 00005_pitch_images.sql            # pitch_images
├── 00006_amenities.sql               # amenities + pitch_amenities + seed
├── 00007_pitch_schedules.sql         # pitch_schedules
├── 00008_time_slots.sql              # time_slots + indexes
├── 00009_bookings.sql                # bookings + indexes
├── 00010_payments.sql                # payments + idempotency
├── 00011_owner_payouts.sql           # owner_payouts
├── 00012_matches.sql                 # matches + match_players
├── 00013_reviews.sql                 # reviews + rating trigger
├── 00014_favorites.sql               # favorites
├── 00015_academies.sql               # academies + sessions + enrollments
├── 00016_advertisements.sql          # advertisements
├── 00017_notifications.sql           # notifications
├── 00018_reports.sql                 # reports
├── 00019_app_settings.sql            # app_settings + seed
├── 00020_audit_log.sql               # audit_log
├── 00021_booking_functions.sql       # book_slot() + cancel_booking()
├── 00022_rls_policies.sql            # كل RLS policies
├── 00023_views.sql                   # v_pitch_stats + v_available_slots
└── 00024_seed_data.sql               # Admin user + ملاعب تجريبية
```

---

### 5. Supabase Auth Setup

| Provider | التفاصيل |
|---|---|
| **Phone OTP** | Twilio أو MessageBird — SMS verification |
| **Google** | Google Cloud Console → OAuth 2.0 credentials |
| **Apple** | Apple Developer → Sign in with Apple |

**Auth Trigger** — إنشاء صف `users` تلقائيًا عند التسجيل:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, ''),
    NEW.email,
    'player'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 6. Supabase Storage

| Bucket | Access | الاستخدام |
|---|---|---|
| `pitch-images` | Public read / Owner write | صور الملاعب |
| `avatars` | Public read / User write | صور البروفايل |
| `ad-images` | Public read / Admin write | صور الإعلانات |

**Image Transformations:**
- Thumbnail: `width=200, height=200, resize=cover`
- Card: `width=400, height=300, resize=cover`
- Full: `width=1200, quality=80`

---

### 7. Git + Monorepo Structure

```
yalla-book/                        # Root
├── apps/
│   ├── mobile/                    # Expo (React Native)
│   └── dashboard/                 # Next.js
├── packages/
│   └── shared/                    # Shared types + utils
│       ├── types/supabase.ts
│       └── utils/
├── supabase/
│   ├── migrations/                # SQL migrations
│   ├── seed.sql
│   └── config.toml
├── .github/
│   └── workflows/
│       ├── lint.yml
│       └── deploy-dashboard.yml
├── package.json                   # Root package.json (workspaces)
├── turbo.json                     # Turborepo config (اختياري)
└── .gitignore
```

---

## 🎨 UI/UX — مكونات Shadcn + Tailwind المطلوبة

| المكون | الاستخدام |
|---|---|
| `Button` | كل الأزرار |
| `Card` | بطاقات الملاعب والإحصائيات |
| `Table` | جداول الحجوزات والمستخدمين |
| `Dialog` | تأكيد الحذف والتعديل |
| `Form` + `Input` | النماذج |
| `Select` | القوائم المنسدلة |
| `Tabs` | تبديل بين الأقسام |
| `Badge` | حالات (confirmed, pending, cancelled) |
| `Avatar` | صور المستخدمين |
| `Toast` | إشعارات نجاح/خطأ |
| `Sidebar` | القائمة الجانبية |
| `Calendar` | اختيار التواريخ |
| `Chart` | الرسوم البيانية |

**ألوان Tailwind المخصصة:**
```js
// tailwind.config.ts
colors: {
  primary: '#10B981',    // أخضر ملعب
  secondary: '#3B82F6',  // أزرق كهربائي
  accent: '#F59E0B',     // ذهبي
  dark: '#0F172A',       // خلفية داكنة
}
```

**خطوط عربية:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');
```

---

## ✅ معايير القبول (Acceptance Criteria)

1. ✅ مشروع Expo يعمل على المحاكي (Android + iOS)
2. ✅ مشروع Next.js يعمل محليًا على `localhost:3000`
3. ✅ كل الـ 21 جدول موجودة في Supabase
4. ✅ كل RLS Policies مفعلة ومختبرة
5. ✅ `book_slot()` و `cancel_booking()` يعملان بدون خطأ
6. ✅ Auth يعمل (Phone OTP على الأقل)
7. ✅ Storage buckets موجودة مع سياسات الوصول
8. ✅ TypeScript types مُولدة ومشتركة بين المشروعين
9. ✅ Git repo مع branch protection
10. ✅ Seed data (Admin + ملاعب تجريبية) موجودة

---

## ⚠️ المخاطر والتبعيات

| المخاطر | الحل |
|---|---|
| Twilio SMS قد يحتاج وقت للموافقة | استخدام Supabase local OTP أثناء التطوير |
| Apple Developer Account مطلوب ($99/سنة) | البدء بدون Apple Sign-In وإضافته لاحقًا |
| PostGIS قد لا يكون مفعل على Free tier | التحقق من Supabase docs — متاح على Free tier ✅ |
| Monorepo complexity | يمكن البدء بـ npm workspaces بسيطة بدون Turborepo |

---

## 📝 ملاحظات للوكلاء

- **Code Agent:** كل الكود بـ TypeScript strict mode
- **UI/UX Agent:** Shadcn UI + Tailwind فقط — لا CSS يدوي
- **Testing Agent:** اختبار كل RLS policy بعد الإنشاء
- **Git Agent:** commit بعد كل migration file
