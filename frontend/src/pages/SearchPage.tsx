import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  Search, Building2, MapPin, BedDouble, Bath, Maximize,
  SlidersHorizontal, X, ChevronDown
} from 'lucide-react'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'تبوك', 'أبها', 'القصيم']

const PRICE_RANGES = [
  { label: 'أقل من 2,000 ر.س', min: 0, max: 2000 },
  { label: '2,000 - 5,000 ر.س', min: 2000, max: 5000 },
  { label: '5,000 - 10,000 ر.س', min: 5000, max: 10000 },
  { label: '10,000 - 20,000 ر.س', min: 10000, max: 20000 },
  { label: 'أكثر من 20,000 ر.س', min: 20000, max: 999999 },
]

const AREA_RANGES = [
  { label: 'أقل من 100 م²', min: 0, max: 100 },
  { label: '100 - 200 م²', min: 100, max: 200 },
  { label: '200 - 500 م²', min: 200, max: 500 },
  { label: 'أكثر من 500 م²', min: 500, max: 99999 },
]

interface Filters {
  search: string
  type: string
  status: string
  city: string
  minPrice: string
  maxPrice: string
  minArea: string
  maxArea: string
  bedrooms: string
  bathrooms: string
}

const defaultFilters: Filters = {
  search: '', type: '', status: '', city: '',
  minPrice: '', maxPrice: '', minArea: '', maxArea: '',
  bedrooms: '', bathrooms: '',
}

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [applied, setApplied] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(true)
  const [page, setPage] = useState(1)

  const set = (field: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters(f => ({ ...f, [field]: e.target.value }))

  const { data, isLoading } = useQuery({
    queryKey: ['search', applied, page],
    queryFn: () => api.get('/properties', {
      params: {
        search: applied.search,
        type: applied.type,
        status: applied.status,
        city: applied.city,
        minPrice: applied.minPrice,
        maxPrice: applied.maxPrice,
        minArea: applied.minArea,
        maxArea: applied.maxArea,
        bedrooms: applied.bedrooms,
        bathrooms: applied.bathrooms,
        page,
        limit: 12,
      }
    }).then(r => r.data),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setApplied(filters)
    setPage(1)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setApplied(defaultFilters)
    setPage(1)
  }

  const setPriceRange = (min: number, max: number) => {
    setFilters(f => ({ ...f, minPrice: String(min), maxPrice: String(max) }))
  }

  const setAreaRange = (min: number, max: number) => {
    setFilters(f => ({ ...f, minArea: String(min), maxArea: String(max) }))
  }

  const activeFiltersCount = Object.entries(applied).filter(([, v]) => v !== '').length

  const statusColors: Record<string, string> = {
    AVAILABLE: 'badge-available',
    RENTED: 'badge-rented',
    SOLD: 'badge-sold',
    UNDER_MAINTENANCE: 'badge-maintenance',
    RESERVED: 'badge-pending',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">البحث المتقدم</h1>
          <p className="text-gray-500 text-sm mt-1">ابحث عن العقار المناسب بفلاتر دقيقة</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary text-sm">
          <SlidersHorizontal size={16} />
          الفلاتر
          {activeFiltersCount > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5 -mr-1">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <form onSubmit={handleSearch} className="card space-y-5">
          {/* Search & Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pr-10" placeholder="ابحث بالاسم أو الوصف..."
                value={filters.search} onChange={set('search')} />
            </div>
            <select className="select" value={filters.type} onChange={set('type')}>
              <option value="">جميع الأنواع</option>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* City & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="select" value={filters.city} onChange={set('city')}>
              <option value="">جميع المدن</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select" value={filters.status} onChange={set('status')}>
              <option value="">جميع الحالات</option>
              {Object.entries(PROPERTY_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Price Range Quick Select */}
          <div>
            <label className="label">نطاق السعر الشهري</label>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map(r => (
                <button key={r.label} type="button"
                  onClick={() => setPriceRange(r.min, r.max)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    filters.minPrice === String(r.min) && filters.maxPrice === String(r.max)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input className="input text-sm" type="number" placeholder="السعر الأدنى"
                value={filters.minPrice} onChange={set('minPrice')} />
              <input className="input text-sm" type="number" placeholder="السعر الأقصى"
                value={filters.maxPrice} onChange={set('maxPrice')} />
            </div>
          </div>

          {/* Area Range */}
          <div>
            <label className="label">المساحة (م²)</label>
            <div className="flex flex-wrap gap-2">
              {AREA_RANGES.map(r => (
                <button key={r.label} type="button"
                  onClick={() => setAreaRange(r.min, r.max)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    filters.minArea === String(r.min) && filters.maxArea === String(r.max)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">عدد الغرف</label>
              <select className="select" value={filters.bedrooms} onChange={set('bedrooms')}>
                <option value="">أي عدد</option>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}+ غرف</option>)}
              </select>
            </div>
            <div>
              <label className="label">عدد الحمامات</label>
              <select className="select" value={filters.bathrooms} onChange={set('bathrooms')}>
                <option value="">أي عدد</option>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+ حمامات</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Search size={16} />
              بحث
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary">
              <X size={16} />
              إعادة تعيين
            </button>
          </div>
        </form>
      )}

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {data?.total !== undefined
                  ? `${data.total} نتيجة`
                  : `${data?.properties?.length || 0} نتيجة`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data?.properties?.map((p: any) => (
                <Link key={p.id} to={`/properties/${p.id}`}
                  className="card p-0 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-gray-100">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 size={40} className="text-gray-300" />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 ${statusColors[p.status] || 'badge-pending'}`}>
                      {PROPERTY_STATUS[p.status]}
                    </span>
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                      {PROPERTY_TYPES[p.type]}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{p.title}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                      <MapPin size={13} /> {p.city}{p.district ? ` - ${p.district}` : ''}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      {p.bedrooms && <span className="flex items-center gap-1"><BedDouble size={13} /> {p.bedrooms} غرف</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath size={13} /> {p.bathrooms} حمامات</span>}
                      <span className="flex items-center gap-1"><Maximize size={13} /> {p.area} م²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {p.price?.toLocaleString()}
                        <span className="text-xs font-normal text-gray-500"> ر.س/شهر</span>
                      </span>
                      <span className="text-xs text-gray-400">{p.owner?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!data?.properties?.length && (
              <div className="text-center py-16">
                <Search size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">لا توجد نتائج</p>
                <p className="text-gray-400 text-sm mt-1">جرب تغيير معايير البحث</p>
              </div>
            )}

            {data?.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: data.pages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
