import { useState } from 'react';
import { useStore } from './data/store';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import OwnerDashboard from './pages/dashboards/OwnerDashboard';
import TenantDashboard from './pages/dashboards/TenantDashboard';
import TechnicianDashboard from './pages/dashboards/TechnicianDashboard';
import BrokerDashboard from './pages/dashboards/BrokerDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';
import PropertiesPage from './pages/properties/PropertiesPage';
import UnitsPage from './pages/properties/UnitsPage';
import ContractsPage from './pages/contracts/ContractsPage';
import PaymentsPage from './pages/contracts/PaymentsPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import CRMPage from './pages/crm/CRMPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import BrokerageContractsPage from './pages/brokerage/BrokerageContractsPage';
import AdLicensesPage from './pages/brokerage/AdLicensesPage';
import TicketsPage from './pages/support/TicketsPage';
import DataImportPage from './pages/import/DataImportPage';
import MarketingPage from './pages/marketing/MarketingPage';
import TemplatesPage from './pages/templates/TemplatesPage';
import PricingMarketPage from './pages/market/PricingMarketPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import PropertyReportPage from './pages/reports/PropertyReportPage';
import AccountingPage from './pages/accounting/AccountingPage';
import ContractAlertsPage from './pages/contracts/ContractAlertsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import PrintCenterPage from './pages/print/PrintCenterPage';
import MapViewPage from './pages/map/MapViewPage';
import DocumentArchivePage from './pages/archive/DocumentArchivePage';
import ROIReportsPage from './pages/reports/ROIReportsPage';
import PaymentGatewayPage from './pages/payments/PaymentGatewayPage';

function getDashboard(role: string, onNavigate?: (page: string) => void) {
  switch (role) {
    case 'admin': return <AdminDashboard />;
    case 'owner': return <OwnerDashboard />;
    case 'tenant': return <TenantDashboard />;
    case 'technician': return <TechnicianDashboard />;
    case 'broker': return <BrokerDashboard />;
    case 'employee': return <EmployeeDashboard onNavigate={onNavigate} />;
    default: return <AdminDashboard />;
  }
}

function getPage(page: string) {
  switch (page) {
    case 'dashboard': return null;
    case 'properties-list': return <PropertiesPage />;
    case 'units': return <UnitsPage />;
    case 'contracts-list': return <ContractsPage />;
    case 'payments': return <PaymentsPage />;
    case 'maintenance': return <MaintenancePage />;
    case 'customers': return <CRMPage />;
    case 'interactions': return <CRMPage />;
    case 'crm': return <CRMPage />;
    case 'appointments': return <AppointmentsPage />;
    case 'brokerage': return <BrokerageContractsPage />;
    case 'ad-licenses': return <AdLicensesPage />;
    case 'tickets': return <TicketsPage />;
    case 'data-import': return <DataImportPage />;
    case 'marketing': return <MarketingPage />;
    case 'finances': return <AccountingPage />;
    case 'templates': return <TemplatesPage />;
    case 'pricing-market': return <PricingMarketPage />;
    case 'users': return <UsersPage />;
    case 'settings': return <SettingsPage />;
    case 'property-report': return <PropertyReportPage />;
    case 'accounting': return <AccountingPage />;
    case 'contract-alerts': return <ContractAlertsPage />;
    case 'integrations': return <IntegrationsPage />;
    case 'print-center': return <PrintCenterPage />;
    case 'map-view': return <MapViewPage />;
    case 'document-archive': return <DocumentArchivePage />;
    case 'roi-reports': return <ROIReportsPage />;
    case 'payment-gateway': return <PaymentGatewayPage />;
    default: return null;
  }
}

export default function App() {
  const currentUser = useStore(s => s.currentUser);
  const [activePage, setActivePage] = useState('dashboard');

  if (!currentUser) return <LoginPage />;

  const pageContent = getPage(activePage);
  const content = pageContent ?? getDashboard(currentUser.role, setActivePage);

  return (
    <>
      <Layout activePage={activePage} onNavigate={setActivePage}>
        {content}
      </Layout>
      <AIAssistant />
    </>
  );
}
