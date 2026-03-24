import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Users } from 'lucide-react'
import { USER_ROLES } from '../lib/constants'

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data)
  })

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    OWNER: 'bg-blue-100 text-blue-700',
    AGENT: 'bg-purple-100 text-purple-700',
    TENANT: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">المستخدمون</h1>
        <p className="text-gray-500 text-sm">إدارة مستخدمي المنصة</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">المستخدم</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">الدور</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">الهاتف</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-bold text-sm">{u.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>{USER_ROLES[u.role]}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users?.length && (
            <div className="text-center py-12"><Users size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">لا يوجد مستخدمون</p></div>
          )}
        </div>
      )}
    </div>
  )
}
