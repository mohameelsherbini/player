# 🏟️ Yalla Book — قائمة المهام التفصيلية

> مستخرجة من [Implementation Plan v2.0](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/implementationplan.md)
> Database Schema: [Yalla_Book_Database_Schema.md](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/Yalla_Book_Database_Schema.md)

---

## المرحلة 1: Foundation — التأسيس (الأسبوع 1-2) 🏗️

### الأسبوع 1: إعداد المشاريع والبيئة

- [ ] **1.1** إنشاء مشروع Expo مع NativeWind
  - [ ] `npx create-expo-app@latest yalla-book --template tabs`
  - [ ] تثبيت NativeWind + Tailwind CSS
  - [ ] تثبيت Expo Router
  - [ ] إعداد ملف `tailwind.config.js`
  - [ ] إعداد RTL support

- [ ] **1.2** إنشاء مشروع Next.js للـ Dashboard
  - [ ] `npx create-next-app@latest yalla-book-dashboard --typescript --tailwind --app --src-dir`
  - [ ] تثبيت Shadcn UI (`npx shadcn@latest init`)
  - [ ] إعداد Shadcn components الأساسية (Button, Card, Table, Dialog, Form, Input)
  - [ ] إعداد RTL + Arabic fonts (Cairo/Tajawal)

- [ ] **1.3** إنشاء Supabase Project
  - [ ] إنشاء مشروع على Supabase Cloud
  - [ ] `npx supabase init` محليًا
  - [ ] `npx supabase link --project-ref [REF]`
  - [ ] إعداد `.env` files (Mobile + Dashboard)

- [ ] **1.4** إعداد Git + CI/CD
  - [ ] إنشاء GitHub repository (monorepo)
  - [ ] إعداد `.gitignore` + branch protection rules
  - [ ] إعداد GitHub Actions (lint + type-check)
  - [ ] إعداد Vercel deployment للـ Dashboard
  - [ ] إعداد EAS Build للـ Mobile app

### الأسبوع 2: قاعدة البيانات والبنية التحتية

- [ ] **2.1** تفعيل PostgreSQL Extensions
  - [ ] `uuid-ossp` — توليد UUID
  - [ ] `postgis` — البحث الجغرافي
  - [ ] `pg_trgm` — البحث النصي
  - [ ] `moddatetime` — تحديث timestamps

- [ ] **2.2** كتابة SQL Migrations — Core Tables
  - [ ] `users` — المستخدمين
  - [ ] `pitches` — الملاعب (+ PostGIS location)
  - [ ] `pitch_images` — صور الملاعب
  - [ ] `amenities` — المرافق (lookup)
  - [ ] `pitch_amenities` — ربط ملاعب/مرافق
  - [ ] `pitch_schedules` — الجدول الأسبوعي
  - [ ] `time_slots` — الفتحات الزمنية

- [ ] **2.3** كتابة SQL Migrations — Booking & Payments
  - [ ] `bookings` — الحجوزات
  - [ ] `payments` — المعاملات المالية
  - [ ] `owner_payouts` — تسويات أصحاب الملاعب

- [ ] **2.4** كتابة SQL Migrations — Social
  - [ ] `matches` — المباريات المفتوحة
  - [ ] `match_players` — المشاركين (PK مركب)
  - [ ] `reviews` — التقييمات
  - [ ] `favorites` — المفضلات

- [ ] **2.5** كتابة SQL Migrations — Academy
  - [ ] `academies` — الأكاديميات
  - [ ] `academy_sessions` — الجلسات التدريبية
  - [ ] `session_enrollments` — التسجيل في الجلسات

- [ ] **2.6** كتابة SQL Migrations — Platform
  - [ ] `advertisements` — الإعلانات
  - [ ] `notifications` — الإشعارات
  - [ ] `reports` — البلاغات
  - [ ] `app_settings` — إعدادات المنصة
  - [ ] `audit_log` — سجل التدقيق

- [ ] **2.7** إنشاء Database Functions
  - [ ] `update_updated_at_column()` — Trigger عام
  - [ ] `book_slot()` — حجز آمن (Atomic + FOR UPDATE)
  - [ ] `cancel_booking()` — إلغاء مع سياسة الإلغاء
  - [ ] `update_pitch_rating()` — تحديث التقييم تلقائيًا

