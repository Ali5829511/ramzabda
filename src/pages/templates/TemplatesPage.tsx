import { useState } from 'react';
import {
  FileText, MessageCircle, Smartphone, Copy, Check, Printer, Search, Tag, Send, ClipboardList, Eye, Edit3
} from 'lucide-react';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const WHATSAPP_TEMPLATES = [
  // ── إيجار وعقود ──
  {
    id: 'wt1', cat: 'contracts', icon: '📄', title: 'ترحيب بمستأجر جديد',
    body: `عزيزي {{اسم_المستأجر}} 👋

أهلاً وسهلاً بك في {{اسم_العقار}}!
نود إعلامك بأنه تم توثيق عقد إيجارك بنجاح عبر منصة إيجار.

📋 *تفاصيل العقد:*
• رقم العقد: {{رقم_العقد}}
• الوحدة: {{رقم_الوحدة}}
• مدة العقد: {{تاريخ_البداية}} — {{تاريخ_النهاية}}
• قيمة الإيجار السنوي: {{مبلغ_الإيجار}} ر.س

للتواصل والاستفسار يرجى التواصل معنا على هذا الرقم.

شركة رمز الإبداع لإدارة الأملاك 🏢`,
  },
  {
    id: 'wt2', cat: 'contracts', icon: '⚠️', title: 'تنبيه انتهاء العقد (90 يوم)',
    body: `عزيزي {{اسم_المستأجر}}،

نود تذكيرك بأن عقد إيجار وحدتك سينتهي بعد *90 يوماً*.

📅 تاريخ الانتهاء: {{تاريخ_انتهاء_العقد}}
🏠 الوحدة: {{رقم_الوحدة}} — {{اسم_العقار}}

يرجى التواصل معنا لتجديد العقد أو إعلامنا بقرارك مبكراً لضمان سير الإجراءات بسلاسة.

شركة رمز الإبداع 📞`,
  },
  {
    id: 'wt3', cat: 'contracts', icon: '🔴', title: 'تنبيه انتهاء العقد (30 يوم)',
    body: `تنبيه عاجل ⚠️

عزيزي {{اسم_المستأجر}}،
لم يتبقَّ سوى *30 يوماً* على انتهاء عقد إيجارك.

📅 تاريخ الانتهاء: {{تاريخ_انتهاء_العقد}}

الرجاء التواصل معنا *فوراً* لإنهاء إجراءات التجديد أو التسليم.

شركة رمز الإبداع — {{رقم_التواصل}}`,
  },
  {
    id: 'wt4', cat: 'payments', icon: '💰', title: 'تذكير دفع الإيجار',
    body: `عزيزي {{اسم_المستأجر}}،

نذكّركم بموعد سداد دفعة الإيجار المستحقة.

💳 *تفاصيل الدفعة:*
• المبلغ: {{مبلغ_الدفعة}} ر.س
• تاريخ الاستحقاق: {{تاريخ_الاستحقاق}}
• رقم الفاتورة: {{رقم_الفاتورة}}

يُرجى السداد قبل التاريخ المحدد تجنباً لأي غرامات.
للدفع الإلكتروني: {{رابط_الدفع}}

شركة رمز الإبداع 🏢`,
  },
  {
    id: 'wt5', cat: 'payments', icon: '✅', title: 'تأكيد استلام الدفعة',
    body: `عزيزي {{اسم_المستأجر}}،

✅ تم استلام دفعتك بنجاح!

📋 *تفاصيل الإيصال:*
• المبلغ المدفوع: {{المبلغ}} ر.س
• التاريخ: {{تاريخ_الدفع}}
• رقم الإيصال: {{رقم_الإيصال}}

شكراً لالتزامكم. يسعدنا خدمتكم دائماً 🙏

شركة رمز الإبداع لإدارة الأملاك`,
  },
  {
    id: 'wt6', cat: 'payments', icon: '🔔', title: 'إشعار تأخر السداد',
    body: `عزيزي {{اسم_المستأجر}}،

نفيدكم بأن دفعة الإيجار المستحقة بتاريخ {{تاريخ_الاستحقاق}} *لم يتم تسويتها* حتى الآن.

💰 المبلغ المستحق: {{المبلغ}} ر.س
⏱️ أيام التأخير: {{أيام_التأخير}} يوم

يرجى التواصل معنا لترتيب السداد وتجنب التبعات القانونية.

شركة رمز الإبداع — {{رقم_التواصل}}`,
  },
  {
    id: 'wt7', cat: 'maintenance', icon: '🔧', title: 'تأكيد استلام بلاغ الصيانة',
    body: `عزيزي {{اسم_المستأجر}}،

✅ تم استلام بلاغ الصيانة الخاص بك.

🔧 *تفاصيل البلاغ:*
• رقم البلاغ: {{رقم_البلاغ}}
• نوع المشكلة: {{نوع_الصيانة}}
• الأولوية: {{الأولوية}}
• الحالة: قيد المعالجة

سيتم التواصل معك لتحديد موعد زيارة الفني خلال {{مدة_الاستجابة}}.

شركة رمز الإبداع 🏢`,
  },
  {
    id: 'wt8', cat: 'maintenance', icon: '👷', title: 'إشعار زيارة الفني',
    body: `عزيزي {{اسم_المستأجر}}،

نود إعلامك بأنه سيتم زيارتك لإصلاح بلاغ الصيانة رقم *{{رقم_البلاغ}}*.

📅 الموعد: {{تاريخ_الزيارة}} — {{وقت_الزيارة}}
👷 الفني: {{اسم_الفني}}
📞 جوال الفني: {{جوال_الفني}}

يرجى التأكد من تواجد شخص بالغ في الوحدة خلال الزيارة.

شركة رمز الإبداع`,
  },
  {
    id: 'wt9', cat: 'maintenance', icon: '✅', title: 'إغلاق بلاغ الصيانة',
    body: `عزيزي {{اسم_المستأجر}}،

✅ تم إغلاق بلاغ الصيانة رقم *{{رقم_البلاغ}}* بنجاح.

🔧 المشكلة: {{وصف_المشكلة}}
💰 التكلفة: {{تكلفة_الصيانة}} ر.س

نأمل أن تكون الخدمة قد لبّت توقعاتك. يسعدنا تقييم الخدمة من 1-5 ⭐

شركة رمز الإبداع`,
  },
  {
    id: 'wt10', cat: 'appointments', icon: '📅', title: 'تأكيد موعد معاينة',
    body: `عزيزي {{اسم_العميل}}،

✅ تم تأكيد موعد معاينة العقار.

🏠 *تفاصيل الموعد:*
• العقار: {{اسم_العقار}}
• الوحدة: {{رقم_الوحدة}}
• التاريخ: {{تاريخ_الموعد}}
• الوقت: {{وقت_الموعد}}
• المندوب: {{اسم_المندوب}}
• جوال المندوب: {{جوال_المندوب}}

موقع العقار: {{رابط_الموقع}}

شركة رمز الإبداع 🏢`,
  },
  {
    id: 'wt11', cat: 'appointments', icon: '🔁', title: 'تأجيل أو إلغاء الموعد',
    body: `عزيزي {{اسم_العميل}}،

نأسف لإعلامك بأنه تم *{{إلغاء/تأجيل}}* موعد المعاينة المحدد بتاريخ {{التاريخ_القديم}}.

{{سبب_التغيير}}

سنتواصل معك قريباً لتحديد موعد بديل مناسب.

نعتذر عن الإزعاج 🙏
شركة رمز الإبداع`,
  },
  {
    id: 'wt12', cat: 'handover', icon: '🏠', title: 'دعوة تسليم الوحدة',
    body: `عزيزي {{اسم_المستأجر}}،

يسعدنا دعوتكم لاستلام وحدتكم الجديدة.

🏠 *تفاصيل التسليم:*
• العقار: {{اسم_العقار}}
• الوحدة: {{رقم_الوحدة}}
• تاريخ التسليم: {{تاريخ_التسليم}}
• الوقت: {{وقت_التسليم}}

يرجى إحضار هويتك الوطنية وعقد الإيجار.

شركة رمز الإبداع`,
  },
  {
    id: 'wt13', cat: 'owners', icon: '👑', title: 'تقرير شهري للمالك',
    body: `عزيزي {{اسم_المالك}}،

نرسل إليكم التقرير الشهري لعقارات {{اسم_العقار}} لشهر {{الشهر}}.

📊 *ملخص الشهر:*
• الإيرادات المحصّلة: {{إجمالي_الإيرادات}} ر.س
• الوحدات المؤجرة: {{وحدات_مؤجرة}} من {{إجمالي_الوحدات}}
• بلاغات الصيانة المنجزة: {{بلاغات_مغلقة}}
• تكاليف الصيانة: {{تكاليف_الصيانة}} ر.س
• صافي الإيراد: {{صافي_الإيراد}} ر.س

للاطلاع على التقرير التفصيلي يرجى التواصل معنا.

شركة رمز الإبداع 🏢`,
  },
  {
    id: 'wt14', cat: 'owners', icon: '✅', title: 'موافقة مالك على صيانة',
    body: `عزيزي {{اسم_المالك}}،

يرجى الموافقة على بلاغ صيانة لعقارك.

🔧 *تفاصيل البلاغ:*
• العقار: {{اسم_العقار}} — وحدة {{رقم_الوحدة}}
• المشكلة: {{وصف_المشكلة}}
• التكلفة التقديرية: {{التكلفة}} ر.س

للموافقة أو الاستفسار يرجى الرد على هذه الرسالة أو التواصل مع مدير العقار.

شركة رمز الإبداع`,
  },
  {
    id: 'wt15', cat: 'marketing', icon: '🌟', title: 'عرض وحدة للإيجار',
    body: `🏠 *وحدة مميزة للإيجار*

{{اسم_العقار}} — {{المدينة}}/{{الحي}}

✨ *المواصفات:*
• النوع: {{نوع_الوحدة}}
• المساحة: {{المساحة}} م²
• الطابق: {{الطابق}}
• الغرف: {{عدد_الغرف}} | دورات المياه: {{دورات_المياه}}
• المزايا: {{المزايا}}

💰 الإيجار السنوي: *{{مبلغ_الإيجار}} ر.س*

📞 للحجز والاستفسار: {{رقم_التواصل}}
🔗 مشاهدة الصور: {{رابط_الإعلان}}

شركة رمز الإبداع للأملاك 🏢`,
  },
];

