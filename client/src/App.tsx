import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Home from "@/pages/home";
import RequestsPage from "@/pages/requests";
import ConnectionsPage from "@/pages/connections";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import EditProfilePage from "@/pages/edit-profile";
import RequestIntroPage from "@/pages/request-intro";
import FindFriendsPage from "@/pages/find-friends";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/bottom-nav";
import { useLocation } from "wouter";

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">
            Friends Map
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Hide BottomNav on certain pages
  const showBottomNav = !["/profile/edit", "/request-intro"].some((path) =>
    location.startsWith(path)
  ) && !location.match(/^\/profile\/[^/]+$/);

  return (
    <div className="relative min-h-screen">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/requests" component={RequestsPage} />
        <Route path="/connections" component={ConnectionsPage} />
        <Route path="/profile/edit" component={EditProfilePage} />
        <Route path="/profile/:userId" component={ProfilePage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/request-intro/:id" component={RequestIntroPage} />
        <Route path="/find-friends" component={FindFriendsPage} />
        <Route component={NotFound} />
      </Switch>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
