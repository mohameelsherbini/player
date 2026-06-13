# 🏟️ Yalla Book — قائمة المهام التفصيلية

> مستخرجة من [Implementation Plan v2.0](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/implementationplan.md)
> Database Schema: [Yalla_Book_Database_Schema.md](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/Yalla_Book_Database_Schema.md)

---

## ### المرحلة 1: Foundation — التأسيس (الأسبوع 1-2) 🏗️

#### الأسبوع 1: إعداد البيئة والـ Backend

- [x] إنشاء مشروع **Expo** مع NativeWind
- [x] إنشاء مشروع **Next.js** للـ Dashboard
- [x] إنشاء **Supabase Project** (Cloud)
- [x] إعداد **Git Monorepo** (Turborepo أو npm workspaces)
- [x] إعداد **GitHub Repository** مع branch protection
- [x] إعداد **CI/CD**: GitHub Actions → EAS Build + Vercel

#### الأسبوع 2: قاعدة البيانات والبنية التحتية

- [x] كتابة **SQL Migrations** للـ 21 جدول
- [x] تفعيل **PostGIS Extension**
- [x] كتابة **RLS Policies** لكل جدول
- [x] إنشاء **Database Functions** (`book_slot`, `cancel_booking`)
- [x] إنشاء **Triggers** (`updated_at`, `update_pitch_rating`)
- [x] إدخال **Seed Data** (المرافق الافتراضية + Admin user + ملاعب تجريبية)
- [x] توليد **TypeScript Types**
- [x] إعداد **Supabase Auth** (Phone OTP + Google + Apple Sign-In)
- [x] إعداد **Supabase Storage** buckets

---

### المرحلة 2: MVP Core — النواة (الأسبوع 3-6) 🚀

#### الأسبوع 3-4: تطبيق اللاعب (الأساسيات)

- [x] شاشة الترحيب (Onboarding) — 3 slides تعريفية
- [x] شاشة التسجيل/الدخول — Phone OTP + Google + Apple
- [x] شاشة الرئيسية (Home) — ملاعب قريبة + بحث + فلترة + إعلانات
- [x] شاشة تفاصيل الملعب — Gallery + مرافق + خريطة + تقييمات + أوقات
- [x] شاشة اختيار الوقت والحجز — تقويم + Grid + تأكيد
- [x] شاشة الملف الشخصي — تعديل البيانات + صورة + لغة

#### الأسبوع 5: الدفع + حجوزاتي

- [x] تكامل **Paymob** (Visa/Mastercard + Fawry + Mobile Wallets + Cash)
- [x] شاشة حجوزاتي — القادمة + السابقة + كود الحجز + إلغاء
- [x] **Push Notifications** الأساسية — تأكيد + تذكير + إلغاء

#### الأسبوع 6: لوحة تحكم صاحب الملعب + Admin

- [x] Dashboard صاحب الملعب — إضافة ملعب + جدول + حجوزات + أرباح
- [x] Dashboard Admin — مستخدمين + ملاعب معلقة + إحصائيات

---

### المرحلة 3: Social & Matching (الأسبوع 7-9) ⚽

#### الأسبوع 7: المباريات المفتوحة
- [x] شاشة المباريات المفتوحة — خريطة + قائمة + فلترة
- [x] إنشاء مباراة جديدة — ملعب + وقت + نوع + عدد + تكلفة
- [x] الانضمام لمباراة — دفع + تحديث تلقائي + إشعار

#### الأسبوع 8: التقييمات والمفضلات
- [x] نظام التقييمات — نجوم + تعليق + رد صاحب الملعب + Trigger
- [x] المفضلات — إضافة/إزالة + شاشة المفضلات
- [x] البحث المتقدم — نصي + فلترة + ترتيب

#### الأسبوع 9: الإشعارات المتقدمة + Realtime
- [x] مركز الإشعارات — قائمة + مقروء/غير مقروء + Deep linking
- [x] Realtime Subscriptions — أوقات + مباريات + حجوزات جديدة

---

### المرحلة 4: Monetization & Growth (الأسبوع 10-11) 💰

#### الأسبوع 10: الإعلانات + Featured Pitches
- [x] نظام الإعلانات (Admin) — إنشاء + تتبع + تقارير
- [x] عرض الإعلانات في التطبيق — Banner + بحث + تفاصيل
- [x] Featured Pitches — طلب + موافقة + عرض مميز

#### الأسبوع 11: الأكاديميات + التقارير المتقدمة
- [x] الأكاديميات والجلسات التدريبية
- [x] التقارير المتقدمة (Admin + Owner) — مالية + نشاط + تصدير

---

### المرحلة 5: Testing & Polish (الأسبوع 12-13) 🧪

- [x] Unit Tests + Integration Tests + Load Testing + Security Testing
- [x] Performance Optimization — صور + queries + bundle
- [x] UX Polish — Skeleton + Error states + Haptic + RTL
- [x] Beta Testing — 3-5 ملاعب + 20-30 لاعب + إصلاحات

---

### المرحلة 6: Launch (الأسبوع 14) 🚀

- [ ] ASO — Screenshots + وصف + كلمات مفتاحية + فيديو
- [ ] نشر التطبيق — Google Play + App Store
- [ ] نشر Dashboard على Vercel
- [ ] مراقبة — Sentry + Analytics + Uptime
- [ ] خطة التسويق — شراكات + عروض + مؤثرين

---
