import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingSuccessPage() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground p-6 flex flex-col items-center justify-center text-center overflow-hidden relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="mb-12 relative"
      >
        {/* Icon Container */}
        <div className="w-40 h-40 bg-white rounded-full shadow-2xl shadow-primary/20 flex items-center justify-center relative z-10">
             <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-100 rounded-full flex items-center justify-center">
                <Check className="w-16 h-16 text-primary" strokeWidth={3} />
             </div>
        </div>
        
        {/* Orbiting dots animation */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-4 h-4 bg-secondary rounded-full shadow-sm" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-3 h-3 bg-purple-400 rounded-full shadow-sm" />
            <div className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full shadow-sm" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-sm w-full space-y-8"
      >
        <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">You're All Set!</h1>
            <p className="text-lg text-muted-foreground">Start exploring your friends map and make new connections.</p>
        </div>

        <Button 
            className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all active:scale-[0.98] hover:scale-[1.02]" 
            size="lg"
            onClick={handleContinue}
        >
            Go to Friends Map
            <ChevronRight className="ml-2 w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
}
