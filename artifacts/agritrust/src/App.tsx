import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { PrivateRoute } from "@/components/private-route";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Marketplace from "@/pages/marketplace";
import MarketplaceDetail from "@/pages/marketplace-detail";
import FarmerProfile from "@/pages/farmer-profile";
import SettingsPage from "@/pages/settings";
import Community from "@/pages/community";
import PostDetail from "@/pages/post-detail";
import DealWise from "@/pages/dealwise";
import QualityScan from "@/pages/qualityscan";
import LandShare from "@/pages/landshare";
import HarvestFinance from "@/pages/harvest-finance";
import Barter from "@/pages/barter";
import AgriHaul from "@/pages/agrihaul";
import Impact from "@/pages/impact";
import FarmAccounting from "@/pages/farm-accounting";
import FarmScorePage from "@/pages/farmscore";
import Notifications from "@/pages/notifications";
import TheftAlerts from "@/pages/theft-alerts";
import Disputes from "@/pages/disputes";
import Mentorship from "@/pages/mentorship";
import Academy from "@/pages/academy";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import AgriSave from "@/pages/agrisave";
import AgriEnergy from "@/pages/agrienergy";
import MyListings from "@/pages/my-listings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/about" component={About} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={MarketplaceDetail} />
      <Route path="/farmers/:id" component={FarmerProfile} />
      <Route path="/community" component={Community} />
      <Route path="/community/:id" component={PostDetail} />
      <Route path="/agrienergy" component={AgriEnergy} />
      <Route path="/mentorship" component={Mentorship} />
      <Route path="/academy" component={Academy} />
      <Route path="/profile/:id" component={Profile} />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route path="/dashboard">
        {() => <PrivateRoute component={Dashboard} />}
      </Route>
      <Route path="/dealwise">
        {() => <PrivateRoute component={DealWise} />}
      </Route>
      <Route path="/qualityscan">
        {() => <PrivateRoute component={QualityScan} />}
      </Route>
      <Route path="/landshare">
        {() => <PrivateRoute component={LandShare} />}
      </Route>
      <Route path="/harvest-finance">
        {() => <PrivateRoute component={HarvestFinance} />}
      </Route>
      <Route path="/barter">
        {() => <PrivateRoute component={Barter} />}
      </Route>
      <Route path="/agrihaul">
        {() => <PrivateRoute component={AgriHaul} />}
      </Route>
      <Route path="/impact">
        {() => <PrivateRoute component={Impact} />}
      </Route>
      <Route path="/farm-accounting">
        {() => <PrivateRoute component={FarmAccounting} />}
      </Route>
      <Route path="/farmscore">
        {() => <PrivateRoute component={FarmScorePage} />}
      </Route>
      <Route path="/notifications">
        {() => <PrivateRoute component={Notifications} />}
      </Route>
      <Route path="/theft-alerts">
        {() => <PrivateRoute component={TheftAlerts} />}
      </Route>
      <Route path="/disputes">
        {() => <PrivateRoute component={Disputes} />}
      </Route>
      <Route path="/agrisave">
        {() => <PrivateRoute component={AgriSave} />}
      </Route>
      <Route path="/settings">
        {() => <PrivateRoute component={SettingsPage} />}
      </Route>
      <Route path="/my-listings">
        {() => <PrivateRoute component={MyListings} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="agritrust-theme">
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
