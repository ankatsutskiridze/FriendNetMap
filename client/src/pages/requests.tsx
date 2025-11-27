import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, X, Clock, UserCheck, UserX } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

// Reuse assets
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

// Mock Data
const RECEIVED_REQUESTS = [
  {
    id: 1,
    name: "Jordan Lee",
    avatar: imgMan,
    target: "Alex Smith",
    message: "Hey! I noticed we both love hiking. Would love an intro to Alex.",
    timestamp: "2h ago"
  },
  {
    id: 2,
    name: "Casey West",
    avatar: imgPerson,
    target: "Sam Taylor",
    message: "Working on a similar startup idea, hoping to connect.",
    timestamp: "5h ago"
  }
];

const SENT_REQUESTS = [
  {
    id: 3,
    name: "Morgan Green",
    avatar: imgWoman,
    status: "pending", // pending, approved, declined
    timestamp: "1d ago"
  },
  {
    id: 4,
    name: "Riley Davis",
    avatar: imgMan,
    status: "approved",
    timestamp: "2d ago"
  },
  {
    id: 5,
    name: "Quinn Baker",
    avatar: imgPerson,
    status: "declined",
    timestamp: "3d ago"
  }
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 -ml-2 rounded-full hover:bg-secondary/20"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Requests</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-100 mb-6 relative">
          <button
            onClick={() => setActiveTab("received")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-colors relative",
              activeTab === "received" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Received
            {activeTab === "received" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-colors relative",
              activeTab === "sent" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Sent
            {activeTab === "sent" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "received" ? (
            <motion.div
              key="received"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {RECEIVED_REQUESTS.length > 0 ? (
                RECEIVED_REQUESTS.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={req.avatar} />
                        <AvatarFallback>{req.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-foreground">{req.name}</h3>
                          <span className="text-xs text-muted-foreground">{req.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Wants to meet <span className="font-semibold text-primary">{req.target}</span> via you
                        </p>
                      </div>
                    </div>
                    
                    {req.message && (
                      <div className="bg-secondary/10 rounded-xl p-3 text-sm text-foreground/80 mb-4 relative">
                         <div className="absolute -top-1 left-6 w-2 h-2 bg-secondary/10 rotate-45" />
                         "{req.message}"
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-primary to-purple-500 shadow-md shadow-primary/20 rounded-xl font-bold hover:opacity-90 transition-opacity">
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-muted-foreground">
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No received requests yet" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {SENT_REQUESTS.length > 0 ? (
                SENT_REQUESTS.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={req.avatar} />
                        <AvatarFallback>{req.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-foreground">{req.name}</h3>
                        <p className="text-xs text-muted-foreground">{req.timestamp}</p>
                      </div>
                    </div>
                    
                    <StatusBadge status={req.status} />
                  </div>
                ))
              ) : (
                 <EmptyState message="No sent requests" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-blue-50 text-blue-600 border-blue-100",
    approved: "bg-green-50 text-green-600 border-green-100",
    declined: "bg-red-50 text-red-600 border-red-100",
  };
  
  const icons = {
    pending: Clock,
    approved: UserCheck,
    declined: UserX
  };

  const Icon = icons[status as keyof typeof icons];
  const style = styles[status as keyof typeof styles];
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={cn("px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold", style)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
        <UserCheck className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
}
