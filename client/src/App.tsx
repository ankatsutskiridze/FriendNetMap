import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import RequestsPage from "@/pages/requests";
import ProfilePage from "@/pages/profile";
import EditProfilePage from "@/pages/edit-profile";
import RequestIntroPage from "@/pages/request-intro";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/bottom-nav";

function Router() {
  return (
    <div className="relative min-h-screen">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/requests" component={RequestsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/profile/edit" component={EditProfilePage} />
        <Route path="/request-intro/:id" component={RequestIntroPage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
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