- [ ] **2.8** تطبيق Triggers على كل الجداول
  - [ ] `updated_at` trigger على كل الجداول
  - [ ] `update_pitch_rating` trigger على `reviews`

- [ ] **2.9** كتابة RLS Policies
  - [ ] سياسات `users` (قراءة + تعديل الملف الشخصي)
  - [ ] سياسات `pitches` (قراءة عامة + إدارة المالك + Admin)
  - [ ] سياسات `bookings` (اللاعب + صاحب الملعب + Admin)
  - [ ] سياسات `time_slots` (قراءة عامة + إدارة المالك)
  - [ ] سياسات `reviews` (قراءة عامة + إنشاء/تعديل اللاعب)
  - [ ] سياسات `favorites` (اللاعب فقط)
  - [ ] سياسات `matches` + `match_players`
  - [ ] سياسات `notifications` (المستخدم فقط)
  - [ ] سياسات `payments` (اللاعب + Admin)
  - [ ] سياسات `advertisements` (عرض عامة + إدارة Admin)

- [ ] **2.10** إدخال Seed Data
  - [ ] إدخال المرافق الافتراضية (10 مرافق)
  - [ ] إنشاء Admin user
  - [ ] إنشاء 3-5 ملاعب تجريبية مع صور وأوقات
  - [ ] إدخال إعدادات المنصة الافتراضية (`app_settings`)

- [ ] **2.11** إعداد Supabase Auth
  - [ ] تفعيل Phone OTP provider
  - [ ] تفعيل Google OAuth
  - [ ] تفعيل Apple Sign-In
  - [ ] إعداد Auth trigger لإنشاء صف في `users` تلقائيًا

- [ ] **2.12** إعداد Supabase Storage
  - [ ] إنشاء bucket `pitch-images` (public read)
  - [ ] إنشاء bucket `avatars` (public read)
  - [ ] إنشاء bucket `ad-images` (public read)
  - [ ] كتابة Storage policies

- [ ] **2.13** توليد TypeScript Types
  - [ ] `npx supabase gen types typescript --local > types/supabase.ts`
  - [ ] مشاركة الـ Types بين Mobile و Dashboard

---

## المرحلة 2: MVP Core — النواة (الأسبوع 3-6) 🚀

### الأسبوع 3-4: تطبيق اللاعب (الأساسيات)

- [ ] **3.1** Supabase Client Setup (Mobile)
  - [ ] إعداد `supabase.ts` client
  - [ ] إعداد Auth hooks (`useUser`, `useSession`)
  - [ ] إعداد Zustand auth store

- [ ] **3.2** شاشة الترحيب (Onboarding)
  - [ ] 3 slides تعريفية مع صور وتحريكات
  - [ ] زر "ابدأ الآن" → شاشة التسجيل
  - [ ] تخزين حالة "تم العرض" في AsyncStorage

- [ ] **3.3** شاشة التسجيل والدخول
  - [ ] تسجيل/دخول بـ Phone OTP
  - [ ] تسجيل/دخول بـ Google
  - [ ] تسجيل/دخول بـ Apple
  - [ ] شاشة إدخال OTP مع عداد إعادة الإرسال
  - [ ] شاشة إكمال الملف (الاسم + المدينة) — أول مرة فقط

- [ ] **3.4** شاشة الرئيسية (Home)
  - [ ] Header مع شعار + إشعارات + بحث سريع
  - [ ] قسم "الملاعب القريبة منك" (PostGIS query)
  - [ ] قسم "الملاعب المميزة" (Featured)
  - [ ] أزرار فلترة سريعة (كرة قدم / بادل / بادبول)
  - [ ] مكان Banner إعلاني
  - [ ] Pull-to-refresh

- [ ] **3.5** شاشة البحث والفلترة
  - [ ] بحث نصي بالاسم (pg_trgm)
  - [ ] فلترة حسب: نوع الرياضة، المدينة، نطاق السعر، التقييم، الحجم
  - [ ] خريطة تفاعلية مع Markers
  - [ ] تبديل عرض (قائمة / خريطة)
  - [ ] ترتيب (الأقرب / الأرخص / الأعلى تقييمًا)

