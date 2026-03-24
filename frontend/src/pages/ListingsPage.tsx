import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Search, Megaphone, Eye, Star, Building2, MapPin } from 'lucide-react'
import { PROPERTY_TYPES } from '../lib/constants'

export default function ListingsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [city, setCity] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['listings', search, type, city, page],
    queryFn: () => api.get('/listings', { params: { search, type, city, page, limit: 12 } }).then(r => r.data)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التسويق العقاري</h1>
        <p className="text-gray-500 text-sm">استعرض الإعلانات والعروض العقارية المتاحة</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pr-10" placeholder="بحث في الإعلانات..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="select w-40" value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
            <option value="">جميع الأنواع</option>
            <option value="FOR_RENT">للإيجار</option>
            <option value="FOR_SALE">للبيع</option>
          </select>
          <input className="input w-40" placeholder="المدينة" value={city} onChange={e => { setCity(e.target.value); setPage(1) }} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.listings?.map((l: any) => (
              <div key={l.id} className="card p-0 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {l.property?.images?.[0] ? (
                    <img src={l.property.images[0]} alt={l.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><Building2 size={40} className="text-gray-300" /></div>
                  )}
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${l.type === 'FOR_RENT' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                    {l.type === 'FOR_RENT' ? 'للإيجار' : 'للبيع'}
                  </span>
                  {l.featured && (
                    <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={11} fill="currentColor" /> مميز
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{l.title}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
                    <MapPin size={13} /> {l.property?.city}
                    {l.property?.type && <span className="mr-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{PROPERTY_TYPES[l.property.type]}</span>}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{l.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">{l.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">ر.س</span></span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Eye size={13} /> {l.views}</span>
                  </div>
                  {l.property?.owner && (
                    <p className="text-xs text-gray-400 mt-2 border-t pt-2">{l.property.owner.name} • {l.property.owner.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!data?.listings?.length && (
            <div className="text-center py-12"><Megaphone size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">لا توجد إعلانات</p></div>
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
