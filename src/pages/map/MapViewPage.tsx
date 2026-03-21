import { useState } from 'react';
import { useStore } from '../../data/store';
import {
  MapPin, Building2, Home, Search, Filter, ExternalLink,
  CheckCircle, Clock, Wrench, AlertCircle, Info, Navigation
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  available:   { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  rented:      { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  reserved:    { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  maintenance: { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'الرياض':          { lat: 24.7136, lng: 46.6753 },
  'جدة':             { lat: 21.4858, lng: 39.1925 },
  'الدمام':          { lat: 26.4207, lng: 50.0888 },
  'الخبر':           { lat: 26.2172, lng: 50.1971 },
  'مكة المكرمة':     { lat: 21.3891, lng: 39.8579 },
  'المدينة المنورة': { lat: 24.5247, lng: 39.5692 },
  'أبها':            { lat: 18.2164, lng: 42.5053 },
  'الطائف':          { lat: 21.2702, lng: 40.4158 },
  'تبوك':            { lat: 28.3998, lng: 36.5716 },
  'بريدة':           { lat: 26.3360, lng: 43.9750 },
};

export default function MapViewPage() {
  const { properties, units } = useStore();
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];
  const types = [...new Set(properties.map(p => p.propertyType).filter(Boolean))];

  const typeLabels: Record<string, string> = {
    residential: 'سكني', commercial: 'تجاري', mixed: 'مختلط',
    villa: 'فيلا', building: 'مبنى', apartment: 'شقة', land: 'أرض'
  };

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || p.propertyName.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q)) &&
      (!filterCity || p.city === filterCity) &&
      (!filterType || p.propertyType === filterType)
    );
  });

  const sel = selected ? properties.find(p => p.id === selected) : null;
  const selUnits = sel ? units.filter(u => u.propertyId === sel.id) : [];
  const selRented = selUnits.filter(u => u.unitStatus === 'rented').length;
  const selOcc = selUnits.length ? Math.round((selRented / selUnits.length) * 100) : 0;

  // Overall stats
  const totalRented = units.filter(u => u.unitStatus === 'rented').length;
  const totalAvail  = units.filter(u => u.unitStatus === 'available').length;
  const overallOcc  = units.length ? Math.round((totalRented / units.length) * 100) : 0;

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <MapPin className="w-6 h-6 text-red-500" /> خريطة العقارات التفاعلية
        </h1>
        <p className="section-subtitle">توزيع جغرافي لجميع العقارات والوحدات</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي العقارات', value: properties.length, color: 'text-yellow-600', icon: <Building2 className="w-4 h-4" /> },
          { label: 'نسبة الإشغال', value: `${overallOcc}%`, color: 'text-blue-600', icon: <Home className="w-4 h-4" /> },
          { label: 'وحدات مؤجرة', value: totalRented, color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
          { label: 'وحدات متاحة', value: totalAvail, color: 'text-orange-600', icon: <AlertCircle className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            <div className={`${s.color}`}>{s.icon}</div>
            <div><p className={`text-xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Properties List */}
        <div className="lg:col-span-1 space-y-3">
          {/* Filters */}
          <div className="card space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pr-9 text-sm" placeholder="بحث عن عقار، مدينة، حي..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="input-field text-sm" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                <option value="">كل المدن</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input-field text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">كل الأنواع</option>
                {types.map(t => <option key={t} value={t}>{typeLabels[t] ?? t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>لا توجد عقارات</p>
              </div>
            ) : filtered.map(p => {
              const pUnits = units.filter(u => u.propertyId === p.id);
              const rented = pUnits.filter(u => u.unitStatus === 'rented').length;
              const occ = pUnits.length ? Math.round((rented / pUnits.length) * 100) : 0;
              const isSelected = selected === p.id;
              return (
                <div key={p.id} onClick={() => setSelected(isSelected ? null : p.id)}
                  className={`card cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm ${occ >= 80 ? 'bg-green-100 text-green-700' : occ >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {occ}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{p.propertyName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {p.city}{p.district ? ` / ${p.district}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{rented} مؤجرة</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{pUnits.filter(u => u.unitStatus === 'available').length} متاحة</span>
                        <span className="text-xs text-gray-400">{typeLabels[p.propertyType] ?? p.propertyType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map + Detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Embedded Map */}
          <div className="card overflow-hidden p-0 h-80 relative">
            {sel ? (
              <iframe
                key={sel.id}
                className="w-full h-full border-0"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((sel.address ?? sel.city ?? 'الرياض') + ' ' + (sel.propertyName ?? ''))}&output=embed&hl=ar`}
                title="خريطة العقار"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-center p-6">
                <Navigation className="w-12 h-12 text-blue-400 mb-3" />
                <p className="font-bold text-gray-700">اختر عقاراً لعرضه على الخريطة</p>
                <p className="text-xs text-gray-400 mt-2">اضغط على أي عقار من القائمة</p>
                {/* City distribution */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {cities.slice(0, 6).map(city => {
                    const cnt = properties.filter(p => p.city === city).length;
                    return (
                      <div key={city} onClick={() => setFilterCity(city)}
                        className="bg-white rounded-xl p-2 cursor-pointer hover:bg-blue-50 transition-colors border border-blue-100">
                        <p className="font-bold text-sm text-blue-700">{cnt}</p>
                        <p className="text-xs text-gray-500">{city}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Property Detail */}
          {sel && (
            <div className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{sel.propertyName}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {sel.address ?? sel.city}{sel.district ? ` / ${sel.district}` : ''}
                  </p>
                </div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(sel.propertyName + ' ' + sel.city)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl">
                  <ExternalLink className="w-3.5 h-3.5" /> فتح في خرائط جوجل
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'إجمالي الوحدات', value: selUnits.length },
                  { label: 'مؤجرة', value: selRented, color: 'text-blue-600' },
                  { label: 'متاحة', value: selUnits.filter(u => u.unitStatus === 'available').length, color: 'text-green-600' },
                  { label: 'نسبة الإشغال', value: `${selOcc}%`, color: selOcc >= 80 ? 'text-green-600' : selOcc >= 50 ? 'text-yellow-600' : 'text-red-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${s.color ?? 'text-gray-800'}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Units status breakdown */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">الوحدات</p>
                <div className="grid grid-cols-2 gap-2">
                  {selUnits.slice(0, 6).map(u => {
                    const sc = STATUS_COLORS[u.unitStatus] ?? STATUS_COLORS.available;
                    return (
                      <div key={u.id} className={`${sc.bg} rounded-xl p-2.5 flex items-center gap-2`}>
                        <div className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${sc.text} truncate`}>وحدة {u.unitNumber}</p>
                          <p className="text-xs text-gray-500">{u.unitType ?? '—'} | {u.unitArea ?? u.area ?? '—'} م²</p>
                        </div>
                      </div>
                    );
                  })}
                  {selUnits.length > 6 && (
                    <div className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-center">
                      <span className="text-xs text-gray-400">+{selUnits.length - 6} وحدة أخرى</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial */}
              <div className="bg-gradient-to-l from-yellow-50 to-amber-50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">إجمالي قيمة العقود</p>
                  <p className="text-xl font-black text-yellow-700">{sel.totalContractValue.toLocaleString('ar-SA')} ر.س</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">رسوم التوثيق</p>
                  <p className="font-bold text-gray-700">{sel.totalDocumentationFees.toLocaleString('ar-SA')} ر.س</p>
                </div>
              </div>
            </div>
          )}

          {/* City distribution table */}
          {!sel && (
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-yellow-500" /> توزيع العقارات بالمدن
              </h3>
              <div className="space-y-2">
                {cities.map(city => {
                  const cnt = properties.filter(p => p.city === city).length;
                  const pct = Math.round((cnt / properties.length) * 100);
                  const coords = CITY_COORDS[city];
                  return (
                    <div key={city} className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-colors cursor-pointer"
                      onClick={() => { setFilterCity(city); }}>
                      <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{city}</span>
                          <span className="font-bold text-yellow-600">{cnt} عقار</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {coords && (
                        <a href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1 text-blue-400 hover:text-blue-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
