import { Link, useLocation } from "wouter";
import { Map, Inbox, Users, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Map",
      icon: Map,
    },
    {
      path: "/requests",
      label: "Requests",
      icon: Inbox,
    },
    {
      path: "/connections",
      label: "Connections",
      icon: Users,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: User,
    },
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-white/20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <a className="flex-1 flex flex-col items-center justify-center gap-1 h-full group">
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground group-hover:text-primary/70"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
                      isActive && "fill-current"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-wide transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