const SMS_TEMPLATES = [
  { id: 'sms1', cat: 'payments', title: 'تذكير سداد', body: 'رمز الإبداع: عزيزي {{الاسم}}، دفعتك بمبلغ {{المبلغ}} ر.س مستحقة بتاريخ {{التاريخ}}. للسداد: {{الرابط}}' },
  { id: 'sms2', cat: 'payments', title: 'تأكيد استلام دفعة', body: 'رمز الإبداع: تم استلام دفعتكم بمبلغ {{المبلغ}} ر.س بتاريخ {{التاريخ}}. رقم الإيصال: {{الرقم}}' },
  { id: 'sms3', cat: 'payments', title: 'تأخر سداد', body: 'رمز الإبداع: عزيزي {{الاسم}}، دفعتكم بمبلغ {{المبلغ}} ر.س متأخرة منذ {{التاريخ}}. يرجى السداد فوراً أو التواصل: {{الرقم}}' },
  { id: 'sms4', cat: 'contracts', title: 'تذكير انتهاء العقد', body: 'رمز الإبداع: عقد إيجاركم ينتهي بتاريخ {{التاريخ}}. يرجى التواصل للتجديد: {{الرقم}}' },
  { id: 'sms5', cat: 'maintenance', title: 'تأكيد بلاغ صيانة', body: 'رمز الإبداع: تم استلام بلاغ صيانتك رقم {{رقم_البلاغ}}. سنتواصل معك خلال {{المدة}} ساعة.' },
  { id: 'sms6', cat: 'maintenance', title: 'موعد الفني', body: 'رمز الإبداع: الفني {{اسم_الفني}} سيزوركم بتاريخ {{التاريخ}} الساعة {{الوقت}}. للتواصل: {{الجوال}}' },
  { id: 'sms7', cat: 'appointments', title: 'تأكيد موعد', body: 'رمز الإبداع: موعدكم لمعاينة {{العقار}} مؤكد بتاريخ {{التاريخ}} الساعة {{الوقت}}. مندوبنا: {{المندوب}} {{الجوال}}' },
  { id: 'sms8', cat: 'appointments', title: 'تذكير موعد', body: 'رمز الإبداع: تذكير — لديكم موعد غداً {{التاريخ}} الساعة {{الوقت}} لمعاينة {{العقار}}. للإلغاء: {{الرقم}}' },
  { id: 'sms9', cat: 'owners', title: 'إشعار مالك بدفعة', body: 'رمز الإبداع: تم تحصيل دفعة إيجار {{الوحدة}} بمبلغ {{المبلغ}} ر.س. سيتم تحويل صافي الإيراد خلال {{المدة}}.' },
  { id: 'sms10', cat: 'owners', title: 'موافقة صيانة', body: 'رمز الإبداع: يرجى الموافقة على صيانة {{الوحدة}} بتكلفة {{التكلفة}} ر.س. للرد أو الاستفسار: {{الرقم}}' },
];

