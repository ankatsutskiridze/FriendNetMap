import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ChevronLeft, UserPlus, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Reuse assets (simulating data fetch)
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

// Mock lookup (in a real app this would be an API call)
const MOCK_USERS: Record<string, { name: string; image: string; friend: string }> = {
  "default": { name: "Alex Smith", image: imgMan, friend: "Jordan Lee" },
};

export default function RequestIntroPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/request-intro/:id");
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // In a real app, we'd fetch the user by params.id
  const targetUser = MOCK_USERS["default"]; 

  const handleSend = () => {
    setIsLoading(true);
    toast({
      title: "Request Sent!",
      description: `Your request to meet ${targetUser.name} has been sent to ${targetUser.friend}.`,
      duration: 3000,
    });
    
    // Navigate back after a brief delay
    setTimeout(() => {
      setLocation("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20 -ml-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Request Introduction</h1>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto p-6 relative z-10"
      >
        
        {/* User Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-white shadow-lg mb-8 relative overflow-hidden"
        >
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-1 ring-black/5">
                  <AvatarImage src={targetUser.image} className="object-cover" />
                  <AvatarFallback>{targetUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
                  <div className="bg-secondary/20 p-1.5 rounded-full">
                    <UserPlus className="w-4 h-4 text-secondary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-foreground text-center">{targetUser.name}</h2>
            
            {/* Introduction explanation */}
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              You'll ask <span className="font-bold text-primary">{targetUser.friend}</span> to introduce you to <span className="font-bold text-foreground">{targetUser.name}</span>.
            </p>
          </div>
        </motion.div>

        {/* Message Section */}
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
          />
          <p className="text-xs text-muted-foreground mt-3 px-1">
            Keep it friendly and genuine. <span className="font-medium">{targetUser.friend}</span> will see this message too.
          </p>
        </motion.div>

        {/* Action Buttons */}
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
              disabled={!message.trim() || isLoading}
              onClick={handleSend}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </motion.div>

          <motion.button 
            whileHover={{ opacity: 0.8 }}
            onClick={() => window.history.back()}
            className="w-full text-muted-foreground hover:text-foreground transition-colors font-medium py-2.5 text-sm"
          >
            Cancel
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
