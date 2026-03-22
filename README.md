# رمز الإبداع – منصة إدارة الأملاك

منصة متكاملة لإدارة الأملاك العقارية مبنية بـ React + TypeScript + Vite.  
تدعم النشر التلقائي على **Railway** مع قاعدة بيانات **Supabase**.

---

## 🚀 النشر على Railway

### المتطلبات الأولية

| الأداة | الإصدار |
|--------|---------|
| Node.js | 20+ |
| npm | 10+ |
| حساب [Railway](https://railway.com) | مجاني أو مدفوع |
| مشروع [Supabase](https://supabase.com) | (اختياري، للبيانات المشتركة بين المستخدمين) |

---

### 1. إعداد قاعدة بيانات Supabase (اختياري)

> بدون Supabase، يعمل التطبيق بشكل طبيعي ويحفظ البيانات في `localStorage` المتصفح.

1. أنشئ مشروعاً جديداً على [app.supabase.com](https://app.supabase.com)
2. افتح **SQL Editor** وشغّل محتوى الملف:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   هذا سيُنشئ 19 جدولاً لجميع كيانات التطبيق.
3. من **Project Settings → API** انسخ:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon / public key` → `VITE_SUPABASE_ANON_KEY`

---

### 2. النشر على Railway

#### الطريقة الأولى: تلقائياً عبر GitHub Actions (موصى به)

1. **Fork أو ادفع** هذا المستودع إلى GitHub
2. أنشئ مشروعاً جديداً على [railway.com](https://railway.com):
   - New Project → Deploy from GitHub repo → اختر المستودع
3. في Railway → **Variables** أضف:

   | المتغير | القيمة |
   |---------|--------|
   | `VITE_SUPABASE_URL` | رابط مشروع Supabase |
   | `VITE_SUPABASE_ANON_KEY` | المفتاح العام لـ Supabase |

4. في GitHub → **Settings → Secrets and variables → Actions** أضف:

   | السر | القيمة |
   |------|--------|
   | `RAILWAY_TOKEN` | رمز Railway (من Railway → Account Settings → Tokens) |
   | `VITE_SUPABASE_URL` | نفس قيمة Railway |
   | `VITE_SUPABASE_ANON_KEY` | نفس قيمة Railway |

5. ادفع أي تغيير إلى فرع `main` → سيُطلق GitHub Actions بناء ونشر تلقائي

#### الطريقة الثانية: يدوياً عبر Railway CLI

```bash
# ثبّت Railway CLI
npm install -g @railway/cli

# سجّل دخول
railway login

# ربط المشروع (أو إنشاء مشروع جديد)
railway link

# ابنِ وانشر
railway up
```

---

### 3. المتغيرات البيئية

| المتغير | مطلوب | الوصف |
|---------|--------|-------|
| `VITE_SUPABASE_URL` | اختياري | رابط مشروع Supabase |
| `VITE_SUPABASE_ANON_KEY` | اختياري | المفتاح العام لـ Supabase |
| `PORT` | تلقائي | يضبطه Railway تلقائياً (افتراضي: 3000) |

> **ملاحظة:** متغيرات `VITE_*` يجب توفيرها **وقت البناء** لأن Vite يدمجها في الحزمة.  
> في Railway، أضفها في **Variables** قبل أول نشر.

---

## 💻 التطوير المحلي

```bash
# تثبيت المتطلبات
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة بناء الإنتاج
npm run preview
```

---

## 🏗️ بنية المشروع

```
src/
├── App.tsx              # نقطة الدخول الرئيسية
├── data/
│   ├── db.ts            # بيانات أولية (seed)
│   ├── store.ts         # Zustand store + تزامن Supabase
│   ├── supabase.ts      # إعداد عميل Supabase
│   └── supabaseSync.ts  # طبقة المزامنة مع Supabase
├── hooks/
│   └── useLinkedData.ts # ربط البيانات والتنبيهات الذكية
├── pages/               # صفحات التطبيق
├── components/          # مكونات مشتركة
└── types/               # تعريفات TypeScript

supabase/
└── migrations/
    └── 001_initial_schema.sql  # مخطط قاعدة البيانات

.github/
└── workflows/
    ├── ci.yml      # بناء + فحص عند كل push/PR
    └── deploy.yml  # نشر تلقائي على Railway عند push إلى main
```

---

## 🛠️ التقنيات المستخدمة

| التقنية | الدور |
|---------|-------|
| React 19 + TypeScript | واجهة المستخدم |
| Vite | أداة البناء |
| Zustand | إدارة الحالة |
| Supabase | قاعدة البيانات والمزامنة |
| TailwindCSS | التصميم |
| Railway | استضافة وCI/CD |