// ─────────────────────────────────────────────
// REAL ESTATE FORMS DATA
// ─────────────────────────────────────────────

const FORMS = [
  // ── تسليم / استلام ──
  {
    id: 'f1', cat: 'handover', icon: '🗝️', title: 'نموذج تسليم الوحدة للمستأجر',
    description: 'يُستخدم عند تسليم الوحدة للمستأجر في بداية العقد',
    fields: [
      { section: 'بيانات العقد', items: ['رقم العقد', 'تاريخ التسليم', 'اسم المستأجر', 'رقم الهوية', 'رقم الجوال', 'اسم العقار', 'رقم الوحدة', 'الطابق'] },
      { section: 'حالة الوحدة', items: ['حالة الجدران والدهانات', 'حالة الأرضيات', 'حالة الأبواب والنوافذ', 'حالة الحمامات والمطبخ', 'حالة التمديدات الكهربائية', 'حالة تمديدات المياه', 'حالة المكيفات', 'حالة الملاحق والمرافق'] },
      { section: 'عداد الكهرباء', items: ['رقم العداد', 'القراءة الحالية (كيلوواط)'] },
      { section: 'عداد المياه', items: ['رقم العداد', 'القراءة الحالية (م³)'] },
      { section: 'المفاتيح', items: ['عدد المفاتيح المسلّمة', 'ريموت (نعم/لا)', 'بطاقة دخول (نعم/لا)'] },
      { section: 'ملاحظات', items: ['ملاحظات المسلِّم', 'ملاحظات المستلِم', 'التوقيعات'] },
    ],
  },
  {
    id: 'f2', cat: 'handover', icon: '📦', title: 'نموذج استلام الوحدة من المستأجر',
    description: 'يُستخدم عند إخلاء المستأجر للوحدة ونهاية العقد',
    fields: [
      { section: 'بيانات الإخلاء', items: ['رقم العقد', 'تاريخ الإخلاء الفعلي', 'اسم المستأجر', 'سبب الإخلاء'] },
      { section: 'فحص الوحدة', items: ['الجدران والدهانات (مقبول/يحتاج إصلاح)', 'الأرضيات', 'الأبواب والنوافذ', 'الحمامات والمطبخ', 'المكيفات', 'الكهرباء والإنارة', 'المياه والصرف'] },
      { section: 'عداد الكهرباء', items: ['القراءة الختامية', 'المبلغ المستحق'] },
      { section: 'عداد المياه', items: ['القراءة الختامية', 'المبلغ المستحق'] },
      { section: 'الأضرار', items: ['وصف الأضرار إن وجدت', 'التكلفة التقديرية للإصلاح', 'الاستقطاع من مبلغ الضمان'] },
      { section: 'التسوية المالية', items: ['مبلغ الضمان', 'الاستقطاعات', 'المبلغ المردود للمستأجر', 'التوقيعات'] },
    ],
  },
  {
    id: 'f3', cat: 'handover', icon: '🔍', title: 'نموذج محضر معاينة العقار',
    description: 'لتوثيق حالة العقار أو الوحدة قبل وبعد الإيجار',
    fields: [
      { section: 'بيانات المعاينة', items: ['تاريخ المعاينة', 'العقار والوحدة', 'اسم المعاين', 'الجهة'] },
      { section: 'بيان الحالة', items: ['وصف عام للوحدة', 'الجدران', 'الأرضيات', 'الأسقف', 'الأبواب', 'النوافذ', 'الحمامات', 'المطبخ', 'مواقف السيارات', 'الفناء أو الشرفة'] },
      { section: 'توصيات', items: ['أعمال مطلوبة قبل الإيجار', 'الأعمال المطلوبة فوراً', 'أعمال مقترحة'] },
    ],
  },
  // ── عقود وملاك ──
  {
    id: 'f4', cat: 'owners', icon: '📝', title: 'اتفاقية إدارة العقار (وكالة)',
    description: 'عقد إدارة بين شركة رمز الإبداع والمالك لإدارة العقار',
    fields: [
      { section: 'بيانات الأطراف', items: ['اسم المالك', 'رقم الهوية / السجل التجاري', 'رقم الجوال', 'البريد الإلكتروني'] },
      { section: 'بيانات العقار', items: ['اسم العقار', 'العنوان الكامل', 'رقم الصك / الوثيقة', 'نوع العقار', 'عدد الوحدات'] },
      { section: 'نطاق الخدمات', items: ['إدارة العقود والمستأجرين', 'تحصيل الإيجارات', 'الإشراف على الصيانة', 'التسويق والتأجير', 'التقارير الدورية'] },
      { section: 'الشروط المالية', items: ['نسبة عمولة الإدارة %', 'نسبة عمولة التأجير %', 'طريقة الدفع', 'جدول التحويل'] },
      { section: 'مدة الاتفاقية', items: ['تاريخ البداية', 'تاريخ النهاية', 'شروط التجديد', 'شروط الفسخ'] },
    ],
  },
  {
    id: 'f5', cat: 'owners', icon: '💰', title: 'كشف حساب المالك الشهري',
    description: 'تقرير مالي شهري تفصيلي للمالك',
    fields: [
      { section: 'معلومات التقرير', items: ['اسم المالك', 'العقار', 'الفترة', 'تاريخ الإصدار'] },
      { section: 'الإيرادات', items: ['إجمالي الإيجارات المحصّلة', 'إيرادات أخرى'] },
      { section: 'المصروفات', items: ['عمولة الإدارة', 'تكاليف الصيانة', 'رسوم التوثيق', 'مصروفات أخرى'] },
      { section: 'الملخص', items: ['إجمالي الإيرادات', 'إجمالي المصروفات', 'صافي المستحق للمالك', 'رقم حساب التحويل'] },
    ],
  },
  // ── مستأجرين ──
  {
    id: 'f6', cat: 'tenants', icon: '👤', title: 'طلب إيجار وحدة سكنية',
    description: 'استمارة طلب تقديم المستأجر المحتمل',
    fields: [
      { section: 'البيانات الشخصية', items: ['الاسم الكامل', 'رقم الهوية', 'الجنسية', 'تاريخ الميلاد', 'رقم الجوال', 'البريد الإلكتروني'] },
      { section: 'بيانات العمل', items: ['جهة العمل', 'المسمى الوظيفي', 'الدخل الشهري', 'رقم جوال العمل'] },
      { section: 'بيانات السكن الحالي', items: ['العنوان الحالي', 'مدة السكن الحالي', 'سبب الانتقال'] },
      { section: 'الوحدة المطلوبة', items: ['نوع الوحدة', 'عدد الغرف', 'الحد الأعلى للإيجار', 'تاريخ الدخول المطلوب'] },
      { section: 'المرفقات', items: ['صورة الهوية', 'شهادة الراتب', 'خطاب العمل'] },
    ],
  },
  {
    id: 'f7', cat: 'tenants', icon: '🔧', title: 'طلب صيانة من مستأجر',
    description: 'نموذج تقديم بلاغ الصيانة يدوياً',
    fields: [
      { section: 'بيانات الطالب', items: ['اسم المستأجر', 'رقم الجوال', 'العقار', 'رقم الوحدة', 'رقم العقد'] },
      { section: 'بيانات البلاغ', items: ['نوع المشكلة', 'وصف المشكلة بالتفصيل', 'متى بدأت المشكلة؟', 'درجة الخطورة', 'هل سبق الإبلاغ عنها؟'] },
      { section: 'أوقات التواجد', items: ['أفضل الأوقات لزيارة الفني'] },
      { section: 'توقيع المستأجر', items: ['التاريخ', 'التوقيع'] },
    ],
  },
  {
    id: 'f8', cat: 'tenants', icon: '📋', title: 'قائمة فحص الانتقال (تشيك ليست)',
    description: 'قائمة متكاملة للمستأجر عند الانتقال للوحدة',
    fields: [
      { section: 'قبل يوم الانتقال', items: ['التأكد من توقيع العقد وإيداع الضمان', 'الحصول على نسخة العقد', 'الاطلاع على لوائح البناء', 'ترتيب نقل الأثاث', 'تحديث العنوان لدى الجهات الرسمية'] },
      { section: 'يوم الانتقال', items: ['استلام المفاتيح وعدّها', 'توثيق حالة الوحدة بالصور', 'قراءة عداد الكهرباء والماء', 'التأكد من سلامة الأجهزة', 'فحص جميع المفاتيح والأقفال'] },
      { section: 'بعد الانتقال', items: ['الاشتراك في خدمات المرافق', 'التعرف على إجراءات الصيانة', 'حفظ أرقام الطوارئ', 'التعرف على مواقف السيارات'] },
    ],
  },
  // ── تسويق ──
  {
    id: 'f9', cat: 'marketing', icon: '📊', title: 'نموذج بيانات عرض عقاري',
    description: 'لإدخال بيانات العقار للنشر والتسويق',
    fields: [
      { section: 'البيانات الأساسية', items: ['اسم العقار', 'نوع العقار', 'الموقع التفصيلي', 'السعر المطلوب', 'مدة الإيجار'] },
      { section: 'المواصفات', items: ['المساحة الإجمالية م²', 'عدد الطوابق', 'عدد الغرف', 'عدد دورات المياه', 'عدد المواقف', 'سنة البناء'] },
      { section: 'المزايا والخدمات', items: ['المصاعد', 'الأمن والحراسة', 'الصيانة', 'الإنترنت', 'أخرى'] },
      { section: 'الصور والمستندات', items: ['صور خارجية', 'صور داخلية', 'مخططات الوحدات', 'صك الملكية'] },
    ],
  },
  // ── شكاوى ──
  {
    id: 'f10', cat: 'complaints', icon: '📮', title: 'نموذج شكوى أو طلب',
    description: 'لتقديم الشكاوى والطلبات بشكل رسمي',
    fields: [
      { section: 'بيانات مقدّم الشكوى', items: ['الاسم', 'صفة مقدم الشكوى (مستأجر/مالك/زائر)', 'رقم الجوال', 'البريد الإلكتروني', 'العقار والوحدة'] },
      { section: 'بيانات الشكوى', items: ['نوع الشكوى', 'تاريخ الحادثة', 'الوصف التفصيلي', 'الأضرار المترتبة', 'المطلوب اتخاذه'] },
      { section: 'المرفقات', items: ['صور', 'مستندات داعمة'] },
    ],
  },
];

