import { useState } from 'react';
import { useStore } from '../../data/store';
import {
  TrendingUp, MapPin, Home, BarChart2, DollarSign, Printer, ExternalLink,
  ChevronDown, ChevronUp, Search,
  CheckCircle, ArrowUpRight, ArrowDownRight,
  Minus, Copy, Globe
} from 'lucide-react';

// ─── Market Data (Sakani / REGA / Ejar Indicators 2024–2025) ──
interface CityData {
  name: string;
  nameEn: string;
  region: string;
  priceIndex: number;    // relative to 2020 baseline
  yoyChange: number;     // % year-over-year change
  units: {
    type: string;
    typeKey: string;
    min: number; max: number; avg: number;
    byBedrooms?: Record<string, { min: number; max: number; avg: number }>;
    districts: { name: string; min: number; max: number; avg: number }[];
  }[];
  totalDeals2024: string;
  marketStatus: 'hot' | 'stable' | 'cooling';
  lastUpdated: string;
}

const MARKET_DATA: CityData[] = [
  {
    name: 'الرياض', nameEn: 'Riyadh', region: 'منطقة الرياض',
    priceIndex: 1.35, yoyChange: 8.2, totalDeals2024: '142,000+',
    marketStatus: 'hot', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 20000, max: 80000, avg: 42000,
        byBedrooms: {
          'استوديو': { min: 18000, max: 30000, avg: 22000 },
          '1 غرفة':  { min: 22000, max: 40000, avg: 30000 },
          '2 غرفة':  { min: 32000, max: 55000, avg: 42000 },
          '3 غرف':   { min: 40000, max: 75000, avg: 55000 },
          '4 غرف':   { min: 55000, max: 90000, avg: 68000 },
        },
        districts: [
          { name: 'النرجس',     min: 40000, max: 75000, avg: 55000 },
          { name: 'الملقا',     min: 50000, max: 90000, avg: 65000 },
          { name: 'حطين',      min: 45000, max: 80000, avg: 58000 },
          { name: 'العليا',     min: 45000, max: 85000, avg: 60000 },
          { name: 'الروضة',    min: 35000, max: 60000, avg: 46000 },
          { name: 'المونسية',  min: 35000, max: 60000, avg: 45000 },
          { name: 'الرحمانية', min: 28000, max: 50000, avg: 38000 },
          { name: 'الشفا',     min: 22000, max: 42000, avg: 30000 },
          { name: 'المرسلات',  min: 28000, max: 50000, avg: 36000 },
          { name: 'الجنادرية', min: 30000, max: 55000, avg: 40000 },
        ],
      },
      {
        type: 'دور', typeKey: 'floor', min: 35000, max: 120000, avg: 65000,
        districts: [
          { name: 'النرجس',   min: 55000, max: 100000, avg: 72000 },
          { name: 'الملقا',   min: 65000, max: 120000, avg: 85000 },
          { name: 'الروضة',  min: 45000, max: 80000, avg: 58000 },
          { name: 'الشفا',   min: 35000, max: 65000, avg: 48000 },
        ],
      },
      {
        type: 'فيلا', typeKey: 'villa', min: 70000, max: 300000, avg: 135000,
        districts: [
          { name: 'الملقا',      min: 130000, max: 280000, avg: 185000 },
          { name: 'حطين',       min: 110000, max: 250000, avg: 165000 },
          { name: 'النرجس',     min: 90000, max: 200000, avg: 140000 },
          { name: 'قرطبة',      min: 80000, max: 180000, avg: 120000 },
          { name: 'الشفا',      min: 70000, max: 150000, avg: 100000 },
        ],
      },
      {
        type: 'مكتب / محل', typeKey: 'commercial', min: 25000, max: 200000, avg: 75000,
        districts: [
          { name: 'العليا / طريق الملك فهد', min: 80000, max: 200000, avg: 130000 },
          { name: 'غرناطة / الروابي',       min: 40000, max: 100000, avg: 65000 },
          { name: 'شارع الملك عبدالله',     min: 50000, max: 130000, avg: 80000 },
        ],
      },
    ],
  },
  {
    name: 'جدة', nameEn: 'Jeddah', region: 'منطقة مكة المكرمة',
    priceIndex: 1.28, yoyChange: 5.4, totalDeals2024: '78,000+',
    marketStatus: 'hot', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 18000, max: 75000, avg: 38000,
        byBedrooms: {
          'استوديو': { min: 15000, max: 28000, avg: 20000 },
          '1 غرفة':  { min: 18000, max: 35000, avg: 26000 },
          '2 غرفة':  { min: 28000, max: 50000, avg: 38000 },
          '3 غرف':   { min: 38000, max: 68000, avg: 50000 },
          '4 غرف':   { min: 50000, max: 85000, avg: 62000 },
        },
        districts: [
          { name: 'الشاطئ',          min: 45000, max: 80000, avg: 58000 },
          { name: 'الزهراء',         min: 38000, max: 65000, avg: 50000 },
          { name: 'الروضة',          min: 35000, max: 60000, avg: 45000 },
          { name: 'النسيم',          min: 25000, max: 45000, avg: 33000 },
          { name: 'أبحر الشمالية',  min: 40000, max: 75000, avg: 55000 },
          { name: 'الحمدانية',       min: 30000, max: 55000, avg: 40000 },
          { name: 'الصفا',           min: 22000, max: 40000, avg: 29000 },
          { name: 'السلامة',         min: 28000, max: 52000, avg: 38000 },
        ],
      },
      {
        type: 'دور', typeKey: 'floor', min: 30000, max: 110000, avg: 58000,
        districts: [
          { name: 'الشاطئ', min: 55000, max: 110000, avg: 75000 },
          { name: 'الزهراء', min: 45000, max: 90000, avg: 62000 },
          { name: 'النسيم',  min: 30000, max: 60000, avg: 42000 },
        ],
      },
      {
        type: 'فيلا', typeKey: 'villa', min: 65000, max: 280000, avg: 120000,
        districts: [
          { name: 'أبحر الشمالية', min: 120000, max: 280000, avg: 175000 },
          { name: 'الشاطئ',        min: 100000, max: 240000, avg: 155000 },
          { name: 'الزهراء',       min: 80000, max: 180000, avg: 120000 },
        ],
      },
    ],
  },
  {
    name: 'الدمام', nameEn: 'Dammam', region: 'المنطقة الشرقية',
    priceIndex: 1.18, yoyChange: 3.7, totalDeals2024: '45,000+',
    marketStatus: 'stable', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 15000, max: 55000, avg: 30000,
        byBedrooms: {
          'استوديو': { min: 12000, max: 22000, avg: 16000 },
          '1 غرفة':  { min: 15000, max: 28000, avg: 20000 },
          '2 غرفة':  { min: 22000, max: 40000, avg: 30000 },
          '3 غرف':   { min: 30000, max: 55000, avg: 40000 },
          '4 غرف':   { min: 40000, max: 65000, avg: 50000 },
        },
        districts: [
          { name: 'الشاطئ',   min: 30000, max: 55000, avg: 40000 },
          { name: 'النزهة',   min: 25000, max: 45000, avg: 33000 },
          { name: 'العنود',   min: 20000, max: 38000, avg: 28000 },
          { name: 'الفيصلية', min: 18000, max: 35000, avg: 25000 },
        ],
      },
      {
        type: 'فيلا', typeKey: 'villa', min: 50000, max: 180000, avg: 90000,
        districts: [
          { name: 'الشاطئ', min: 80000, max: 180000, avg: 120000 },
          { name: 'النزهة', min: 60000, max: 130000, avg: 85000 },
        ],
      },
    ],
  },
  {
    name: 'الخبر', nameEn: 'Khobar', region: 'المنطقة الشرقية',
    priceIndex: 1.22, yoyChange: 4.8, totalDeals2024: '28,000+',
    marketStatus: 'stable', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 18000, max: 65000, avg: 35000,
        byBedrooms: {
          '1 غرفة':  { min: 18000, max: 32000, avg: 24000 },
          '2 غرفة':  { min: 25000, max: 48000, avg: 34000 },
          '3 غرف':   { min: 35000, max: 60000, avg: 45000 },
        },
        districts: [
          { name: 'الخبر الشمالية', min: 35000, max: 65000, avg: 48000 },
          { name: 'العقربية',       min: 28000, max: 55000, avg: 38000 },
          { name: 'اليرموك',        min: 22000, max: 42000, avg: 30000 },
        ],
      },
      {
        type: 'فيلا', typeKey: 'villa', min: 60000, max: 200000, avg: 100000,
        districts: [
          { name: 'الخبر الشمالية', min: 90000, max: 200000, avg: 130000 },
          { name: 'العقربية',       min: 70000, max: 160000, avg: 105000 },
        ],
      },
    ],
  },
  {
    name: 'مكة المكرمة', nameEn: 'Makkah', region: 'منطقة مكة المكرمة',
    priceIndex: 1.20, yoyChange: 4.1, totalDeals2024: '35,000+',
    marketStatus: 'stable', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 14000, max: 55000, avg: 28000,
        byBedrooms: {
          '1 غرفة': { min: 14000, max: 28000, avg: 19000 },
          '2 غرفة': { min: 20000, max: 40000, avg: 28000 },
          '3 غرف':  { min: 28000, max: 52000, avg: 38000 },
        },
        districts: [
          { name: 'العزيزية',  min: 22000, max: 48000, avg: 32000 },
          { name: 'الششة',    min: 18000, max: 38000, avg: 25000 },
          { name: 'النزهة',   min: 20000, max: 42000, avg: 28000 },
        ],
      },
    ],
  },
  {
    name: 'المدينة المنورة', nameEn: 'Madinah', region: 'منطقة المدينة المنورة',
    priceIndex: 1.15, yoyChange: 3.2, totalDeals2024: '22,000+',
    marketStatus: 'stable', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 12000, max: 45000, avg: 24000,
        byBedrooms: {
          '1 غرفة': { min: 12000, max: 24000, avg: 17000 },
          '2 غرفة': { min: 18000, max: 35000, avg: 24000 },
          '3 غرف':  { min: 24000, max: 44000, avg: 32000 },
        },
        districts: [
          { name: 'العزيزية',     min: 20000, max: 42000, avg: 28000 },
          { name: 'قربان',        min: 16000, max: 32000, avg: 22000 },
          { name: 'سلطانة',       min: 14000, max: 28000, avg: 19000 },
        ],
      },
    ],
  },
  {
    name: 'أبها', nameEn: 'Abha', region: 'منطقة عسير',
    priceIndex: 1.10, yoyChange: 2.8, totalDeals2024: '12,000+',
    marketStatus: 'cooling', lastUpdated: 'ديسمبر 2024',
    units: [
      {
        type: 'شقة سكنية', typeKey: 'apartment', min: 10000, max: 30000, avg: 18000,
        districts: [
          { name: 'المنهل',   min: 15000, max: 30000, avg: 20000 },
          { name: 'الورود',   min: 12000, max: 25000, avg: 17000 },
        ],
      },
    ],
  },
];

