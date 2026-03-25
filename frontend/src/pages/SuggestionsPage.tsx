import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Sparkles, Building2, MapPin, BedDouble, Bath, Maximize, Heart, TrendingUp, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'تبوك', 'أبها', 'حائل', 'القصيم']

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  RENTED: 'bg-blue-100 text-blue-700',
  SOLD: 'bg-gray-100 text-gray-700',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-700',
  RESERVED: 'bg-yellow-100 text-yellow-700',
}

export default function SuggestionsPage() {
  const [prefs, setPrefs] = useState({
    type: '',
    city: '',
    maxPrice: '',
    minArea: '',
    bedrooms: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [saved, setSaved] = useState<string[]>([])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['suggestions', prefs],
    queryFn: () => api.get('/properties', {
      params: {
        type: prefs.type || undefined,
        city: prefs.city || undefined,
        status: 'AVAILABLE',
        limit: 12,
      }
    }).then(r => {
      let props = r.data.properties || []
      if (prefs.maxPrice) props = props.filter((p: any) => p.price <= Number(prefs.maxPrice))
      if (prefs.minArea) props = props.filter((p: any) => p.area >= Number(prefs.minArea))
      if (prefs.bedrooms) props = props.filter((p: any) => p.bedrooms >= Number(prefs.bedrooms))
      props = [...props].sort(() => Math.random() - 0.5)
      return { properties: props }
    })
  })

  const properties = data?.properties || []

  const matchScore = (p: any): number => {
    let score = 70
    if (prefs.type && p.type === prefs.type) score += 15
    if (prefs.city && p.city === prefs.city) score += 10
    if (prefs.bedrooms && p.bedrooms >= Number(prefs.bedrooms)) score += 5
    return Math.min(score, 99)
  }

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-yellow-500" />
            اقتراحات ذكية
          </h1>
          <p className="text-gray-500 text-sm mt-1">عقارات مختارة لك بناءً على تفضيلاتك</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} />
            تحديث
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border font-medium transition-colors ${
              showFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            <SlidersHorizontal size={15} />
            تفضيلاتي
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card border-primary-100 bg-primary-50/30">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-primary-600" />
            حدد تفضيلاتك للحصول على اقتراحات أدق
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">نوع العقار</label>
              <select className="select w-full text-sm" value={prefs.type}
                onChange={e => setPrefs(p => ({ ...p, type: e.target.value }))}>
                <option value="">أي نوع</option>
                {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">المدينة</label>
              <select className="select w-full text-sm" value={prefs.city}
                onChange={e => setPrefs(p => ({ ...p, city: e.target.value }))}>
                <option value="">أي مدينة</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">أقصى سعر (ر.س)</label>
              <input className="input w-full text-sm" type="number" placeholder="مثال: 5000"
                value={prefs.maxPrice}
                onChange={e => setPrefs(p => ({ ...p, maxPrice: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">أدنى مساحة (م²)</label>
              <input className="input w-full text-sm" type="number" placeholder="مثال: 100"
                value={prefs.minArea}
                onChange={e => setPrefs(p => ({ ...p, minArea: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">غرف النوم</label>
              <select className="select w-full text-sm" value={prefs.bedrooms}
                onChange={e => setPrefs(p => ({ ...p, bedrooms: e.target.value }))}>
                <option value="">أي عدد</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => setPrefs({ type: '', city: '', maxPrice: '', minArea: '', bedrooms: '' })}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            مسح التفضيلات
          </button>
        </div>
      )}

      {saved.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-pink-50 border border-pink-100 rounded-xl px-4 py-2.5">
          <Heart size={15} className="text-pink-500 fill-pink-500" />
          <span>لديك <strong className="text-gray-900">{saved.length}</strong> عقار محفوظ في المفضلة</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد عقارات تناسب تفضيلاتك حالياً</p>
          <p className="text-gray-400 text-sm mt-1">جرب تعديل معايير البحث</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{properties.length}</span> عقار مقترح لك
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map((p: any) => {
              const score = matchScore(p)
              const isSaved = saved.includes(p.id)
              return (
                <div key={p.id} className="card p-0 overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  <div className="relative h-48 bg-gray-100">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <Building2 size={40} className="text-gray-300" />
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
                      <TrendingUp size={12} className="text-green-500" />
                      <span className="text-xs font-bold text-green-600">{score}% تطابق</span>
                    </div>

                    <button
                      onClick={() => toggleSave(p.id)}
                      className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        isSaved ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-400 hover:text-pink-500'
                      }`}>
                      <Heart size={14} className={isSaved ? 'fill-white' : ''} />
                    </button>

                    <span className={`absolute bottom-3 right-3 text-xs px-2 py-0.5 rounded-full ${statusColors[p.status] || ''}`}>
                      {PROPERTY_STATUS[p.status]}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 line-clamp-1 flex-1">{p.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg shrink-0">{PROPERTY_TYPES[p.type]}</span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                      <MapPin size={13} /> {p.city}{p.district ? ` - ${p.district}` : ''}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {p.bedrooms && <span className="flex items-center gap-1"><BedDouble size={12} /> {p.bedrooms} غرف</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath size={12} /> {p.bathrooms} حمامات</span>}
                      <span className="flex items-center gap-1"><Maximize size={12} /> {p.area} م²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {p.price.toLocaleString()}
                        <span className="text-xs font-normal text-gray-500"> ر.س/شهر</span>
                      </span>
                      <Link to={`/properties/${p.id}`}
                        className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