const catColors: Record<string, string> = {
  contracts: 'bg-blue-100 text-blue-700 border-blue-200',
  payments: 'bg-green-100 text-green-700 border-green-200',
  maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  appointments: 'bg-purple-100 text-purple-700 border-purple-200',
  handover: 'bg-teal-100 text-teal-700 border-teal-200',
  owners: 'bg-amber-100 text-amber-700 border-amber-200',
  tenants: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  marketing: 'bg-pink-100 text-pink-700 border-pink-200',
  complaints: 'bg-red-100 text-red-700 border-red-200',
};
const catLabels: Record<string, string> = {
  contracts: 'عقود وإيجار', payments: 'مدفوعات', maintenance: 'صيانة',
  appointments: 'مواعيد', handover: 'تسليم واستلام', owners: 'ملاك',
  tenants: 'مستأجرون', marketing: 'تسويق', complaints: 'شكاوى',
};

// ─────────────────────────────────────────────
// PRINT FORM
// ─────────────────────────────────────────────
function printForm(form: typeof FORMS[0]) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
  <meta charset="UTF-8"><title>${form.title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a1a;background:#fff;font-size:12px}
    .page{max-width:794px;margin:0 auto;padding:28px 32px}
    .header{background:linear-gradient(135deg,#1a1a2e,#C9A44A);color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;margin-bottom:0}
    .header h1{font-size:16px;font-weight:900}
    .header p{font-size:10px;opacity:.8;margin-top:3px}
    .header .badge{background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
    .meta{background:#F8F5EE;padding:12px 24px;display:flex;gap:20px;border-bottom:2px solid #C9A44A;margin-bottom:20px}
    .meta-item{display:flex;flex-direction:column}
    .meta-lbl{font-size:9px;color:#888}
    .meta-val{font-size:11px;font-weight:700;color:#1a1a2e}
    .section{margin-bottom:18px;page-break-inside:avoid}
    .section-title{background:#1a1a2e;color:#fff;padding:6px 14px;border-radius:6px 6px 0 0;font-size:11px;font-weight:800}
    .fields{border:1px solid #ddd;border-radius:0 0 6px 6px;overflow:hidden}
    .field{display:flex;border-bottom:1px solid #eee;align-items:stretch;min-height:32px}
    .field:last-child{border-bottom:none}
    .field-name{background:#fafafa;padding:6px 12px;width:40%;font-size:11px;color:#333;border-left:1px solid #eee;display:flex;align-items:center}
    .field-value{flex:1;padding:6px 12px;background:#fff}
    .footer{text-align:center;margin-top:24px;padding-top:12px;border-top:2px solid #C9A44A;font-size:10px;color:#888}
    .footer strong{color:#C9A44A}
    .sig-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;page-break-inside:avoid}
    .sig-box{border:1px solid #ddd;border-radius:8px;padding:10px 14px}
    .sig-box p{font-size:10px;color:#888;margin-bottom:24px}
    .sig-line{border-top:1px solid #aaa;margin-top:4px;padding-top:4px;font-size:9px;color:#bbb}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}@page{size:A4;margin:12mm}}
  </style></head><body><div class="page">
  <div class="header">
    <div><h1>${form.icon} ${form.title}</h1><p>${form.description}</p></div>
    <div class="badge">رمز الإبداع لإدارة الأملاك</div>
  </div>
  <div class="meta">
    <div class="meta-item"><span class="meta-lbl">تاريخ التعبئة</span><span class="meta-val">___________</span></div>
    <div class="meta-item"><span class="meta-lbl">رقم النموذج</span><span class="meta-val">${form.id.toUpperCase()}-${Date.now().toString().slice(-5)}</span></div>
    <div class="meta-item"><span class="meta-lbl">الموظف المسؤول</span><span class="meta-val">___________</span></div>
  </div>
  ${form.fields.map(sec => `
  <div class="section">
    <div class="section-title">${sec.section}</div>
    <div class="fields">
      ${sec.items.map(f => `<div class="field"><div class="field-name">${f}</div><div class="field-value"></div></div>`).join('')}
    </div>
  </div>`).join('')}
  <div class="sig-row">
    <div class="sig-box"><p>توقيع الطرف الأول</p><div class="sig-line">الاسم / التاريخ</div></div>
    <div class="sig-box"><p>توقيع الطرف الثاني</p><div class="sig-line">الاسم / التاريخ</div></div>
  </div>
  <div class="footer">مُعدّ بواسطة <strong>شركة رمز الإبداع لإدارة الأملاك</strong> • هذا النموذج سري ومخصص للاستخدام الرسمي فقط</div>
  </div></body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function TemplatesPage() {
  const [tab, setTab] = useState<'whatsapp' | 'sms' | 'forms'>('whatsapp');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<(typeof WHATSAPP_TEMPLATES[0] | typeof FORMS[0]) | null>(null);
  const [selectedForm, setSelectedForm] = useState<typeof FORMS[0] | null>(null);
  const [customVars, setCustomVars] = useState<Record<string, string>>({});

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const extractVars = (text: string) => {
    const matches = text.match(/\{\{[^}]+\}\}/g) ?? [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  };

  const fillTemplate = (text: string) => {
    let out = text;
    Object.entries(customVars).forEach(([k, v]) => {
      if (v) out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    });
    return out;
  };

  const filteredWA = WHATSAPP_TEMPLATES.filter(t =>
    (catFilter === 'all' || t.cat === catFilter) &&
    (t.title.includes(search) || t.body.includes(search))
  );
  const filteredSMS = SMS_TEMPLATES.filter(t =>
    (catFilter === 'all' || t.cat === catFilter) &&
    (t.title.includes(search) || t.body.includes(search))
  );
  const filteredForms = FORMS.filter(f =>
    (catFilter === 'all' || f.cat === catFilter) &&
    (f.title.includes(search) || f.description.includes(search))
  );

  const cats = tab === 'forms'
    ? [...new Set(FORMS.map(f => f.cat))]
    : [...new Set(WHATSAPP_TEMPLATES.map(t => t.cat))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            قوالب الرسائل والنماذج العقارية
          </h1>
          <p className="section-subtitle">
            {WHATSAPP_TEMPLATES.length} قالب واتساب • {SMS_TEMPLATES.length} قالب SMS • {FORMS.length} نموذج عقاري
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {[
          { id: 'whatsapp', label: 'واتساب', icon: <MessageCircle className="w-4 h-4" />, count: WHATSAPP_TEMPLATES.length, color: 'bg-green-500' },
          { id: 'sms', label: 'رسائل SMS', icon: <Smartphone className="w-4 h-4" />, count: SMS_TEMPLATES.length, color: 'bg-blue-500' },
          { id: 'forms', label: 'النماذج العقارية', icon: <ClipboardList className="w-4 h-4" />, count: FORMS.length, color: 'bg-purple-500' },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as 'whatsapp' | 'sms' | 'forms'); setCatFilter('all'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors ${tab === t.id ? `${t.color} text-white shadow` : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.icon}{t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pr-9" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${catFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            الكل
          </button>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${catFilter === c ? catColors[c] + ' border-current' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {catLabels[c]}
            </button>
          ))}
        </div>
      </div>

      {/* ── WhatsApp Templates ── */}
      {tab === 'whatsapp' && (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredWA.map(t => (
            <div key={t.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{t.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${catColors[t.cat]}`}>{catLabels[t.cat]}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setPreview(t); setCustomVars({}); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200" title="معاينة وتخصيص">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => copy(t.id, t.body)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200" title="نسخ">
                    {copied === t.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(t.body)}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600" title="فتح واتساب">
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap line-clamp-4 font-sans">{t.body}</pre>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {extractVars(t.body).length} متغير: {extractVars(t.body).map(v => `{{${v}}}`).join(' ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── SMS Templates ── */}
      {tab === 'sms' && (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSMS.map(t => (
            <div key={t.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{t.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${catColors[t.cat]}`}>{catLabels[t.cat]}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => copy(t.id, t.body)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">
                    {copied === t.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={`sms:?body=${encodeURIComponent(t.body)}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{t.body}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{t.body.length} حرف</p>
                <p className="text-xs text-gray-400">{extractVars(t.body).length} متغير</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Forms ── */}
      {tab === 'forms' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredForms.map(f => (
            <div key={f.id} className="card hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl shrink-0">{f.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 leading-tight">{f.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${catColors[f.cat]}`}>{catLabels[f.cat]}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{f.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {f.fields.map(sec => (
                  <span key={sec.section} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sec.section}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button onClick={() => setSelectedForm(f)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-semibold hover:bg-indigo-200">
                  <Eye className="w-3.5 h-3.5" /> عرض
                </button>
                <button onClick={() => printForm(f)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200">
                  <Printer className="w-3.5 h-3.5" /> طباعة
                </button>
                <button onClick={() => {
                  const content = f.fields.map(s => `## ${s.section}\n${s.items.map(i => `- ${i}: ___`).join('\n')}`).join('\n\n');
                  copy(f.id, `${f.title}\n${'─'.repeat(40)}\n\n${content}`);
                }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                  {copied === f.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WhatsApp Preview Modal ── */}
      {preview && 'body' in preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-l from-green-600 to-green-500 rounded-t-2xl p-4 text-white flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2"><MessageCircle className="w-4 h-4" />{preview.title}</h2>
              <button onClick={() => setPreview(null)} className="text-white/70 hover:text-white text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Variables */}
              {extractVars(preview.body).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" />تخصيص المتغيرات</p>
                  <div className="grid grid-cols-2 gap-2">
                    {extractVars(preview.body).map(v => (
                      <div key={v}>
                        <label className="label text-xs">{v}</label>
                        <input className="input-field text-xs py-1.5"
                          value={customVars[v] ?? ''} onChange={e => setCustomVars(p => ({ ...p, [v]: e.target.value }))}
                          placeholder={`أدخل ${v}...`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Preview */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">معاينة الرسالة</p>
                <div className="bg-[#ECE5DD] rounded-xl p-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm max-w-[85%] mr-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">{fillTemplate(preview.body)}</pre>
                    <p className="text-[10px] text-gray-400 mt-1 text-left">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy('preview', fillTemplate(preview.body))}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                  {copied === 'preview' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  نسخ
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(fillTemplate(preview.body))}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600">
                  <Send className="w-4 h-4" />إرسال عبر واتساب
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Detail Modal ── */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="bg-gradient-to-l from-indigo-600 to-purple-600 rounded-t-2xl p-5 text-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{selectedForm.icon} {selectedForm.title}</h2>
                <p className="text-white/70 text-xs mt-1">{selectedForm.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => printForm(selectedForm)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30" title="طباعة">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedForm(null)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {selectedForm.fields.map(sec => (
                <div key={sec.section}>
                  <p className="text-xs font-bold text-white bg-gray-800 rounded-lg px-3 py-1.5 mb-2">{sec.section}</p>
                  <div className="border rounded-xl overflow-hidden divide-y divide-gray-100">
                    {sec.items.map(item => (
                      <div key={item} className="flex items-center">
                        <div className="w-44 shrink-0 px-3 py-2 bg-gray-50 text-xs text-gray-700 font-medium border-l">{item}</div>
                        <div className="flex-1 px-3 py-2 text-xs text-gray-300">___________________________</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-6">توقيع الطرف الأول</p>
                  <div className="border-t border-gray-300 pt-1 text-xs text-gray-400">الاسم / التاريخ</div>
                </div>
                <div className="border rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-6">توقيع الطرف الثاني</p>
                  <div className="border-t border-gray-300 pt-1 text-xs text-gray-400">الاسم / التاريخ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
