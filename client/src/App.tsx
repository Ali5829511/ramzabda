import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/layout/DashboardLayout";
// Core
import Dashboard from "./pages/core/Dashboard";
import Analytics from "./pages/core/Analytics";
import Settings from "./pages/core/Settings";
// Operations
import Properties from "./pages/operations/Properties";
import PropertyDetails from "./pages/operations/PropertyDetails";
import Units from "./pages/operations/Units";
import Contracts from "./pages/operations/Contracts";
import ContractDetails from "./pages/operations/ContractDetails";
import Payments from "./pages/operations/Payments";
import MaintenancePage from "./pages/operations/Maintenance";
import Reports from "./pages/operations/Reports";
import DocumentTemplates from "./pages/operations/DocumentTemplates";
import Tasks from "./pages/operations/Tasks";
import Appointments from "./pages/operations/Appointments";
import Expenses from "./pages/operations/Expenses";
import Invoices from "./pages/operations/Invoices";
import VacantProperties from "./pages/operations/VacantProperties";
// Portals
import Owners from "./pages/portals/Owners";
import Tenants from "./pages/portals/Tenants";
import Technicians from "./pages/portals/Technicians";
import Brokers from "./pages/portals/Brokers";
import Employees from "./pages/portals/Employees";
// Marketing
import Marketing from "./pages/marketing/Marketing";
import Communications from "./pages/marketing/Communications";
import EjarIntegration from "./pages/marketing/EjarIntegration";
function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/properties" component={Properties} />
        <Route path="/properties/:id" component={PropertyDetails} />
        <Route path="/units" component={Units} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/contracts/:id" component={ContractDetails} />
        <Route path="/payments" component={Payments} />
        <Route path="/maintenance" component={MaintenancePage} />
        <Route path="/employees" component={Employees} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/vacant-properties" component={VacantProperties} />
        <Route path="/reports" component={Reports} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/owners" component={Owners} />
        <Route path="/tenants" component={Tenants} />
        <Route path="/technicians" component={Technicians} />
        <Route path="/brokers" component={Brokers} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/communications" component={Communications} />
        <Route path="/ejar" component={EjarIntegration} />
        <Route path="/document-templates" component={DocumentTemplates} />
        <Route path="/settings" component={Settings} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
