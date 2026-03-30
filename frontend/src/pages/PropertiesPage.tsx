import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Plus, Search, Building2, MapPin, BedDouble, Bath, Maximize } from 'lucide-react'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'
import { useAuthStore } from '../store/authStore'

export default function PropertiesPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['properties', search, type, status, page],
    queryFn: () => api.get('/properties', { params: { search, type, status, page, limit: 12 } }).then(r => r.data)
  })

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
          <h1 className="text-2xl font-bold text-gray-900">العقارات</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة وعرض جميع العقارات</p>
        </div>
        {['ADMIN', 'OWNER', 'AGENT'].includes(user?.role || '') && (
          <Link to="/properties/add" className="btn-primary">
            <Plus size={18} /> إضافة عقار
          </Link>
        )}
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pr-10" placeholder="بحث عن عقار..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="select w-40" value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
            <option value="">جميع الأنواع</option>
            {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="select w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">جميع الحالات</option>
            {Object.entries(PROPERTY_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.properties?.map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`}
                className="card p-0 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-48 bg-gray-100">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><Building2 size={40} className="text-gray-300" /></div>
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
                    <span className="text-lg font-bold text-primary-600">{p.price.toLocaleString()}<span className="text-xs font-normal text-gray-500"> ر.س/شهر</span></span>
                    <span className="text-xs text-gray-400">{p.owner?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!data?.properties?.length && (
            <div className="text-center py-12">
              <Building2 size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد عقارات</p>
            </div>
          )}

          {data?.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: data.pages }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
