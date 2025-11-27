import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, X, Clock, UserCheck, UserX, Phone, MessageCircle, Instagram, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Drawer } from "vaul";

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
  
  // Connect Drawer State
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<typeof SENT_REQUESTS[0] | null>(null);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{ type: "approve" | "decline"; requestId: number } | null>(null);
  const [requestStates, setRequestStates] = useState<Record<number, "approved" | "declined" | "pending">>({});
  const [showConfirmationOnly, setShowConfirmationOnly] = useState(true);
  const [removingRequests, setRemovingRequests] = useState<Set<number>>(new Set());

  // Auto-dismiss confirmations after 1.2 seconds
  useEffect(() => {
    if (confirmationModal?.type === "approve" && showConfirmationOnly) {
      const timer = setTimeout(() => {
        handleConfirmApproval();
      }, 1200);
      return () => clearTimeout(timer);
    } else if (confirmationModal?.type === "decline") {
      const timer = setTimeout(() => {
        handleConfirmDecline();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [confirmationModal, showConfirmationOnly]);

  const handleCardClick = (req: typeof SENT_REQUESTS[0] | typeof RECEIVED_REQUESTS[0], isReceived?: boolean) => {
    if (!isReceived && (req as typeof SENT_REQUESTS[0]).status === "approved") {
      setSelectedContact(req as typeof SENT_REQUESTS[0]);
      setIsConnectOpen(true);
    } else if (isReceived && getRequestState((req as typeof RECEIVED_REQUESTS[0]).id) === "approved") {
      setSelectedContact({ id: (req as typeof RECEIVED_REQUESTS[0]).id, name: (req as typeof RECEIVED_REQUESTS[0]).name, avatar: (req as typeof RECEIVED_REQUESTS[0]).avatar, status: "approved", timestamp: (req as typeof RECEIVED_REQUESTS[0]).timestamp } as any);
      setIsConnectOpen(true);
    }
  };

  const handleApprove = (requestId: number) => {
    setConfirmationModal({ type: "approve", requestId });
  };

  const handleDecline = (requestId: number) => {
    setConfirmationModal({ type: "decline", requestId });
  };

  const handleConfirmApproval = () => {
    if (confirmationModal?.type === "approve") {
      setRequestStates(prev => ({
        ...prev,
        [confirmationModal.requestId]: "approved"
      }));
      setConfirmationModal(null);
      setShowConfirmationOnly(true);
    }
  };

  const handleConfirmDecline = () => {
    if (confirmationModal?.type === "decline") {
      // Mark the request for removal
      setRemovingRequests(prev => new Set([...Array.from(prev), confirmationModal.requestId]));
      setConfirmationModal(null);
      
      // After animation completes, remove from state
      setTimeout(() => {
        setRequestStates(prev => ({
          ...prev,
          [confirmationModal.requestId]: "declined"
        }));
      }, 300);
    }
  };

  const getRequestState = (requestId: number) => {
    return requestStates[requestId] || "pending";
  };

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
                RECEIVED_REQUESTS.map((req) => {
                  const state = getRequestState(req.id);
                  const isRemoving = removingRequests.has(req.id);
                  
                  // Filter out fully declined cards
                  if (state === "declined" && !isRemoving) {
                    return null;
                  }
                  
                  return (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 15 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 overflow-hidden"
                      animate={isRemoving ? { opacity: 0, scale: 0.92, y: 15 } : { opacity: 1, scale: 1, y: 0 }}
                    >
                      {state === "pending" ? (
                        <>
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
                            <motion.div
                              className="flex-1"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => handleApprove(req.id)}
                                className="w-full bg-gradient-to-r from-primary to-purple-500 shadow-md shadow-primary/20 rounded-xl font-bold hover:opacity-90 transition-opacity"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </motion.div>
                            <motion.div
                              className="flex-1"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => handleDecline(req.id)}
                                variant="outline" 
                                className="w-full border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-muted-foreground"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </motion.div>
                          </div>
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "flex items-center justify-between p-2 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all rounded-xl",
                            state === "approved" && "cursor-pointer active:scale-[0.98]"
                          )}
                          onClick={() => handleCardClick(req, true)}
                        >
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
                          
                          <div className="flex items-center gap-2">
                            {state === "approved" && (
                              <span className="text-xs font-bold text-primary hidden sm:block">Tap to connect</span>
                            )}
                            <StatusBadge status={state} />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
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
                  <div 
                    key={req.id} 
                    className={cn(
                        "bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between transition-all",
                        req.status === "approved" && "cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.98]"
                    )}
                    onClick={() => handleCardClick(req)}
                  >
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
                    
                    <div className="flex items-center gap-2">
                        {req.status === "approved" && (
                            <span className="text-xs font-bold text-primary hidden sm:block">Tap to connect</span>
                        )}
                        <StatusBadge status={req.status} />
                    </div>
                  </div>
                ))
              ) : (
                 <EmptyState message="No sent requests" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connect Drawer */}
      <Drawer.Root open={isConnectOpen} onOpenChange={setIsConnectOpen} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-50" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none shadow-2xl">
            <div className="p-6 bg-white rounded-t-3xl flex-1 overflow-y-auto">
              {/* Drag Handle */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-1 rounded-full bg-gray-200" />
              </div>
              
              {selectedContact && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-md mx-auto pb-6"
                >
                  {/* Header */}
                  <div className="text-center mb-8 space-y-2">
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-bold text-foreground"
                    >
                      Connect with {selectedContact.name}
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

                  {/* Connection Options */}
                  <div className="space-y-3">
                    {/* WhatsApp */}
                    <motion.button
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
                    </motion.button>

                    {/* Instagram */}
                    <motion.button
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
                    </motion.button>

                    {/* Phone Call */}
                    <motion.button
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
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Confirmation Modal - Approve */}
      <AnimatePresence>
        {confirmationModal?.type === "approve" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
              onClick={() => setConfirmationModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-end justify-center z-[101] pointer-events-none"
            >
              <motion.div
                className="w-full max-w-md bg-white rounded-t-3xl p-8 shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated checkmark */}
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 12 }}
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.3)",
                        "0 0 0 20px rgba(34, 197, 94, 0)",
                      ],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                  >
                    <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-foreground mb-2">Introduction Approved</h3>
                  <p className="text-muted-foreground">We'll let both sides know you approved this introduction.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      setShowConfirmationOnly(false);
                      handleConfirmApproval();
                    }}
                    className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-green-500/25 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 transition-opacity text-white"
                  >
                    Continue
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal - Decline */}
      <AnimatePresence>
        {confirmationModal?.type === "decline" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
              onClick={() => setConfirmationModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-end justify-center z-[101] pointer-events-none"
            >
              <motion.div
                className="w-full max-w-md bg-white rounded-t-3xl p-8 shadow-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated X */}
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 12 }}
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.3)",
                        "0 0 0 20px rgba(239, 68, 68, 0)",
                      ],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                  >
                    <X className="w-10 h-10 text-red-600" strokeWidth={3} />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-foreground mb-2">Request Declined</h3>
                  <p className="text-muted-foreground">The requester will not be notified.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      setShowConfirmationOnly(false);
                      handleConfirmDecline();
                    }}
                    className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-red-500/25 bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90 transition-opacity text-white"
                  >
                    Okay
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold", style)}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </motion.div>
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
