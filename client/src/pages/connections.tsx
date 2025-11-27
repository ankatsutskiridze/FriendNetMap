import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, Filter, Clock, UserCheck, UserX, Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

// Reuse assets
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

// Mock data for connections (approved introductions)
const CONNECTIONS = [
  {
    id: 1,
    name: "Riley Davis",
    avatar: imgMan,
    introducedVia: "Jordan Lee",
    timestamp: "2d ago",
    status: "approved"
  },
  {
    id: 2,
    name: "Morgan Green",
    avatar: imgWoman,
    introducedVia: "Direct introduction",
    timestamp: "5d ago",
    status: "approved"
  },
  {
    id: 3,
    name: "Taylor Chen",
    avatar: imgPerson,
    introducedVia: "Casey West",
    timestamp: "1w ago",
    status: "approved"
  }
];

// Mock data for activity history
const ACTIVITY_HISTORY = [
  {
    id: 101,
    name: "Riley Davis",
    avatar: imgMan,
    status: "approved",
    type: "received",
    eventType: "approved_request",
    context: "via Jordan Lee",
    timestamp: "2d ago"
  },
  {
    id: 102,
    name: "Morgan Green",
    avatar: imgWoman,
    status: "pending",
    type: "sent",
    eventType: "pending_request",
    context: "via Casey West",
    timestamp: "3d ago"
  },
  {
    id: 103,
    name: "Quinn Baker",
    avatar: imgPerson,
    status: "declined",
    type: "received",
    eventType: "declined_request",
    context: "request declined",
    timestamp: "4d ago"
  },
  {
    id: 104,
    name: "Taylor Chen",
    avatar: imgPerson,
    status: "approved",
    type: "sent",
    eventType: "approved_request",
    context: "via Casey West",
    timestamp: "1w ago"
  },
  {
    id: 105,
    name: "Jordan Lee",
    avatar: imgMan,
    status: "pending",
    type: "received",
    eventType: "pending_request",
    context: "introduction pending",
    timestamp: "1w ago"
  }
];

export default function ConnectionsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"connections" | "history">("connections");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = CONNECTIONS.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = ACTIVITY_HISTORY.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 -ml-2 rounded-full hover:bg-secondary/20"
            onClick={() => setLocation("/")}
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Connections</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20">
            <Search className="w-5 h-5 text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20">
            <Filter className="w-5 h-5 text-foreground" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search connections…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/60 border-white rounded-xl placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-100 mb-6 relative">
          <button
            onClick={() => setActiveTab("connections")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-colors relative",
              activeTab === "connections" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Connections
            {activeTab === "connections" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-colors relative",
              activeTab === "history" ? "text-primary" : "text-muted-foreground"
            )}
          >
            History
            {activeTab === "history" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "connections" ? (
            <motion.div
              key="connections"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {filteredConnections.length > 0 ? (
                filteredConnections.map((conn) => (
                  <motion.button
                    key={conn.id}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between text-left hover:shadow-md hover:border-primary/20 transition-all active:scale-[0.98]"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={conn.avatar} />
                        <AvatarFallback>{conn.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h3 className="font-bold text-foreground">{conn.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Introduced via <span className="font-semibold">{conn.introducedVia}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{conn.timestamp}</p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <EmptyState message="No connections yet" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md hover:border-primary/20 transition-all"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm shrink-0 mt-0.5">
                          <AvatarImage src={item.avatar} />
                          <AvatarFallback>{item.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.eventType === "approved_request" && (
                              <>Your request to meet <span className="font-semibold text-primary">{item.name}</span> {item.context ? `${item.context}` : ""} was approved.</>
                            )}
                            {item.eventType === "pending_request" && (
                              <>You requested an intro to <span className="font-semibold text-primary">{item.name}</span> {item.context ? `${item.context}` : ""}.</>
                            )}
                            {item.eventType === "declined_request" && (
                              <>Your introduction request to <span className="font-semibold text-primary">{item.name}</span> was declined.</>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{item.timestamp}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ActivityBadge status={item.status} type={item.type} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState message="No activity yet" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityBadge({ status, type }: { status: string; type: string }) {
  const statusStyles = {
    approved: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
      icon: UserCheck
    },
    declined: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      icon: UserX
    },
    pending: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      icon: Clock
    }
  };

  const style = statusStyles[status as keyof typeof statusStyles];
  const Icon = style.icon;
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold", style.bg, style.text, style.border)}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
        <UserCheck className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground font-medium">{message}</p>
    </motion.div>
  );
}
