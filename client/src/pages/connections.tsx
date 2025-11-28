import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, Clock, UserCheck, UserX, UserPlus, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useFriends, useActivity, useUser, useCurrentUser } from "@/lib/api";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";
import emptyNetworkImg from "@assets/generated_images/empty_network_illustration.png";
import emptyHistoryImg from "@assets/generated_images/empty_history_illustration.png";

const GENERATED_IMAGES = [imgWoman, imgMan, imgPerson];

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

export default function ConnectionsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"connections" | "history">("connections");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: currentUser } = useCurrentUser();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: activity = [], isLoading: activityLoading } = useActivity();

  const isLoading = friendsLoading || activityLoading;

  const filteredConnections = friends.filter(friend =>
    friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivity = activity.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.status.toLowerCase().includes(query);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 -ml-2 rounded-full hover:bg-secondary/20"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Connections</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-secondary/20 text-primary"
            onClick={() => setLocation("/find-friends")}
            data-testid="button-find-friends"
          >
            <UserPlus className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/60 border-white rounded-xl placeholder:text-muted-foreground/50"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center border-b border-gray-100 mb-6 relative">
          <button
            onClick={() => setActiveTab("connections")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-colors relative",
              activeTab === "connections" ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="tab-connections"
          >
            Connections ({friends.length})
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
            data-testid="tab-history"
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
                filteredConnections.map((friend, index) => (
                  <motion.button
                    key={friend.id}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between text-left hover:shadow-md hover:border-primary/20 transition-all active:scale-[0.98]"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocation(`/profile/${friend.id}`)}
                    data-testid={`connection-${friend.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={friend.photoURL || GENERATED_IMAGES[index % 3]} />
                        <AvatarFallback>{friend.fullName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h3 className="font-bold text-foreground">{friend.fullName || friend.username}</h3>
                        {friend.location && (
                          <p className="text-xs text-muted-foreground">{friend.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {friend.friends?.length || 0} friends
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <EmptyState 
                  title="No connections yet" 
                  subtitle="Your friends will show up here once you connect." 
                  image={emptyNetworkImg} 
                />
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
              {filteredActivity.length > 0 ? (
                filteredActivity.map((item, index) => (
                  <ActivityItem 
                    key={item.id} 
                    item={item} 
                    index={index}
                    currentUserId={currentUser?.id || ""}
                  />
                ))
              ) : (
                <EmptyState 
                  title="No history yet" 
                  subtitle="As you send and receive introductions, you'll see them here." 
                  image={emptyHistoryImg} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityItem({ item, index, currentUserId }: { item: any; index: number; currentUserId: string }) {
  /**
   * Activity Item Subtitle Logic:
   * The subtitle text depends on two factors:
   * 1. connection.type - "friend" (direct request) or "introduction" (via connector)
   * 2. currentUser's perspective - who they are in relation to the request
   * 
   * For FRIEND connections (type === "friend"):
   *   - If currentUser sent the request: "You are now connected with {otherName}"
   *   - If currentUser received the request: "{otherName} is now connected with you"
   * 
   * For INTRODUCTION connections (type === "introduction"):
   *   - If currentUser is the requester: "You were introduced to {targetName} via {connectorName}"
   *   - If currentUser is the target: "{requesterName} was introduced to you via {connectorName}"
   *   - If currentUser is the connector: "You introduced {requesterName} to {targetName}"
   */
  const isFromMe = item.fromUserId === currentUserId;
  const isToMe = item.toUserId === currentUserId;
  const isViaMe = item.viaUserId === currentUserId;
  const isFriendRequest = item.type === "friend";
  
  const { data: fromUser } = useUser(item.fromUserId);
  const { data: toUser } = useUser(item.toUserId);
  // Only fetch via user for introductions (viaUserId is null for friend requests)
  const { data: viaUser } = useUser(item.viaUserId || "");
  
  const displayUser = isFromMe ? toUser : fromUser;
  const displayName = displayUser?.fullName || displayUser?.username || "Someone";
  const fromName = fromUser?.fullName || fromUser?.username || "Someone";
  const toName = toUser?.fullName || toUser?.username || "Someone";
  // viaName only used for introductions; default to "someone" if connector data not loaded
  const viaName = item.viaUserId ? (viaUser?.fullName || viaUser?.username || "someone") : "someone";
  
  let description = "";
  
  if (isFriendRequest) {
    // Direct friend connection - no "via" text
    if (item.status === "approved") {
      if (isFromMe) {
        description = `You are now connected with ${toName}`;
      } else if (isToMe) {
        description = `${fromName} is now connected with you`;
      }
    } else if (item.status === "pending") {
      if (isFromMe) {
        description = `You sent a friend request to ${toName}`;
      } else if (isToMe) {
        description = `${fromName} sent you a friend request`;
      }
    } else if (item.status === "declined") {
      if (isFromMe) {
        description = `Your friend request to ${toName} was declined`;
      } else if (isToMe) {
        description = `You declined ${fromName}'s friend request`;
      }
    }
  } else {
    // Introduction connection - include "via" text with connector name
    if (item.status === "approved") {
      if (isFromMe) {
        description = `You were introduced to ${toName} via ${viaName}`;
      } else if (isViaMe) {
        description = `You introduced ${fromName} to ${toName}`;
      } else if (isToMe) {
        description = `${fromName} was introduced to you via ${viaName}`;
      }
    } else if (item.status === "pending") {
      if (isFromMe) {
        description = `You requested an intro to ${toName} via ${viaName}`;
      } else if (isViaMe) {
        description = `${fromName} wants to meet ${toName} via you`;
      } else if (isToMe) {
        description = `${fromName} wants to be introduced to you via ${viaName}`;
      }
    } else if (item.status === "declined") {
      if (isFromMe) {
        description = `Your intro request to ${toName} was declined`;
      } else if (isViaMe) {
        description = `Introduction between ${fromName} and ${toName} was declined`;
      } else if (isToMe) {
        description = `You declined ${fromName}'s intro request`;
      }
    }
  }
  
  // Fallback for any unhandled cases
  if (!description) {
    description = isFriendRequest 
      ? `Connection with ${displayName}` 
      : `Introduction involving ${displayName}`;
  }
  
  return (
    <motion.div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md hover:border-primary/20 transition-all"
      whileHover={{ scale: 1.01 }}
      data-testid={`activity-${item.id}`}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="w-12 h-12 border-2 border-white shadow-sm shrink-0 mt-0.5">
            <AvatarImage src={displayUser?.photoURL || GENERATED_IMAGES[index % 3]} />
            <AvatarFallback>{displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm">{displayName}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(item.createdAt)}</p>
          </div>
        </div>

        <div className="shrink-0">
          <ActivityBadge status={item.status} />
        </div>
      </div>
    </motion.div>
  );
}

function ActivityBadge({ status }: { status: string }) {
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

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
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

function EmptyState({ title, subtitle, image }: { title: string; subtitle: string; image?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center px-4"
    >
      {image && <img src={image} alt={title} className="w-32 h-32 mb-6 opacity-90" />}
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
