import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, BedDouble, Bath, Maximize, Heart, Share2, Trash2, Search } from 'lucide-react'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'ramz-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const save = (items: any[]) => {
    setFavorites(items)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  const addFavorite = (property: any) => {
    if (favorites.find(f => f.id === property.id)) return
    save([...favorites, property])
    toast.success('تمت الإضافة إلى المفضلة')
  }

  const removeFavorite = (id: string) => {
    save(favorites.filter(f => f.id !== id))
    toast.success('تمت الإزالة من المفضلة')
  }

  const isFavorite = (id: string) => favorites.some(f => f.id === id)

  return { favorites, addFavorite, removeFavorite, isFavorite }
}

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = favorites.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const removeSelected = () => {
    selected.forEach(id => removeFavorite(id))
    setSelected(new Set())
  }

  const handleShare = async () => {
    const text = favorites.map(p => `${p.title} - ${p.city} - ${p.price?.toLocaleString()} ر.س`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('تم نسخ قائمة المفضلة')
    } catch {
      toast.error('تعذر النسخ')
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
          <p className="text-gray-500 text-sm mt-1">
            {favorites.length > 0 ? `${favorites.length} عقار محفوظ` : 'لا توجد عقارات محفوظة'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={removeSelected} className="btn-danger text-sm flex items-center gap-2">
              <Trash2 size={15} />
              حذف المحدد ({selected.size})
            </button>
          )}
          {favorites.length > 0 && (
            <button onClick={handleShare} className="btn-secondary text-sm">
              <Share2 size={15} />
              مشاركة القائمة
            </button>
          )}
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pr-10" placeholder="بحث في المفضلة..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="card text-center py-16">
          <Heart size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">قائمة المفضلة فارغة</h3>
          <p className="text-gray-400 text-sm mb-6">أضف العقارات التي تعجبك إلى المفضلة لتجدها هنا</p>
          <Link to="/properties" className="btn-primary inline-flex">
            <Building2 size={16} />
            تصفح العقارات
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Search size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا توجد نتائج للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p: any) => (
            <div key={p.id}
              className={`card p-0 overflow-hidden hover:shadow-lg transition-shadow group relative ${
                selected.has(p.id) ? 'ring-2 ring-primary-500' : ''
              }`}>
              {/* Select Checkbox */}
              <div className="absolute top-3 right-3 z-10">
                <input type="checkbox" checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="w-4 h-4 accent-primary-600 cursor-pointer" />
              </div>

              <Link to={`/properties/${p.id}`}>
                <div className="relative h-48 bg-gray-100">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 size={40} className="text-gray-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 ${statusColors[p.status] || 'badge-pending'}`}>
                    {PROPERTY_STATUS[p.status]}
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
                    {p.area && <span className="flex items-center gap-1"><Maximize size={13} /> {p.area} م²</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {p.price?.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500"> ر.س/شهر</span>
                    </span>
                    {p.type && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {PROPERTY_TYPES[p.type]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Remove Button */}
              <div className="px-4 pb-4">
                <button onClick={() => removeFavorite(p.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
                  <Heart size={14} className="fill-red-500" />
                  إزالة من المفضلة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