- [ ] **3.6** شاشة تفاصيل الملعب
  - [ ] Image Gallery (swipeable)
  - [ ] معلومات الملعب (اسم، نوع، حجم، أرضية، سعر)
  - [ ] قائمة المرافق مع أيقونات
  - [ ] الموقع على الخريطة + زر التوجيه (Google Maps / Waze)
  - [ ] التقييمات والمراجعات (أحدث 5)
  - [ ] زر "إضافة للمفضلات" ❤️
  - [ ] قسم الأوقات المتاحة (الخطوة التالية)

- [ ] **3.7** شاشة اختيار الوقت والحجز
  - [ ] تقويم أفقي لاختيار اليوم (7 أيام قادمة)
  - [ ] Grid الأوقات المتاحة (أخضر = متاح، رمادي = محجوز)
  - [ ] Realtime subscription لتحديث الأوقات فوريًا
  - [ ] ملخص الحجز (الملعب + التاريخ + الوقت + السعر)
  - [ ] اختيار طريقة الدفع
  - [ ] زر "تأكيد الحجز" → `book_slot()` function

- [ ] **3.8** شاشة الملف الشخصي
  - [ ] عرض/تعديل الاسم + الهاتف + البريد + المدينة
  - [ ] رفع/تغيير صورة البروفايل (Supabase Storage)
  - [ ] تبديل اللغة (عربي / إنجليزي)
  - [ ] تبديل الثيم (Dark / Light)
  - [ ] تسجيل الخروج

### الأسبوع 5: الدفع + حجوزاتي

- [ ] **5.1** تكامل Paymob
  - [ ] إعداد Paymob Sandbox account
  - [ ] تكامل الدفع بالبطاقة (Visa/Mastercard)
  - [ ] تكامل Fawry
  - [ ] تكامل المحافظ الإلكترونية (Vodafone Cash / Orange Cash)
  - [ ] خيار الدفع الكاش (Cash on arrival)
  - [ ] إنشاء Edge Function لـ Payment Webhook
  - [ ] تسجيل المعاملة في جدول `payments`
  - [ ] إنشاء Idempotency key لكل معاملة

- [ ] **5.2** شاشة حجوزاتي (My Bookings)
  - [ ] Tab "القادمة" — حجوزات مستقبلية مع عد تنازلي
  - [ ] Tab "السابقة" — حجوزات منتهية
  - [ ] تفاصيل الحجز (ملعب + تاريخ + وقت + كود الحجز)
  - [ ] زر "إلغاء الحجز" مع تأكيد + سياسة الإلغاء
  - [ ] زر "قيّم الملعب" (يظهر بعد انتهاء الحجز)
  - [ ] زر "إعادة الحجز" (نفس الملعب + وقت مختلف)

- [ ] **5.3** Push Notifications الأساسية
  - [ ] إعداد Firebase Cloud Messaging
  - [ ] حفظ FCM token في `users.fcm_token`
  - [ ] Edge Function لإرسال إشعار "تم تأكيد الحجز"
  - [ ] Edge Function لإرسال تذكير قبل المباراة بساعة
  - [ ] Edge Function لإرسال إشعار "تم إلغاء الحجز"

### الأسبوع 6: لوحات التحكم

- [ ] **6.1** Supabase Client Setup (Dashboard)
  - [ ] إعداد `supabase.ts` client
  - [ ] إعداد Auth middleware (Next.js)
  - [ ] حماية الصفحات حسب الدور (owner / admin)

- [ ] **6.2** Dashboard Layout
  - [ ] Sidebar مع تنقل (Shadcn)
  - [ ] Header مع معلومات المستخدم + تسجيل خروج
  - [ ] RTL layout
  - [ ] Dark/Light mode toggle

