import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import PropertyMap from '../components/PropertyMap'
import { Search, Filter, MapPin, Building2 } from 'lucide-react'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'
import { Link } from 'react-router-dom'

export default function MapPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['properties-map', search, type, status],
    queryFn: () => api.get('/properties', { params: { search, type, status, limit: 100 } }).then(r => r.data)
  })

  const properties = data?.properties || []
  const withCoords = properties.filter((p: any) => p.lat && p.lng)
  const withoutCoords = properties.filter((p: any) => !p.lat || !p.lng)

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700 border-green-200',
    RENTED: 'bg-blue-100 text-blue-700 border-blue-200',
    SOLD: 'bg-gray-100 text-gray-700 border-gray-200',
    UNDER_MAINTENANCE: 'bg-orange-100 text-orange-700 border-orange-200',
    RESERVED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={24} className="text-primary-600" />
            خريطة العقارات
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {withCoords.length} عقار على الخريطة
            {withoutCoords.length > 0 && <span className="text-orange-500"> · {withoutCoords.length} بدون إحداثيات</span>}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pr-10" placeholder="بحث عن عقار..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-40" value={type} onChange={e => setType(e.target.value)}>
            <option value="">جميع الأنواع</option>
            {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="select w-40" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">جميع الحالات</option>
            {Object.entries(PROPERTY_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={15} />
            <span className="hidden sm:inline">تصفية</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-96 bg-gray-50 rounded-xl border">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
            </div>
          ) : withCoords.length > 0 ? (
            <PropertyMap properties={withCoords} height="550px" />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <MapPin size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">لا توجد عقارات بإحداثيات محددة</p>
              <p className="text-gray-400 text-sm mt-1">أضف إحداثيات lat/lng للعقارات لعرضها على الخريطة</p>
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[550px] overflow-y-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            قائمة العقارات ({properties.length})
          </p>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          ) : properties.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Building2 size={32} className="mx-auto mb-2" />
              <p className="text-sm">لا توجد عقارات</p>
            </div>
          ) : (
            properties.map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`}
                className={`block card p-3 hover:shadow-md transition-all cursor-pointer border ${
                  selected?.id === p.id ? 'border-primary-400 bg-primary-50' : 'border-gray-100'
                }`}
                onClick={() => setSelected(p)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} />
                      {p.city}{p.district ? ` - ${p.district}` : ''}
                      {(!p.lat || !p.lng) && (
                        <span className="text-orange-400 text-xs mr-1">· بدون إحداثيات</span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusColors[p.status] || ''}`}>
                    {PROPERTY_STATUS[p.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-primary-600">{p.price?.toLocaleString()} ر.س</span>
                  <span className="text-xs text-gray-400">{PROPERTY_TYPES[p.type]}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
