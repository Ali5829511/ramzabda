import { Link } from 'react-router-dom'
import { Building2, MapPin, BedDouble, Bath, Maximize, Heart } from 'lucide-react'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'
import { useFavorites } from '../pages/FavoritesPage'

interface Property {
  id: string
  title: string
  type: string
  status: string
  city: string
  district?: string
  price: number
  area: number
  bedrooms?: number
  bathrooms?: number
  images?: string[]
  owner?: { name: string }
}

interface PropertyCardProps {
  property: Property
  showFavorite?: boolean
  className?: string
}

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'badge-available',
  RENTED: 'badge-rented',
  SOLD: 'badge-sold',
  UNDER_MAINTENANCE: 'badge-maintenance',
  RESERVED: 'badge-pending',
}

export default function PropertyCard({ property: p, showFavorite = true, className = '' }: PropertyCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const fav = isFavorite(p.id)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    fav ? removeFavorite(p.id) : addFavorite(p)
  }

  return (
    <Link to={`/properties/${p.id}`}
      className={`card p-0 overflow-hidden hover:shadow-lg transition-shadow group block ${className}`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 size={40} className="text-gray-300" />
          </div>
        )}

        {/* Status Badge */}
        <span className={`absolute top-3 right-3 ${STATUS_BADGE[p.status] || 'badge-pending'}`}>
          {PROPERTY_STATUS[p.status]}
        </span>

        {/* Type Badge */}
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          {PROPERTY_TYPES[p.type]}
        </span>

        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={handleFavorite}
            className={`absolute bottom-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
              fav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
            }`}
            title={fav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
            <Heart size={15} className={fav ? 'fill-white' : ''} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{p.title}</h3>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin size={13} />
          {p.city}{p.district ? ` - ${p.district}` : ''}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {p.bedrooms && (
            <span className="flex items-center gap-1">
              <BedDouble size={13} /> {p.bedrooms} غرف
            </span>
          )}
          {p.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath size={13} /> {p.bathrooms} حمامات
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize size={13} /> {p.area} م²
          </span>
        </div>

        {/* Price & Owner */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {p.price?.toLocaleString()}
            <span className="text-xs font-normal text-gray-500"> ر.س/شهر</span>
          </span>
          {p.owner?.name && (
            <span className="text-xs text-gray-400 truncate max-w-[100px]">{p.owner.name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
