import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../lib/constants'

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  RENTED: 'bg-blue-100 text-blue-700',
  SOLD: 'bg-gray-100 text-gray-700',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-700',
  RESERVED: 'bg-yellow-100 text-yellow-700',
}

function FitBounds({ properties }: { properties: any[] }) {
  const map = useMap()
  useEffect(() => {
    const pts = properties.filter(p => p.lat && p.lng)
    if (pts.length > 0) {
      const bounds = pts.map(p => [p.lat, p.lng] as [number, number])
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [properties, map])
  return null
}

interface PropertyMapProps {
  properties: any[]
  height?: string
  single?: boolean
}

export default function PropertyMap({ properties, height = '500px', single = false }: PropertyMapProps) {
  const validProps = properties.filter(p => p.lat && p.lng)
  const center: [number, number] = validProps.length > 0
    ? [validProps[0].lat, validProps[0].lng]
    : [24.7136, 46.6753]

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer center={center} zoom={single ? 14 : 10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!single && validProps.length > 1 && <FitBounds properties={validProps} />}
        {validProps.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
            <Popup minWidth={220}>
              <div className="rtl text-right p-1">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.title} className="w-full h-28 object-cover rounded-lg mb-2" />
                )}
                <p className="font-bold text-gray-900 text-sm mb-0.5">{p.title}</p>
                <p className="text-xs text-gray-500 mb-1">{p.city}{p.district ? ` - ${p.district}` : ''}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-600">{p.price?.toLocaleString()} ر.س</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status] || ''}`}>
                    {PROPERTY_STATUS[p.status]}
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mb-2">
                  <span>{PROPERTY_TYPES[p.type]}</span>
                  {p.area && <span>{p.area} م²</span>}
                  {p.bedrooms && <span>{p.bedrooms} غرف</span>}
                </div>
                {!single && (
                  <Link to={`/properties/${p.id}`}
                    className="block w-full text-center bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                    عرض التفاصيل
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
