import { useState, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { ChevronLeft, UserPlus, MessageSquare, Loader2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFriendsOfFriends, useCurrentUser, useCreateIntroRequest, useFriends } from "@/lib/api";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

const GENERATED_IMAGES = [imgWoman, imgMan, imgPerson];

export default function RequestIntroPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/request-intro/:id");
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selectedViaUserId, setSelectedViaUserId] = useState<string | null>(null);
  const [showViaDropdown, setShowViaDropdown] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: targetUser, isLoading: targetLoading } = useUser(params?.id || "");
  const { data: friendsOfFriends = [] } = useFriendsOfFriends();
  const { data: friends = [] } = useFriends();
  const createIntroRequest = useCreateIntroRequest();

  const targetFof = friendsOfFriends.find(f => f.id === params?.id);
  const mutualFriends = targetFof?.mutualFriends || [];

  const selectedViaUser = useMemo(() => {
    if (selectedViaUserId) {
      return friends.find(f => f.id === selectedViaUserId) || mutualFriends.find(m => m.id === selectedViaUserId);
    }
    if (mutualFriends.length > 0) {
      return mutualFriends[0];
    }
    return null;
  }, [selectedViaUserId, mutualFriends, friends]);

  const handleSend = async () => {
    if (!currentUser || !targetUser) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive"
      });
      return;
    }

    const viaUser = selectedViaUserId 
      ? (friends.find(f => f.id === selectedViaUserId) || mutualFriends.find(m => m.id === selectedViaUserId))
      : (mutualFriends.length > 0 ? mutualFriends[0] : null);

    if (!viaUser) {
      toast({
        title: "Error",
        description: "Please select a mutual friend to introduce you",
        variant: "destructive"
      });
      return;
    }

    try {
      await createIntroRequest.mutateAsync({
        fromUserId: currentUser.id,
        toUserId: targetUser.id,
        viaUserId: viaUser.id,
        message: message.trim() || undefined
      });
      
      toast({
        title: "Request Sent!",
        description: `Your request to meet ${targetUser.fullName || targetUser.username} has been sent.`,
        duration: 3000,
      });
      
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send request",
        variant: "destructive"
      });
    }
  };

  if (targetLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => setLocation("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20 -ml-2"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-lg font-bold text-foreground" data-testid="text-page-title">Request Introduction</h1>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto p-6 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-white shadow-lg mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-1 ring-black/5">
                  <AvatarImage src={targetUser.photoURL || GENERATED_IMAGES[0]} className="object-cover" />
                  <AvatarFallback>{targetUser.fullName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
                  <div className="bg-secondary/20 p-1.5 rounded-full">
                    <UserPlus className="w-4 h-4 text-secondary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground text-center" data-testid="text-target-name">
              {targetUser.fullName || targetUser.username}
            </h2>
            
            {selectedViaUser && (
              <div className="relative">
                <button
                  onClick={() => setShowViaDropdown(!showViaDropdown)}
                  className="w-full text-sm text-muted-foreground text-center leading-relaxed flex items-center justify-center gap-1 hover:text-foreground transition-colors"
                  data-testid="button-select-via"
                >
                  You'll ask <span className="font-bold text-primary">{selectedViaUser.fullName}</span> to introduce you
                  {mutualFriends.length > 1 && <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showViaDropdown && mutualFriends.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 min-w-[200px]"
                  >
                    {mutualFriends.map((mutual, index) => (
                      <button
                        key={mutual.id}
                        onClick={() => {
                          setSelectedViaUserId(mutual.id);
                          setShowViaDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={mutual.photoURL || GENERATED_IMAGES[index % 3]} />
                          <AvatarFallback>{mutual.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{mutual.fullName}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <label className="flex items-center gap-2 text-xs font-bold text-foreground mb-3 px-1 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-primary" strokeWidth={2.5} />
            Add a short message
          </label>
          <Textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey! I'd love to meet you. We have a lot in common and I think we could connect."
            className="min-h-[120px] rounded-2xl border-gray-200 bg-white/50 shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none p-4 text-base placeholder:text-muted-foreground/50"
            data-testid="input-message"
          />
          {selectedViaUser && (
            <p className="text-xs text-muted-foreground mt-3 px-1">
              Keep it friendly and genuine. <span className="font-medium">{selectedViaUser.fullName}</span> will see this message too.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-white" 
              size="lg"
              disabled={!message.trim() || !selectedViaUser || createIntroRequest.isPending}
              onClick={handleSend}
              data-testid="button-send"
            >
              {createIntroRequest.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              {createIntroRequest.isPending ? "Sending..." : "Send Request"}
            </Button>
          </motion.div>

          <motion.button 
            whileHover={{ opacity: 0.8 }}
            onClick={() => window.history.back()}
            className="w-full text-muted-foreground hover:text-foreground transition-colors font-medium py-2.5 text-sm"
            data-testid="button-cancel"
          >
            Cancel
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
