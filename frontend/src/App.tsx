import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AddPropertyPage from './pages/AddPropertyPage'
import ContractsPage from './pages/ContractsPage'
import MaintenancePage from './pages/MaintenancePage'
import ListingsPage from './pages/ListingsPage'
import PaymentsPage from './pages/PaymentsPage'
import UsersPage from './pages/UsersPage'
import MarketingPage from './pages/MarketingPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/add" element={<AddPropertyPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="marketing" element={<MarketingPage />} />
      </Route>
    </Routes>
  )
}
