import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddSocialsPage() {
  const [, setLocation] = useLocation();
  
  const [socials, setSocials] = useState({
    instagram: "",
    whatsapp: "",
    facebook: ""
  });

  const handleContinue = () => {
    // Simulate saving socials and go to success
    setLocation("/onboarding-success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground p-6 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Your Socials</h1>
          <p className="text-muted-foreground">Connect your accounts so friends can reach you.</p>
        </div>

        {/* Social Inputs */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <div className="p-5 flex items-center gap-4 hover:bg-white/40 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5">
                    <Instagram className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                     <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Instagram</label>
                     <Input 
                        value={socials.instagram}
                        onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                        className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-base font-medium"
                        placeholder="Username"
                     />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>

             <div className="p-5 flex items-center gap-4 hover:bg-white/40 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                     <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-wider">WhatsApp</label>
                     <Input 
                        value={socials.whatsapp}
                        onChange={(e) => setSocials({...socials, whatsapp: e.target.value})}
                        className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-base font-medium"
                        placeholder="Phone number"
                     />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>

             <div className="p-5 flex items-center gap-4 hover:bg-white/40 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5">
                    <Facebook className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                     <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Facebook</label>
                     <Input 
                        value={socials.facebook}
                        onChange={(e) => setSocials({...socials, facebook: e.target.value})}
                        className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-base font-medium"
                        placeholder="Profile link"
                     />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>

        </div>

        <div className="space-y-3">
            <Button 
                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all active:scale-[0.98]" 
                size="lg"
                onClick={handleContinue}
            >
                Continue
            </Button>
            
            <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground hover:bg-transparent font-medium"
                onClick={() => setLocation("/")}
            >
                Skip for now
            </Button>
        </div>

      </div>
    </div>
  );
}
