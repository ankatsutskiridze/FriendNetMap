import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import RequestsPage from "@/pages/requests";
import ProfilePage from "@/pages/profile";
import EditProfilePage from "@/pages/edit-profile";
import CreateProfilePage from "@/pages/create-profile";
import RequestIntroPage from "@/pages/request-intro";
import WelcomePage from "@/pages/welcome";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/bottom-nav";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  
  // Hide BottomNav on Welcome and Create Profile pages
  const showBottomNav = location !== "/welcome" && location !== "/create-profile";

  return (
    <div className="relative min-h-screen">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/create-profile" component={CreateProfilePage} />
        <Route path="/requests" component={RequestsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/profile/edit" component={EditProfilePage} />
        <Route path="/request-intro/:id" component={RequestIntroPage} />
        <Route component={NotFound} />
      </Switch>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