- [ ] **6.3** لوحة صاحب الملعب — إضافة ملعب
  - [ ] Wizard متعدد الخطوات:
    - الخطوة 1: المعلومات الأساسية (اسم، رياضة، حجم، أرضية)
    - الخطوة 2: رفع الصور (drag & drop + crop)
    - الخطوة 3: اختيار المرافق (checkboxes)
    - الخطوة 4: تحديد الموقع (خريطة + عنوان)
    - الخطوة 5: الجدول الأسبوعي (أيام + أوقات + أسعار)
  - [ ] حفظ كـ "معلق" (pending) لانتظار موافقة Admin

- [ ] **6.4** لوحة صاحب الملعب — إدارة الأوقات
  - [ ] عرض الجدول الأسبوعي (جدول/تقويم)
  - [ ] تعديل الأوقات والأسعار
  - [ ] حظر/فتح أوقات يدويًا
  - [ ] Edge Function لتوليد `time_slots` من `pitch_schedules`

- [ ] **6.5** لوحة صاحب الملعب — الحجوزات
  - [ ] جدول الحجوزات اليومي/الأسبوعي/الشهري
  - [ ] فلترة حسب الحالة (confirmed / cancelled / pending)
  - [ ] تفاصيل الحجز (اللاعب + الوقت + الدفع)

- [ ] **6.6** لوحة صاحب الملعب — الأرباح
  - [ ] ملخص الأرباح (الإجمالي + العمولة + الصافي)
  - [ ] رسم بياني (Recharts) — الأرباح الشهرية
  - [ ] جدول تفصيلي للحجوزات مع المبالغ

- [ ] **6.7** لوحة Admin — إدارة المستخدمين
  - [ ] جدول المستخدمين (TanStack Table)
  - [ ] فلترة حسب الدور
  - [ ] تغيير الدور (player → owner / admin)
  - [ ] إيقاف/تفعيل حساب

- [ ] **6.8** لوحة Admin — الموافقة على الملاعب
  - [ ] قائمة الملاعب المعلقة (Pending)
  - [ ] عرض تفاصيل الملعب + الصور
  - [ ] قبول / رفض (مع سبب)

- [ ] **6.9** لوحة Admin — الإحصائيات
  - [ ] عدد المستخدمين الجدد (يوم/أسبوع/شهر)
  - [ ] عدد الحجوزات المؤكدة
  - [ ] إجمالي الإيرادات + العمولات
  - [ ] رسوم بيانية (Recharts)

---

## المرحلة 3: Social & Matching (الأسبوع 7-9) ⚽

### الأسبوع 7: المباريات المفتوحة

- [ ] **7.1** شاشة المباريات المفتوحة (Mobile)
  - [ ] عرض قائمة المباريات المفتوحة (public + open)
  - [ ] فلترة (رياضة، مدينة، تاريخ)
  - [ ] بطاقة المباراة (ملعب + وقت + لاعبين + تكلفة)
  - [ ] عرض على الخريطة

- [ ] **7.2** إنشاء مباراة جديدة
  - [ ] اختيار ملعب (من المفضلات أو بحث)
  - [ ] اختيار وقت (من الأوقات المتاحة)
  - [ ] تحديد نوع المباراة (public / private)
  - [ ] تحديد عدد اللاعبين المطلوبين
  - [ ] حساب `cost_per_player` تلقائيًا
  - [ ] إضافة وصف (اختياري)
  - [ ] حجز الملعب + إنشاء المباراة

- [ ] **7.3** الانضمام لمباراة
  - [ ] شاشة تفاصيل المباراة (اللاعبين المنضمين + المتبقي)
  - [ ] زر "انضمام" → دفع حصة اللاعب
  - [ ] تحديث `current_players` تلقائيًا
  - [ ] تغيير الحالة إلى `full` عند الاكتمال
  - [ ] إشعار لكل اللاعبين عند الاكتمال

### الأسبوع 8: التقييمات والمفضلات

- [ ] **8.1** نظام التقييمات (Mobile)
  - [ ] شاشة "قيّم الملعب" (1-5 نجوم + تعليق)
  - [ ] يظهر فقط بعد انتهاء الحجز
  - [ ] عرض التقييمات في صفحة الملعب
  - [ ] Trigger `update_pitch_rating()` يحدث `avg_rating` تلقائيًا

- [ ] **8.2** رد صاحب الملعب على التقييمات (Dashboard)
  - [ ] قائمة التقييمات الجديدة في لوحة التحكم
  - [ ] كتابة رد (يظهر تحت التقييم)

