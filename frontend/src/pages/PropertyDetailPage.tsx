import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { ArrowRight, MapPin, BedDouble, Bath, Maximize, Phone, Mail, Building2, FileText, Wrench } from 'lucide-react'
import { PROPERTY_TYPES, PROPERTY_STATUS, MAINTENANCE_STATUS, CONTRACT_TYPES } from '../lib/constants'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then(r => r.data)
  })

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
  if (!property) return <div className="text-center py-12 text-gray-500">العقار غير موجود</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowRight size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
        <span className={`mr-auto ${property.status === 'AVAILABLE' ? 'badge-available' : property.status === 'RENTED' ? 'badge-rented' : 'badge-sold'}`}>
          {PROPERTY_STATUS[property.status]}
        </span>
      </div>

      {property.images?.length > 0 && (
        <div className="rounded-2xl overflow-hidden h-72">
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">تفاصيل العقار</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 size={16} className="text-primary-500" />
                <span className="text-sm">{PROPERTY_TYPES[property.type]}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-primary-500" />
                <span className="text-sm">{property.city}{property.district ? ` - ${property.district}` : ''}</span>
              </div>
              {property.bedrooms && <div className="flex items-center gap-2 text-gray-600"><BedDouble size={16} className="text-primary-500" /><span className="text-sm">{property.bedrooms} غرف نوم</span></div>}
              {property.bathrooms && <div className="flex items-center gap-2 text-gray-600"><Bath size={16} className="text-primary-500" /><span className="text-sm">{property.bathrooms} حمامات</span></div>}
              <div className="flex items-center gap-2 text-gray-600"><Maximize size={16} className="text-primary-500" /><span className="text-sm">{property.area} م²</span></div>
              {property.floor && <div className="flex items-center gap-2 text-gray-600"><Building2 size={16} className="text-primary-500" /><span className="text-sm">الطابق {property.floor}</span></div>}
            </div>
            {property.description && <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>}
            {property.amenities?.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-2">المميزات</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a: string) => (
                    <span key={a} className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {property.contracts?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} />العقود</h2>
              {property.contracts.map((c: any) => (
                <div key={c.id} className="border rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{CONTRACT_TYPES[c.type]}</span>
                    <span className={c.status === 'ACTIVE' ? 'badge-active' : 'badge-sold'}>{c.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">المستأجر: {c.tenant?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(c.startDate).toLocaleDateString('ar-SA')} - {new Date(c.endDate).toLocaleDateString('ar-SA')}</p>
                </div>
              ))}
            </div>
          )}

          {property.maintenanceRequests?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Wrench size={18} />طلبات الصيانة</h2>
              {property.maintenanceRequests.map((m: any) => (
                <div key={m.id} className="border rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{m.title}</span>
                    <span className="badge-pending">{MAINTENANCE_STATUS[m.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <p className="text-gray-500 text-sm mb-1">السعر</p>
            <p className="text-3xl font-bold text-primary-600">{property.price.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">ريال سعودي / شهر</p>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3">المالك</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold">{property.owner?.name?.[0]}</span>
              </div>
              <p className="font-medium">{property.owner?.name}</p>
            </div>
            {property.owner?.phone && (
              <a href={`tel:${property.owner.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-2">
                <Phone size={14} /> {property.owner.phone}
              </a>
            )}
            {property.owner?.email && (
              <a href={`mailto:${property.owner.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
                <Mail size={14} /> {property.owner.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
