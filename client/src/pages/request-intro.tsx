import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ChevronLeft, UserPlus, MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/bottom-nav";

// Reuse assets (simulating data fetch)
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

// Mock lookup (in a real app this would be an API call)
const MOCK_USERS: Record<string, { name: string; image: string; friend: string }> = {
  "default": { name: "Alex Smith", image: imgMan, friend: "Jordan Lee" },
  // We can add logic to pick based on ID if we wanted, but for visual mock one is enough
};

export default function RequestIntroPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/request-intro/:id");
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  
  // In a real app, we'd fetch the user by params.id
  // Here we just use a mock target for the design
  const targetUser = MOCK_USERS["default"]; 

  const handleSend = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20 -ml-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Request Introduction</h1>
      </header>

      <div className="max-w-md mx-auto p-6 pt-8">
        
        {/* User Summary Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm mb-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative mb-3 mt-2">
             <Avatar className="h-20 w-20 border-[3px] border-white shadow-md ring-1 ring-black/5">
              <AvatarImage src={targetUser.image} className="object-cover" />
              <AvatarFallback>{targetUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                <div className="bg-secondary/20 p-1.5 rounded-full">
                    <UserPlus className="w-3 h-3 text-secondary-foreground" />
                </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1">{targetUser.name}</h2>
          <p className="text-sm text-muted-foreground">
            You will request an intro through <span className="font-bold text-primary">{targetUser.friend}</span>
          </p>
        </div>

        {/* Message Box */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3 px-1">
            <MessageSquare className="w-4 h-4 text-primary" />
            Add a short message
          </label>
          <div className="relative">
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! I'd love to meet you. We have mutual interests in photography and hiking..."
              className="min-h-[120px] rounded-2xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 resize-none p-4 text-base placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Send Button */}
        <Button 
          className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4" 
          size="lg"
          disabled={!message.trim()}
          onClick={handleSend}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Send Request
        </Button>

        <p className="text-xs text-center text-muted-foreground px-4">
            Your friend <span className="font-medium">{targetUser.friend}</span> will review and approve this introduction request before it's sent.
        </p>
      </div>
      
      {/* Using standard bottom nav for consistency, though typically flow might hide it. Keeping it for now. */}
    </div>
  );
}