- [ ] **8.3** المفضلات (Mobile)
  - [ ] زر ❤️ في بطاقة الملعب + صفحة التفاصيل
  - [ ] شاشة "ملاعبي المفضلة" (tab فرعي في Profile)
  - [ ] Optimistic update مع TanStack Query

- [ ] **8.4** البحث المتقدم
  - [ ] بحث نصي باستخدام `pg_trgm` (اسم الملعب)
  - [ ] فلترة متعددة المعايير (Combined filters)
  - [ ] ترتيب النتائج (الأقرب / الأرخص / الأعلى تقييمًا)
  - [ ] Pagination + Infinite scroll

### الأسبوع 9: الإشعارات المتقدمة + Realtime

- [ ] **9.1** مركز الإشعارات (Mobile)
  - [ ] شاشة الإشعارات (قائمة مع أيقونات وألوان حسب النوع)
  - [ ] Badge عدد الإشعارات غير المقروءة
  - [ ] تمييز المقروء/غير المقروء
  - [ ] النقر → Deep link إلى الشاشة المعنية
  - [ ] زر "تمييز الكل كمقروء"

- [ ] **9.2** Realtime Subscriptions
  - [ ] Realtime على `time_slots` → تحديث فوري في شاشة الحجز
  - [ ] Realtime على `match_players` → تحديث عدد اللاعبين
  - [ ] Realtime على `bookings` → إشعار فوري لصاحب الملعب
  - [ ] Realtime على `notifications` → Badge update

---

## المرحلة 4: Monetization & Growth (الأسبوع 10-11) 💰

### الأسبوع 10: الإعلانات + Featured Pitches

- [ ] **10.1** نظام الإعلانات — Admin Dashboard
  - [ ] شاشة إنشاء إعلان (صورة + رابط + فترة + placement)
  - [ ] استهداف جغرافي (مدينة) + حسب الرياضة
  - [ ] جدول الإعلانات النشطة/المعلقة/المنتهية
  - [ ] تقرير أداء (impressions + clicks + CTR)

- [ ] **10.2** عرض الإعلانات — Mobile
  - [ ] Banner component في الصفحة الرئيسية
  - [ ] إعلان بين نتائج البحث (كل 5 نتائج)
  - [ ] تسجيل impression عند العرض
  - [ ] تسجيل click عند النقر

- [ ] **10.3** Featured Pitches
  - [ ] شاشة "ترقية ملعبي" في لوحة صاحب الملعب
  - [ ] اختيار فترة الظهور المميز
  - [ ] عرض الملاعب المميزة أولاً في نتائج البحث
  - [ ] علامة ⭐ على بطاقة الملعب المميز

### الأسبوع 11: الأكاديميات + التقارير

- [ ] **11.1** الأكاديميات والجلسات (Dashboard + Mobile)
  - [ ] إنشاء أكاديمية (للمدربين) — Dashboard
  - [ ] إضافة جلسة تدريبية (تاريخ + وقت + ملعب + سعر + مستوى)
  - [ ] شاشة الأكاديميات في التطبيق — قائمة + فلترة
  - [ ] تفاصيل الجلسة + زر "سجل الآن"
  - [ ] تسجيل + دفع
  - [ ] متابعة المسجلين (Dashboard)

- [ ] **11.2** التقارير المتقدمة — Admin Dashboard
  - [ ] تقرير مالي شامل (إيرادات + عمولات + تسويات + Recharts)
  - [ ] تقرير النشاط (حجوزات/يوم + مستخدمين جدد/أسبوع)
  - [ ] تقرير الملاعب (الأكثر حجزًا + الأعلى تقييمًا)
  - [ ] تصدير PDF / Excel

- [ ] **11.3** التقارير — Owner Dashboard
  - [ ] تقرير الأرباح الشهري التفصيلي
  - [ ] نسبة الإشغال (occupancy rate)
  - [ ] أوقات الذروة (peak hours)
  - [ ] تصدير PDF

---

## المرحلة 5: Testing & Polish (الأسبوع 12-13) 🧪

### الأسبوع 12: الاختبار

