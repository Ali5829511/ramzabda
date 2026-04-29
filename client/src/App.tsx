import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Units from "./pages/Units";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import MaintenancePage from "./pages/Maintenance";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Owners from "./pages/Owners";
import Tenants from "./pages/Tenants";
import Technicians from "./pages/Technicians";
import Brokers from "./pages/Brokers";
import Marketing from "./pages/Marketing";
import Communications from "./pages/Communications";
import EjarIntegration from "./pages/EjarIntegration";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/properties" component={Properties} />
        <Route path="/units" component={Units} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/payments" component={Payments} />
        <Route path="/maintenance" component={MaintenancePage} />
        <Route path="/employees" component={Employees} />
        <Route path="/reports" component={Reports} />
        <Route path="/owners" component={Owners} />
        <Route path="/tenants" component={Tenants} />
        <Route path="/technicians" component={Technicians} />
        <Route path="/brokers" component={Brokers} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/communications" component={Communications} />
        <Route path="/ejar" component={EjarIntegration} />
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
