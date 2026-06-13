# 🚀 المواصفات التقنية للمرحلة الثانية: MVP Core & Backend
> **ملف المرجعية التقنية للمرحلة الثانية** — لا تتجاوز هذه المواصفات أو تغيرها دون موافقة.

## 1. أهداف المرحلة 🎯
بناء الواجهات الأساسية (التي لا غنى عنها) في تطبيق اللاعب وتطبيق لوحة التحكم، بالإضافة إلى وظائف الـ Backend المتقدمة (Edge Functions + Storage).

## 2. إعدادات Supabase Storage & Auth (2.11, 2.12)
### Storage Buckets
يجب تهيئتها إما من الـ Dashboard أو عبر ملف SQL Migration إضافي `00025_storage.sql`:
1. `pitch-images`: للصور الخاصة بالملاعب (public: true)
2. `avatars`: لصور اللاعبين والمدربين (public: true)
3. `ad-images`: للبنرات الإعلانية (public: true)

### Auth Configuration
- تفعيل Email/Password
- تجهيز هيكل لـ Phone OTP + Google + Apple في ملف `.env`.

## 3. تطبيق اللاعب (Mobile - React Native)
### المجلدات الأساسية:
- `app/(auth)/`: login, register, complete-profile
- `app/(tabs)/`: index (Home), map (Search), bookings (حجوزاتي), profile (حسابي)
- `app/pitch/[id].tsx`: تفاصيل الملعب مع الحجز

### State Management:
- **Zustand**: `useAuthStore` لإدارة حالة المستخدم (User + Session).
- **React Query**: `usePitches`, `useBookings` لجلب البيانات مع Caching.

## 4. لوحة تحكم الإدارة (Web - Next.js)
### المكونات الأساسية (Shadcn UI):
- DataTable لعرض الحجوزات والملاعب
- Forms مع Zod Validation لإنشاء الملاعب
- Charts للإحصائيات المالية

### هيكل المجلدات:
- `src/app/(auth)`
- `src/app/(owner)`: dashboard, pitches, schedules, bookings
- `src/app/(admin)`: dashboard, users, approvals, ads

## 5. وظائف الحجز والبحث (Edge Functions)
### دوال الحجز (Atomic Booking)
اعتمدنا على Postgres Function `book_slot` لمنع Race conditions، لذا يجب فقط مناداتها عبر `supabase.rpc('book_slot', {...})`

### البحث الجغرافي (PostGIS)
استدعاء استعلام مباشر أو RPC لجلب أقرب الملاعب باستخدام:
`ST_DistanceSphere(location, ST_MakePoint(lon, lat))`

## 6. مهام القبول (Acceptance Criteria)
1. يمكن للاعب فتح التطبيق، رؤية قائمة ملاعب، اختيار وقت، وتأكيد الحجز.
2. لا يمكن للاعبين مختلفين حجز نفس الوقت في نفس اللحظة (Race condition prevented).
3. يمكن لصاحب الملعب تسجيل الدخول ورؤية الحجز الذي تم.
