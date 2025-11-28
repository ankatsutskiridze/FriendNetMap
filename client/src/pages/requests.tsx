import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, X, Clock, UserCheck, UserX, Phone, MessageCircle, Instagram, ChevronRight, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Drawer } from "vaul";
import { useIntroRequestsReceived, useIntroRequestsSent, useUser, useApproveIntroRequest, useDeclineIntroRequest, useCurrentUser } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";
import emptyInboxImg from "@assets/generated_images/empty_inbox_illustration.png";

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

function UserDisplay({ userId, fallbackImage }: { userId: string; fallbackImage: string }) {
  const { data: user } = useUser(userId);
  return (
    <span className="font-semibold text-primary">
      {user?.fullName || user?.username || "Someone"}
    </span>
  );
}

function UserAvatar({ userId, index }: { userId: string; index: number }) {
  const { data: user } = useUser(userId);
  return (
    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
      <AvatarImage src={user?.photoURL || GENERATED_IMAGES[index % 3]} />
      <AvatarFallback>{user?.fullName?.[0] || "U"}</AvatarFallback>
    </Avatar>
  );
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: receivedRequests = [], isLoading: receivedLoading } = useIntroRequestsReceived();
  const { data: sentRequests = [], isLoading: sentLoading } = useIntroRequestsSent();
  const approveRequest = useApproveIntroRequest();
  const declineRequest = useDeclineIntroRequest();

  const isLoading = receivedLoading || sentLoading || !currentUser;

  // Determine the role/type for each received request
  const getReceivedRequestRole = (req: any) => {
    if (!currentUser) return null;
    
    // Friend requests: user is the target (toUser)
    if (req.type === "friend" && req.toUserId === currentUser.id && req.status === "pending") {
      return "friend_recipient"; // Direct friend request recipient
    }
    
    // Introduction requests - two-stage flow
    if (req.type === "introduction" || !req.type) {
      if (req.viaUserId === currentUser.id && req.connectorStatus === "pending") {
        return "connector"; // Stage 1: user is the connector
      }
      if (req.toUserId === currentUser.id && req.connectorStatus === "approved" && req.targetStatus === "pending") {
        return "target"; // Stage 2: user is the target
      }
    }
    
    return null;
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await approveRequest.mutateAsync(requestId);
    } catch (err) {
      console.error("Failed to approve:", err);
    }
    setProcessingId(null);
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await declineRequest.mutateAsync(requestId);
    } catch (err) {
      console.error("Failed to decline:", err);
    }
    setProcessingId(null);
  };

  const handleCardClick = (requestId: string, userId: string, status: string) => {
    if (status === "approved") {
      setSelectedContactId(userId);
      setIsConnectOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 -ml-2 rounded-full hover:bg-secondary/20"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Requests</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center border-b border-gray-100 mb-6 relative">
          <button
            onClick={() => setActiveTab("received")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-colors relative",
              activeTab === "received" ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="tab-received"
          >
            Received ({receivedRequests.length})
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
            data-testid="tab-sent"
          >
            Sent ({sentRequests.length})
            {activeTab === "sent" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "received" ? (
            <motion.div
              key="received"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {receivedRequests.length > 0 ? (
                receivedRequests.map((req, index) => {
                  const role = getReceivedRequestRole(req);
                  const isPending = role !== null; // Request is pending if user has a role
                  
                  return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 overflow-hidden"
                    data-testid={`request-received-${req.id}`}
                  >
                    {isPending ? (
                      <>
                        <div className="flex items-start gap-3 mb-3">
                          <UserAvatar userId={req.fromUserId} index={index} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <UserDisplay userId={req.fromUserId} fallbackImage={GENERATED_IMAGES[index % 3]} />
                              <span className="text-xs text-muted-foreground">{formatTimeAgo(req.createdAt)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {role === "friend_recipient" ? (
                                <>Wants to connect with you</>
                              ) : role === "connector" ? (
                                <>Wants to meet <UserDisplay userId={req.toUserId} fallbackImage="" /> via you</>
                              ) : req.viaUserId ? (
                                <>Wants to meet you via <UserDisplay userId={req.viaUserId} fallbackImage="" /></>
                              ) : (
                                <>Wants to connect with you</>
                              )}
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
                          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => handleApprove(req.id)}
                              disabled={processingId === req.id}
                              className="w-full bg-gradient-to-r from-primary to-purple-500 shadow-md shadow-primary/20 rounded-xl font-bold hover:opacity-90 transition-opacity"
                              data-testid={`button-approve-${req.id}`}
                            >
                              {processingId === req.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  {role === "connector" ? "Introduce" : "Accept"}
                                </>
                              )}
                            </Button>
                          </motion.div>
                          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={() => handleDecline(req.id)}
                              disabled={processingId === req.id}
                              variant="outline" 
                              className="w-full border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-muted-foreground"
                              data-testid={`button-decline-${req.id}`}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <ReceivedRequestCard 
                        req={req} 
                        index={index} 
                        onCardClick={handleCardClick}
                      />
                    )}
                  </motion.div>
                  );
                })
              ) : (
                <EmptyState title="No requests yet" subtitle="When friends ask for introductions, they'll appear here." image={emptyInboxImg} />
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
              {sentRequests.length > 0 ? (
                sentRequests.map((req, index) => (
                  <SentRequestCard 
                    key={req.id} 
                    req={req} 
                    index={index}
                    onCardClick={handleCardClick}
                  />
                ))
              ) : (
                <EmptyState title="No sent requests" subtitle="Send an introduction request from someone's profile." image={emptyInboxImg} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConnectDrawer 
        isOpen={isConnectOpen} 
        onOpenChange={setIsConnectOpen}
        userId={selectedContactId}
      />
    </div>
  );
}

function ReceivedRequestCard({ req, index, onCardClick }: { req: any; index: number; onCardClick: (id: string, userId: string, status: string) => void }) {
  const { data: fromUser } = useUser(req.fromUserId);
  
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "w-full flex items-center justify-between p-4 text-left bg-white rounded-2xl border border-gray-50 shadow-sm transition-all",
        req.status === "approved" && "cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.98]"
      )}
      onClick={() => onCardClick(req.id, req.fromUserId, req.status)}
      disabled={req.status !== "approved"}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
          <AvatarImage src={fromUser?.photoURL || GENERATED_IMAGES[index % 3]} />
          <AvatarFallback>{fromUser?.fullName?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <h3 className="font-bold text-foreground text-sm">{fromUser?.fullName || fromUser?.username}</h3>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(req.createdAt)}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {req.status === "approved" && (
          <span className="text-xs font-bold text-primary whitespace-nowrap">Tap to connect</span>
        )}
        <StatusBadge status={req.status} />
      </div>
    </motion.button>
  );
}

function SentRequestCard({ req, index, onCardClick }: { req: any; index: number; onCardClick: (id: string, userId: string, status: string) => void }) {
  const { data: toUser } = useUser(req.toUserId);
  
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between transition-all",
        req.status === "approved" && "cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.98]"
      )}
      onClick={() => onCardClick(req.id, req.toUserId, req.status)}
      data-testid={`request-sent-${req.id}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
          <AvatarImage src={toUser?.photoURL || GENERATED_IMAGES[index % 3]} />
          <AvatarFallback>{toUser?.fullName?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-foreground">{toUser?.fullName || toUser?.username}</h3>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(req.createdAt)}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {req.status === "approved" && (
          <span className="text-xs font-bold text-primary hidden sm:block">Tap to connect</span>
        )}
        <StatusBadge status={req.status} />
      </div>
    </div>
  );
}

function ConnectDrawer({ isOpen, onOpenChange, userId }: { isOpen: boolean; onOpenChange: (open: boolean) => void; userId: string | null }) {
  const { data: user } = useUser(userId || "");
  
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none shadow-2xl">
          <div className="p-6 bg-white rounded-t-3xl flex-1 overflow-y-auto">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1 rounded-full bg-gray-200" />
            </div>
            
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto pb-6"
              >
                <div className="text-center mb-8 space-y-2">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-bold text-foreground"
                  >
                    Connect with {user.fullName?.split(" ")[0] || user.username}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-base text-muted-foreground"
                  >
                    Choose how you want to reach out
                  </motion.p>
                </div>

                <div className="space-y-3">
                  {user.whatsappNumber && (
                    <motion.a
                      href={`https://wa.me/${user.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between p-5 bg-[#E7FCEB] border-2 border-[#25D366]/20 rounded-2xl hover:border-[#25D366]/40 hover:bg-[#E7FCEB]/80 transition-all group active:scale-95"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-md text-white">
                          <MessageCircle className="w-7 h-7" fill="currentColor" />
                        </div>
                        <span className="text-lg font-bold text-[#075E54]">WhatsApp</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#25D366] group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  )}

                  {user.instagramHandle && (
                    <motion.a
                      href={`https://instagram.com/${user.instagramHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between p-5 bg-[#FDF2F8] border-2 border-[#E1306C]/20 rounded-2xl hover:border-[#E1306C]/40 hover:bg-[#FDF2F8]/80 transition-all group active:scale-95"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shadow-md text-white">
                          <Instagram className="w-7 h-7" />
                        </div>
                        <span className="text-lg font-bold text-[#8134AF]">Instagram</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#E1306C] group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  )}

                  {user.phoneNumber && (
                    <motion.a
                      href={`tel:${user.phoneNumber}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between p-5 bg-[#EBF5FF] border-2 border-[#007AFF]/20 rounded-2xl hover:border-[#007AFF]/40 hover:bg-[#EBF5FF]/80 transition-all group active:scale-95"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#007AFF] flex items-center justify-center shadow-md text-white">
                          <Phone className="w-7 h-7" fill="currentColor" />
                        </div>
                        <span className="text-lg font-bold text-[#0040DD]">Phone Call</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#007AFF] group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  )}

                  {!user.whatsappNumber && !user.instagramHandle && !user.phoneNumber && (
                    <div className="text-center py-8 text-muted-foreground">
                      No contact information shared yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    approved: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", icon: UserCheck },
    declined: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", icon: UserX },
    pending: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: Clock }
  };

  const style = styles[status as keyof typeof styles] || styles.pending;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold", style.bg, style.text, style.border)}
    >
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