- [ ] **12.1** Unit Tests
  - [ ] Database functions (`book_slot`, `cancel_booking`)
  - [ ] RLS policies (كل سياسة على حدة)
  - [ ] Business logic (حساب العمولة، تقسيم التكلفة)

- [ ] **12.2** Integration Tests
  - [ ] تدفق الحجز الكامل (بحث → اختيار → دفع → تأكيد)
  - [ ] تدفق التسجيل (OTP → حساب → ملف)
  - [ ] تدفق صاحب الملعب (ملعب → جدول → حجوزات)

- [ ] **12.3** Load Testing
  - [ ] اختبار الحجز المتزامن (10+ مستخدم على نفس الوقت)
  - [ ] اختبار أداء البحث الجغرافي (1000+ ملعب)
  - [ ] اختبار Realtime (100+ مستخدم)

- [ ] **12.4** Security Testing
  - [ ] اختبار RLS policies يدويًا (player, owner, admin)
  - [ ] اختبار Edge Cases (حجز محظور، إلغاء متأخر)
  - [ ] مراجعة أمنية API endpoints

### الأسبوع 13: التنقيح والأداء

- [ ] **13.1** Performance Optimization
  - [ ] Lazy loading للصور (Mobile + Dashboard)
  - [ ] Image optimization (WebP + thumbnails via Supabase Transformations)
  - [ ] Query optimization (indexes, pagination, cursor-based)
  - [ ] Bundle size optimization (tree-shaking)

- [ ] **13.2** UX Polish
  - [ ] Skeleton loaders لكل شاشة تحميل
  - [ ] Error states جميلة مع أيقونات
  - [ ] Empty states مفيدة (لا حجوزات، لا مفضلات)
  - [ ] Haptic feedback على الأزرار المهمة
  - [ ] Pull-to-refresh في كل القوائم
  - [ ] Toast notifications

- [ ] **13.3** Accessibility + i18n
  - [ ] RTL support كامل (تطبيق + Dashboard)
  - [ ] Font scaling support
  - [ ] Screen reader labels
  - [ ] Contrast ratios check
  - [ ] ترجمة إنجليزية لكل النصوص

- [ ] **13.4** Beta Testing
  - [ ] دعوة 3-5 ملاعب حقيقية في القاهرة
  - [ ] دعوة 20-30 لاعب للتجربة
  - [ ] إنشاء نموذج Google Forms للملاحظات
  - [ ] جمع الملاحظات وتصنيفها
  - [ ] إصلاح الأخطاء المكتشفة (bugs sprint)

---

## المرحلة 6: Launch (الأسبوع 14) 🚀

- [ ] **14.1** App Store Optimization (ASO)
  - [ ] تصميم Screenshots احترافية (6 لكل متجر)
  - [ ] كتابة وصف التطبيق (عربي + إنجليزي)
  - [ ] تحديد كلمات مفتاحية (حجز ملاعب، بادل، كرة قدم، يلا حجز)
  - [ ] تصميم App Icon نهائي
  - [ ] تسجيل فيديو ترويجي (30 ثانية)

- [ ] **14.2** نشر التطبيق
  - [ ] EAS Build (Android production)
  - [ ] EAS Submit (Google Play)
  - [ ] EAS Build (iOS production)
  - [ ] EAS Submit (App Store)

- [ ] **14.3** نشر Dashboard
  - [ ] Deploy على Vercel (production)
  - [ ] ربط الدومين المخصص
  - [ ] SSL certificate

- [ ] **14.4** مراقبة وتتبع
  - [ ] إعداد Sentry (error tracking)
  - [ ] إعداد Firebase Analytics / Mixpanel
  - [ ] إعداد Uptime monitoring
  - [ ] إعداد Database monitoring (Supabase dashboard)

- [ ] **14.5** خطة التسويق والإطلاق
  - [ ] حملة على Instagram + TikTok + Facebook
  - [ ] شراكات مع ملاعب مشهورة في القاهرة
  - [ ] عروض افتتاحية (أول حجز مجاني)
  - [ ] تعاون مع مؤثرين رياضيين
  - [ ] إعلان في مجموعات كرة القدم/البادل على Facebook