// ─── Pricing Templates Data ────────────────────────────────────
const PRICING_TEMPLATES = [
  {
    id: 'property-management',
    name: 'عرض سعر إدارة عقار',
    category: 'إدارة الأملاك',
    icon: '🏢',
    services: [
      { name: 'رسوم الإدارة السنوية',      basis: '% من الإيجار السنوي', min: 5, max: 10, unit: '%', note: 'يشمل التحصيل ومتابعة العقود' },
      { name: 'رسوم تأجير الوحدة',         basis: 'دفعة واحدة',           min: 1, max: 2, unit: 'شهر إيجار', note: 'مكافأة الإيجار الأول' },
      { name: 'رسوم تجديد العقد',          basis: 'دفعة واحدة',           min: 500, max: 1000, unit: 'ر.س', note: 'لكل عقد مجدد' },
      { name: 'متابعة الصيانة الدورية',    basis: 'شهري',                  min: 200, max: 500, unit: 'ر.س/شهر', note: 'يشمل الجولات الدورية' },
      { name: 'التوثيق في منصة إيجار',     basis: 'دفعة واحدة',           min: 0, max: 0, unit: 'مجانًا', note: 'خدمة مجانية' },
      { name: 'تقارير مالية شهرية',        basis: 'شهري',                  min: 0, max: 0, unit: 'مجانًا', note: 'عبر البوابة الإلكترونية' },
    ],
  },
  {
    id: 'brokerage',
    name: 'عرض سعر خدمات الوساطة العقارية',
    category: 'الوساطة',
    icon: '🤝',
    services: [
      { name: 'عمولة البيع',         basis: 'من قيمة الصفقة', min: 1.5, max: 2.5, unit: '%', note: 'وفق نظام الوساطة العقارية' },
      { name: 'عمولة الإيجار',       basis: 'من الإيجار السنوي', min: 2.5, max: 5, unit: '%', note: 'لكل عقد جديد' },
      { name: 'التسويق الإعلاني',   basis: 'شهري',               min: 500, max: 3000, unit: 'ر.س', note: 'منصات وسوشيال ميديا' },
      { name: 'تصوير احترافي',      basis: 'لمرة واحدة',          min: 800, max: 2500, unit: 'ر.س', note: 'صور + جولة افتراضية' },
      { name: 'إعداد قوائم العقار', basis: 'لمرة واحدة',          min: 200, max: 500, unit: 'ر.س', note: 'على جميع المنصات' },
    ],
  },
  {
    id: 'maintenance',
    name: 'عرض سعر خدمات الصيانة',
    category: 'الصيانة',
    icon: '🔧',
    services: [
      { name: 'صيانة سباكة — أساسية',    basis: 'لكل مهمة',  min: 150, max: 500,   unit: 'ر.س', note: 'تسريب / صنبور / صرف' },
      { name: 'صيانة كهرباء — أساسية',   basis: 'لكل مهمة',  min: 150, max: 600,   unit: 'ر.س', note: 'مقابس / إضاءة / قواطع' },
      { name: 'صيانة تكييف — تنظيف',     basis: 'لكل وحدة',  min: 120, max: 250,   unit: 'ر.س', note: 'تنظيف فلاتر + شحن غاز' },
      { name: 'صيانة تكييف — كشف أعطال', basis: 'لكل مهمة',  min: 200, max: 500,   unit: 'ر.س', note: 'شامل قطع الغيار الصغيرة' },
      { name: 'دهانات — غرفة',            basis: 'لكل غرفة',  min: 800, max: 1800,  unit: 'ر.س', note: 'يشمل العمالة والمواد' },
      { name: 'دهانات — شقة كاملة',       basis: 'لكل وحدة',  min: 3000, max: 8000, unit: 'ر.س', note: 'حسب المساحة' },
      { name: 'صيانة نجارة — أبواب',      basis: 'لكل باب',   min: 100, max: 400,   unit: 'ر.س', note: 'إصلاح / تعديل' },
      { name: 'عقد صيانة سنوي شامل',      basis: 'سنوي',       min: 3000, max: 8000, unit: 'ر.س/سنة', note: '4 زيارات دورية + طوارئ' },
    ],
  },
  {
    id: 'consultancy',
    name: 'عرض سعر الاستشارات العقارية',
    category: 'الاستشارات',
    icon: '📊',
    services: [
      { name: 'دراسة سوقية للعقار',       basis: 'لمرة واحدة', min: 1500, max: 5000, unit: 'ر.س', note: 'تقييم + مقارنة سوقية' },
      { name: 'تقرير تقييم عقاري',        basis: 'لمرة واحدة', min: 2000, max: 8000, unit: 'ر.س', note: 'وفق معايير RICS' },
      { name: 'استشارة استثمارية',         basis: 'للساعة',      min: 500, max: 1500, unit: 'ر.س/ساعة', note: 'حضور مكتب / عن بعد' },
      { name: 'إعداد خطة تطوير العقار',   basis: 'لمرة واحدة', min: 3000, max: 10000, unit: 'ر.س', note: 'جدوى + توصيات' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────
const marketStatusConfig = {
  hot:     { label: 'سوق نشط',    color: 'bg-red-100 text-red-700',    icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
  stable:  { label: 'سوق مستقر', color: 'bg-green-100 text-green-700', icon: <Minus className="w-3.5 h-3.5" /> },
  cooling: { label: 'سوق هادئ',  color: 'bg-blue-100 text-blue-700',   icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
};

function fmt(n: number) { return n.toLocaleString('ar-SA'); }

// ─── Print market report ───────────────────────────────────────
function printMarketStudy(
  city: CityData, unitType: string, district: string,
  ownerName: string, propertyName: string, preparedBy: string
) {
  const unit = city.units.find(u => u.typeKey === unitType) ?? city.units[0];
  const distData = unit.districts.find(d => d.name === district);
  const win = window.open('', '_blank');
  if (!win) return;
  const sc = marketStatusConfig[city.marketStatus];
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
  <meta charset="UTF-8"><title>دراسة سوقية — ${city.name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a2e;background:#fff}
    .page{max-width:794px;margin:0 auto;padding:0}
    /* header */
    .hdr{background:linear-gradient(135deg,#1a1a2e,#2d3a6e);color:#fff;padding:32px;display:flex;justify-content:space-between;align-items:flex-start}
    .hdr-title{font-size:22px;font-weight:900}
    .hdr-sub{font-size:12px;opacity:.75;margin-top:6px}
    .hdr-badge{background:rgba(255,255,255,.15);border-radius:12px;padding:12px 18px;text-align:center}
    .hdr-badge .city{font-size:18px;font-weight:900}
    .hdr-badge .sub{font-size:10px;opacity:.7;margin-top:2px}
    /* meta bar */
    .meta{background:#f1f5f9;display:flex;gap:0;border-bottom:1px solid #e2e8f0}
    .meta-item{flex:1;padding:12px 16px;border-left:1px solid #e2e8f0}
    .meta-item:last-child{border-left:none}
    .meta-lbl{font-size:10px;color:#64748b}
    .meta-val{font-size:13px;font-weight:700;color:#1e293b;margin-top:2px}
    /* body */
    .body{padding:24px}
    /* section */
    .sec{margin-bottom:24px}
    .sec-title{font-size:13px;font-weight:800;color:#2d3a6e;border-right:4px solid #2d3a6e;padding:5px 12px;background:#f0f4ff;border-radius:0 8px 8px 0;margin-bottom:12px}
    /* price card */
    .price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .price-card{border:2px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center}
    .price-card.highlight{border-color:#2d3a6e;background:#f0f4ff}
    .price-lbl{font-size:10px;color:#64748b}
    .price-val{font-size:22px;font-weight:900;color:#1e293b;margin:4px 0}
    .price-unit{font-size:10px;color:#94a3b8}
    /* table */
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#1e293b;color:#fff;padding:8px 12px;text-align:right;font-weight:700}
    td{padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#374151}
    tr:hover td{background:#f8fafc}
    /* bedroom table */
    .bed-table{width:100%}
    /* index bar */
    .index-bar{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px}
    .index-num{font-size:36px;font-weight:900;color:#2d3a6e}
    .index-info{flex:1}
    .index-label{font-size:12px;color:#64748b}
    .index-change{font-size:14px;font-weight:700;color:#16a34a;margin-top:2px}
    /* disclaimer */
    .disc{font-size:10px;color:#94a3b8;background:#f8fafc;border-radius:8px;padding:10px;margin-top:24px;text-align:center;line-height:1.6}
    /* footer */
    .footer{background:#1a1a2e;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;font-size:10px;opacity:.9}
    .sakani-badge{background:#16a34a;color:#fff;border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><div class="page">
  <div class="hdr">
    <div>
      <div class="hdr-title">📊 الدراسة السوقية الإيجارية</div>
      <div class="hdr-sub">رمز الإبداع لإدارة الأملاك — تقرير مبني على بيانات سكني وإيجار</div>
      <div style="margin-top:10px;font-size:12px;opacity:.8">مُعدّ لـ: <strong>${ownerName}</strong>${propertyName ? ` | العقار: ${propertyName}` : ''}</div>
      <div style="font-size:11px;opacity:.7;margin-top:4px">أُعدّ بتاريخ: ${new Date().toLocaleDateString('ar-SA')} | بواسطة: ${preparedBy}</div>
    </div>
    <div class="hdr-badge">
      <div class="city">🏙️ ${city.name}</div>
      <div class="sub">${city.region}</div>
      <div style="margin-top:8px;background:${city.marketStatus === 'hot' ? '#ef4444' : city.marketStatus === 'stable' ? '#16a34a' : '#3b82f6'};border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700">${sc.label}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><div class="meta-lbl">نوع الوحدة</div><div class="meta-val">${unit.type}</div></div>
    ${district ? `<div class="meta-item"><div class="meta-lbl">الحي / المنطقة</div><div class="meta-val">${district}</div></div>` : ''}
    <div class="meta-item"><div class="meta-lbl">إجمالي الصفقات 2024</div><div class="meta-val">${city.totalDeals2024}</div></div>
    <div class="meta-item"><div class="meta-lbl">آخر تحديث</div><div class="meta-val">${city.lastUpdated}</div></div>
  </div>

  <div class="body">
    <div class="sec">
      <div class="sec-title">أولاً: المؤشر الإيجاري العام — ${city.name}</div>
      <div class="index-bar">
        <div class="index-num">${city.priceIndex.toFixed(2)}</div>
        <div class="index-info">
          <div style="font-size:14px;font-weight:700;color:#1e293b">مؤشر السعر الإيجاري (أساس 2020 = 1.00)</div>
          <div class="index-label">يعكس التغير التراكمي في أسعار الإيجار منذ 2020</div>
          <div class="index-change">▲ ارتفع ${city.yoyChange}% خلال آخر 12 شهراً</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:4px">المصدر: منصة سكني • بيانات إيجار الموثقة</div>
        </div>
      </div>
    </div>

    <div class="sec">
      <div class="sec-title">ثانياً: النطاق السعري الإيجاري — ${unit.type} في ${district || city.name}</div>
      <div class="price-grid">
        <div class="price-card"><div class="price-lbl">الحد الأدنى</div><div class="price-val">${fmt(distData?.min ?? unit.min)}</div><div class="price-unit">ريال / سنة</div></div>
        <div class="price-card highlight"><div class="price-lbl">متوسط السوق</div><div class="price-val">${fmt(distData?.avg ?? unit.avg)}</div><div class="price-unit">ريال / سنة ★</div></div>
        <div class="price-card"><div class="price-lbl">الحد الأقصى</div><div class="price-val">${fmt(distData?.max ?? unit.max)}</div><div class="price-unit">ريال / سنة</div></div>
      </div>
      ${unit.byBedrooms ? `
      <br>
      <div class="sec-title" style="margin-top:8px">التفصيل حسب عدد الغرف</div>
      <table>
        <tr><th>عدد الغرف</th><th>أدنى سعر ر.س</th><th>متوسط السوق ر.س</th><th>أعلى سعر ر.س</th></tr>
        ${Object.entries(unit.byBedrooms).map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${fmt(v.min)}</td><td style="color:#2d3a6e;font-weight:700">${fmt(v.avg)}</td><td>${fmt(v.max)}</td></tr>`).join('')}
      </table>` : ''}
    </div>

    <div class="sec">
      <div class="sec-title">ثالثاً: مقارنة الأحياء — ${unit.type} في ${city.name}</div>
      <table>
        <tr><th>الحي</th><th>أدنى ر.س</th><th>متوسط ر.س ★</th><th>أعلى ر.س</th><th>مقارنة بالمتوسط</th></tr>
        ${unit.districts.map(d => {
          const diff = Math.round(((d.avg - unit.avg) / unit.avg) * 100);
          return `<tr ${d.name === district ? 'style="background:#eff6ff;font-weight:700"' : ''}>
            <td>${d.name}${d.name === district ? ' ◄' : ''}</td>
            <td>${fmt(d.min)}</td>
            <td style="color:#2d3a6e;font-weight:700">${fmt(d.avg)}</td>
            <td>${fmt(d.max)}</td>
            <td style="color:${diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#64748b'}">${diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} ${Math.abs(diff)}%</td>
          </tr>`;
        }).join('')}
      </table>
    </div>

    <div class="sec">
      <div class="sec-title">رابعاً: التوصية السعرية لعقاركم</div>
      <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:18px">
        <div style="font-size:14px;font-weight:800;color:#0369a1;margin-bottom:10px">📌 التوصية المبنية على بيانات السوق</div>
        <p style="font-size:13px;color:#334155;line-height:1.8">
          استناداً إلى بيانات منصة سكني والمؤشرات الإيجارية الصادرة عن منصة إيجار، يُوصى بتسعير وحدتكم (${unit.type}) في ${district || city.name} 
          ضمن نطاق <strong>${fmt(distData?.min ?? unit.min)} — ${fmt(distData?.max ?? unit.max)} ريال سنوياً</strong>، 
          مع الأخذ بعين الاعتبار أن متوسط السوق الحالي هو <strong>${fmt(distData?.avg ?? unit.avg)} ريال</strong>.<br><br>
          يُعدّ السوق حالياً <strong>${sc.label}</strong> مع نمو سعري بلغ <strong>${city.yoyChange}%</strong> خلال العام الماضي.
          يُنصح بمراجعة السعر دورياً كل 6 أشهر للتوافق مع تحركات السوق.
        </p>
      </div>
    </div>

    <div class="disc">
      ⚠️ إخلاء مسؤولية: هذا التقرير استرشادي يستند إلى بيانات منصة سكني ومؤشرات إيجار الموثقة. الأسعار الفعلية تتأثر بعمر المبنى، التشطيبات، الخدمات، والعرض والطلب المحلي.
      للحصول على تقييم دقيق يرجى التواصل مع رمز الإبداع لإدارة الأملاك.
      <br>المصادر: منصة سكني (sakani.sa) | هيئة العقار السعودية REGA | منصة إيجار
    </div>
  </div>

  <div class="footer">
    <span>طُبع: ${new Date().toLocaleString('ar-SA')}</span>
    <span class="sakani-badge">مدعوم ببيانات سكني</span>
    <span>رمز الإبداع لإدارة الأملاك | ramzabdae.com</span>
  </div>
</div></body></html>`);
  win.document.close();
  win.print();
}

// ─── Market Study Tab ─────────────────────────────────────────
function MarketStudyTab() {
  const { users } = useStore();
  const [selectedCity, setSelectedCity] = useState(MARKET_DATA[0].name);
  const [selectedUnitType, setSelectedUnitType] = useState('apartment');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [preparedBy, setPreparedBy] = useState('رمز الإبداع لإدارة الأملاك');
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  const city = MARKET_DATA.find(c => c.name === selectedCity)!;
  const unit = city.units.find(u => u.typeKey === selectedUnitType) ?? city.units[0];
  const distData = unit.districts.find(d => d.name === selectedDistrict);
  const sc = marketStatusConfig[city.marketStatus];
  const owners = users.filter(u => u.role === 'owner');

  const priceData = distData ?? { min: unit.min, max: unit.max, avg: unit.avg };

  return (
    <div className="space-y-5">
      {/* Sakani link banner */}
      <div className="bg-gradient-to-l from-green-700 to-emerald-600 rounded-2xl p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-green-200" />
          <div>
            <p className="font-bold">مبني على بيانات منصة سكني والمؤشرات الإيجارية</p>
            <p className="text-xs text-green-200 mt-0.5">بيانات مؤشرات الإيجار من منصة إيجار — هيئة العقار السعودية REGA</p>
          </div>
        </div>
        <a href="https://sakani.sa/reports-and-data/rental-units" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-xl text-sm font-semibold">
          <ExternalLink className="w-3.5 h-3.5" /> فتح سكني
        </a>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
          <Search className="w-4 h-4 text-green-500" /> إعدادات الدراسة السوقية
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">المدينة *</label>
            <select className="input-field text-sm" value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setSelectedDistrict(''); setSelectedUnitType('apartment'); }}>
              {MARKET_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">نوع الوحدة</label>
            <select className="input-field text-sm" value={selectedUnitType}
              onChange={e => { setSelectedUnitType(e.target.value); setSelectedDistrict(''); }}>
              {city.units.map(u => <option key={u.typeKey} value={u.typeKey}>{u.type}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الحي (اختياري)</label>
            <select className="input-field text-sm" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
              <option value="">— كل الأحياء —</option>
              {unit.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">المالك (للتقرير)</label>
            <select className="input-field text-sm" value={ownerName} onChange={e => setOwnerName(e.target.value)}>
              <option value="">— اختر مالكاً —</option>
              {owners.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
              <option value="custom">إدخال يدوي</option>
            </select>
          </div>
          {ownerName === 'custom' && (
            <div>
              <label className="label">اسم المالك</label>
              <input className="input-field text-sm" value={propertyName} onChange={e => setOwnerName(e.target.value)} placeholder="اسم المالك..." />
            </div>
          )}
          <div>
            <label className="label">اسم العقار</label>
            <input className="input-field text-sm" value={propertyName} onChange={e => setPropertyName(e.target.value)} placeholder="اسم العقار (اختياري)" />
          </div>
          <div>
            <label className="label">معدّ التقرير</label>
            <input className="input-field text-sm" value={preparedBy} onChange={e => setPreparedBy(e.target.value)} />
          </div>
        </div>
      </div>

      {/* City overview + market status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.color}`}>{sc.icon}</div>
          <div><p className="text-sm font-bold text-gray-800">{sc.label}</p><p className="text-xs text-gray-500">حالة السوق</p></div>
        </div>
        <div className="card">
          <p className="text-xl font-bold text-green-600">▲ {city.yoyChange}%</p>
          <p className="text-xs text-gray-500">نمو سنوي في الأسعار</p>
        </div>
        <div className="card">
          <p className="text-xl font-bold text-blue-600">{city.priceIndex.toFixed(2)}</p>
          <p className="text-xs text-gray-500">مؤشر السعر (أساس 2020)</p>
        </div>
        <div className="card">
          <p className="text-xl font-bold text-gray-800">{city.totalDeals2024}</p>
          <p className="text-xs text-gray-500">صفقة موثقة 2024</p>
        </div>
      </div>

      {/* Price range highlight */}
      <div className="card bg-gradient-to-l from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            النطاق السعري — {unit.type} في {selectedDistrict || city.name}
          </h3>
          <span className="text-xs text-gray-400">ر.س / سنة</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'الحد الأدنى', value: priceData.min, color: 'text-gray-700', bg: 'bg-white' },
            { label: '★ متوسط السوق', value: priceData.avg, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'الحد الأقصى', value: priceData.max, color: 'text-gray-700', bg: 'bg-white' },
          ].map(p => (
            <div key={p.label} className={`${p.bg} rounded-2xl p-4 text-center border border-blue-200`}>
              <p className="text-xs text-gray-500 mb-1">{p.label}</p>
              <p className={`text-2xl font-black ${p.color}`}>{fmt(p.value)}</p>
              <p className="text-xs text-gray-400 mt-1">ريال سنوياً</p>
              <p className="text-xs text-gray-400">{fmt(Math.round(p.value / 12))} / شهر</p>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{fmt(priceData.min)}</span>
            <span className="text-blue-600 font-semibold">متوسط: {fmt(priceData.avg)}</span>
            <span>{fmt(priceData.max)}</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-orange-400 rounded-full" />
            <div className="absolute top-0 h-full w-0.5 bg-blue-800" style={{
              left: `${((priceData.avg - priceData.min) / (priceData.max - priceData.min)) * 100}%`
            }} />
          </div>
        </div>
      </div>

      {/* By bedrooms */}
      {unit.byBedrooms && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4 text-sm flex items-center gap-2">
            <Home className="w-4 h-4 text-indigo-500" /> التفصيل حسب عدد الغرف — {city.name}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">النوع</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">أدنى ر.س</th>
                  <th className="text-right px-3 py-2 font-semibold text-blue-600">متوسط ر.س ★</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">أعلى ر.س</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">الشهري (متوسط)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(unit.byBedrooms).map(([k, v]) => (
                  <tr key={k} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-semibold text-gray-800">{k}</td>
                    <td className="px-3 py-2.5 text-gray-600">{fmt(v.min)}</td>
                    <td className="px-3 py-2.5 font-bold text-blue-700">{fmt(v.avg)}</td>
                    <td className="px-3 py-2.5 text-gray-600">{fmt(v.max)}</td>
                    <td className="px-3 py-2.5 text-gray-500">{fmt(Math.round(v.avg / 12))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* District comparison */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" /> مقارنة الأحياء — {unit.type} في {city.name}
        </h3>
        <div className="space-y-2">
          {[...unit.districts].sort((a, b) => b.avg - a.avg).map((d, i) => {
            const pct = ((d.avg - unit.min) / (unit.max - unit.min)) * 100;
            const diff = Math.round(((d.avg - unit.avg) / unit.avg) * 100);
            const isSelected = d.name === selectedDistrict;
            return (
              <div key={d.name}
                className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}
                onClick={() => setSelectedDistrict(d.name === selectedDistrict ? '' : d.name)}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                    <span className="text-sm font-semibold text-gray-800">{d.name}</span>
                    {isSelected && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">محدد</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{fmt(d.min)} — {fmt(d.max)}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${diff > 5 ? 'bg-green-100 text-green-700' : diff < -5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {diff > 0 ? `▲${diff}%` : diff < 0 ? `▼${Math.abs(diff)}%` : '—'}
                    </span>
                    <span className="font-bold text-blue-700">{fmt(d.avg)} ر.س</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All cities overview */}
      <div className="card">
        <button className="flex items-center justify-between w-full text-sm font-bold text-gray-700"
          onClick={() => setExpandedCity(expandedCity ? null : 'all')}>
          <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-yellow-500" /> مقارنة شاملة بين المدن</span>
          {expandedCity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedCity && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-3 py-2 font-semibold">المدينة</th>
                  <th className="text-right px-3 py-2 font-semibold">حالة السوق</th>
                  <th className="text-right px-3 py-2 font-semibold">نمو سنوي</th>
                  <th className="text-right px-3 py-2 font-semibold">متوسط الشقق ر.س</th>
                  <th className="text-right px-3 py-2 font-semibold">متوسط الفلل ر.س</th>
                  <th className="text-right px-3 py-2 font-semibold">صفقات 2024</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_DATA.map(c => {
                  const apt = c.units.find(u => u.typeKey === 'apartment');
                  const vil = c.units.find(u => u.typeKey === 'villa');
                  const csc = marketStatusConfig[c.marketStatus];
                  return (
                    <tr key={c.name} className={`border-t hover:bg-gray-50 ${c.name === selectedCity ? 'bg-blue-50 font-semibold' : ''}`}
                      onClick={() => setSelectedCity(c.name)}>
                      <td className="px-3 py-2.5 font-bold cursor-pointer">{c.name} {c.name === selectedCity ? '◄' : ''}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${csc.color}`}>{csc.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-green-600 font-semibold">▲ {c.yoyChange}%</td>
                      <td className="px-3 py-2.5 text-blue-700 font-semibold">{apt ? fmt(apt.avg) : '—'}</td>
                      <td className="px-3 py-2.5 text-purple-700 font-semibold">{vil ? fmt(vil.avg) : '—'}</td>
                      <td className="px-3 py-2.5 text-gray-600">{c.totalDeals2024}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print button */}
      <div className="flex gap-3">
        <button
          onClick={() => printMarketStudy(city, selectedUnitType, selectedDistrict, ownerName || 'العميل الكريم', propertyName, preparedBy)}
          className="btn-primary flex items-center gap-2 flex-1 justify-center">
          <Printer className="w-4 h-4" /> طباعة الدراسة السوقية الكاملة
        </button>
        <a href="https://sakani.sa/reports-and-data/rental-units" target="_blank" rel="noreferrer"
          className="btn-secondary flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> منصة سكني
        </a>
      </div>
    </div>
  );
}

// ─── Pricing Templates Tab ────────────────────────────────────
function PricingTemplatesTab() {
  const [copied, setCopied] = useState('');
  const [selected, setSelected] = useState(PRICING_TEMPLATES[0].id);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');

  const template = PRICING_TEMPLATES.find(t => t.id === selected)!;

  const getAmount = (svc: typeof template.services[0]) => {
    const key = `${selected}-${svc.name}`;
    return customAmounts[key] ?? '';
  };
  const setAmount = (svc: typeof template.services[0], val: string) => {
    setCustomAmounts(p => ({ ...p, [`${selected}-${svc.name}`]: val }));
  };

  const total = template.services.reduce((s, svc) => {
    const v = parseFloat(getAmount(svc)) || 0;
    return s + v;
  }, 0);
  const discountAmount = discount ? parseFloat(discount) : 0;
  const net = total - discountAmount;

  const printQuote = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8"><title>عرض سعر — ${template.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a2e}
      .page{max-width:794px;margin:0 auto;padding:0}
      .hdr{background:linear-gradient(135deg,#d97706,#92400e);color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
      .hdr h1{font-size:20px;font-weight:900}
      .hdr p{font-size:11px;opacity:.8;margin-top:4px}
      .quote-meta{background:#fef3c7;padding:12px 24px;font-size:12px;display:flex;gap:24px;border-bottom:1px solid #fcd34d}
      .body{padding:24px 32px}
      .service-title{font-size:13px;font-weight:800;color:#92400e;margin-bottom:10px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px}
      th{background:#1a1a2e;color:#fff;padding:8px 12px;text-align:right}
      td{padding:8px 12px;border-bottom:1px solid #e5e7eb}
      tr:last-child td{border:none}
      .total-box{background:#fffbeb;border:2px solid #d97706;border-radius:12px;padding:16px 20px;margin-top:8px}
      .total-row{display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px}
      .total-row.main{font-size:16px;font-weight:900;color:#92400e;border-top:2px solid #d97706;padding-top:8px;margin-top:8px}
      .footer{background:#1a1a2e;color:#fff;padding:12px 24px;font-size:10px;display:flex;justify-content:space-between;margin-top:16px}
      .terms{font-size:10px;color:#6b7280;padding:12px;background:#f9fafb;border-radius:8px;line-height:1.7}
      @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body><div class="page">
    <div class="hdr">
      <div>
        <h1>${template.icon} ${template.name}</h1>
        <p>رمز الإبداع لإدارة الأملاك</p>
      </div>
      <div style="text-align:left;background:rgba(255,255,255,.15);padding:10px 16px;border-radius:10px">
        <div style="font-size:10px;opacity:.7">تاريخ العرض</div>
        <div style="font-size:15px;font-weight:900">${date}</div>
        ${clientName ? `<div style="font-size:11px;margin-top:6px">مُقدَّم لـ: ${clientName}</div>` : ''}
      </div>
    </div>
    <div class="body">
      <table>
        <tr><th>الخدمة</th><th>الأساس</th><th>النطاق السوقي</th><th>المبلغ المتفق ر.س</th><th>ملاحظة</th></tr>
        ${template.services.map(svc => `<tr>
          <td><strong>${svc.name}</strong></td>
          <td>${svc.basis}</td>
          <td>${svc.min === 0 ? '—' : svc.unit === '%' ? `${svc.min}–${svc.max}%` : `${fmt(svc.min)}–${fmt(svc.max)}`}</td>
          <td style="font-weight:700;color:#92400e">${getAmount(svc) ? fmt(parseFloat(getAmount(svc))) + ' ر.س' : svc.unit === 'مجانًا' ? '🎁 مجانًا' : '—'}</td>
          <td style="color:#6b7280;font-size:11px">${svc.note}</td>
        </tr>`).join('')}
      </table>
      <div class="total-box">
        <div class="total-row"><span>الإجمالي:</span><span>${fmt(total)} ر.س</span></div>
        ${discountAmount > 0 ? `<div class="total-row" style="color:#16a34a"><span>خصم:</span><span>— ${fmt(discountAmount)} ر.س</span></div>` : ''}
        <div class="total-row main"><span>الصافي المستحق:</span><span>${fmt(net)} ر.س</span></div>
      </div>
      ${notes ? `<div style="margin-top:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:10px;font-size:12px"><strong>ملاحظات:</strong> ${notes}</div>` : ''}
      <div class="terms" style="margin-top:16px">
        <strong>الشروط العامة:</strong><br>
        • هذا العرض ساري لمدة 30 يوماً من تاريخ إصداره<br>
        • يستلزم توقيع عقد الخدمة للمباشرة في تقديم الخدمات<br>
        • الأسعار المذكورة شاملة ضريبة القيمة المضافة (15%)
      </div>
    </div>
    <div class="footer">
      <span>طُبع: ${new Date().toLocaleString('ar-SA')}</span>
      <span>رمز الإبداع لإدارة الأملاك | ramzabdae.com</span>
    </div>
    </div></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-5">
      {/* Template selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRICING_TEMPLATES.map(t => (
          <button key={t.id} onClick={() => setSelected(t.id)}
            className={`card text-right transition-all hover:shadow-md ${selected === t.id ? 'border-2 border-yellow-400 bg-yellow-50' : 'hover:border-yellow-200'}`}>
            <div className="text-2xl mb-1">{t.icon}</div>
            <p className="font-bold text-sm text-gray-800 leading-tight">{t.name}</p>
            <p className="text-xs text-gray-400 mt-1">{t.category}</p>
          </button>
        ))}
      </div>

      {/* Quote header fields */}
      <div className="card space-y-3">
        <h3 className="font-bold text-gray-700 text-sm">بيانات عرض السعر</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="label">مُقدَّم إلى (اسم العميل)</label>
            <input className="input-field text-sm" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="اسم المالك / العميل" />
          </div>
          <div>
            <label className="label">تاريخ العرض</label>
            <input type="date" className="input-field text-sm" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">خصم إجمالي ر.س</label>
            <input type="number" className="input-field text-sm" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" />
          </div>
        </div>
      </div>

      {/* Services pricing table */}
      <div className="card">
        <h3 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-yellow-500" /> {template.name}
        </h3>
        <div className="space-y-2">
          {template.services.map((svc, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="col-span-4">
                <p className="text-sm font-semibold text-gray-800">{svc.name}</p>
                <p className="text-xs text-gray-400">{svc.note}</p>
              </div>
              <div className="col-span-2 text-xs text-gray-500">{svc.basis}</div>
              <div className="col-span-3 text-xs text-blue-700 font-medium">
                {svc.unit === 'مجانًا' ? (
                  <span className="text-green-600 font-bold">🎁 مجانًا</span>
                ) : svc.unit === '%' ? (
                  `${svc.min}–${svc.max}% ${svc.unit}`
                ) : (
                  `${fmt(svc.min)} – ${fmt(svc.max)} ${svc.unit}`
                )}
              </div>
              <div className="col-span-3">
                {svc.unit === 'مجانًا' ? (
                  <div className="input-field text-sm bg-green-50 text-green-700 font-bold">مجانًا</div>
                ) : (
                  <div className="relative">
                    <input type="number" min="0" className="input-field text-sm pr-10"
                      value={getAmount(svc)} onChange={e => setAmount(svc, e.target.value)}
                      placeholder="أدخل المبلغ..." />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">ر.س</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>الإجمالي:</span>
            <span className="font-bold">{fmt(total)} ر.س</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>خصم:</span>
              <span className="font-bold">— {fmt(discountAmount)} ر.س</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-yellow-700 border-t border-dashed pt-2">
            <span>الصافي المستحق:</span>
            <span>{fmt(net)} ر.س</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">ملاحظات وشروط إضافية</label>
        <textarea className="input-field text-sm" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="شروط خاصة، ملاحظات للعميل..." />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={printQuote} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Printer className="w-4 h-4" /> طباعة عرض السعر
        </button>
        <button
          onClick={() => {
            const text = template.services.map(s => `${s.name}: ${getAmount(s) || (s.unit === 'مجانًا' ? 'مجانًا' : '—')} ر.س`).join('\n');
            navigator.clipboard.writeText(`عرض سعر: ${template.name}\nتاريخ: ${date}\n\n${text}\n\nالإجمالي: ${fmt(net)} ر.س\nرمز الإبداع لإدارة الأملاك`);
            setCopied('yes');
            setTimeout(() => setCopied(''), 2000);
          }}
          className="btn-secondary flex items-center gap-2 px-4">
          {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          نسخ
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function PricingMarketPage() {
  const [tab, setTab] = useState<'market' | 'pricing'>('market');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            الدراسة السوقية وقوالب التسعير
          </h1>
          <p className="section-subtitle">مؤشرات سوق الإيجار مدعومة ببيانات سكني | عروض أسعار خدمات الشركة</p>
        </div>
        <a href="https://sakani.sa/reports-and-data/rental-units" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-3 py-1.5 rounded-xl hover:bg-green-200 transition font-semibold">
          <Globe className="w-3.5 h-3.5" /> منصة سكني الرسمية
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'market', label: 'الدراسة السوقية للملاك', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'pricing', label: 'قوالب التسعير وعروض الأسعار', icon: <DollarSign className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as 'market' | 'pricing')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'market' && <MarketStudyTab />}
      {tab === 'pricing' && <PricingTemplatesTab />}
    </div>
  );
}
