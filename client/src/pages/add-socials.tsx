import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Instagram, Facebook, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddSocialsPage() {
  const [, setLocation] = useLocation();
  
  const [socials, setSocials] = useState({
    instagram: "",
    whatsapp: "",
    facebook: ""
  });

  const handleFinish = () => {
    // Simulate saving socials and go to success screen
    setLocation("/onboarding-success");
  };

  const handleSkip = () => {
    // Skip to success screen
    setLocation("/onboarding-success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Add your socials
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Make it easy for people to reach you after an introduction.
          </p>
        </motion.div>

        {/* Social Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-lg overflow-hidden divide-y divide-gray-100 mb-8"
        >
          {/* Instagram Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-5 flex items-center gap-4 hover:bg-white/50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shrink-0 shadow-md">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground block mb-2 uppercase tracking-wider">Instagram</label>
              <Input 
                value={socials.instagram}
                onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-sm font-medium focus-visible:outline-none"
                placeholder="@username"
              />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>

          {/* WhatsApp Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-5 flex items-center gap-4 hover:bg-white/50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground block mb-2 uppercase tracking-wider">WhatsApp</label>
              <Input 
                value={socials.whatsapp}
                onChange={(e) => setSocials({...socials, whatsapp: e.target.value})}
                className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-sm font-medium focus-visible:outline-none"
                placeholder="Add phone number"
              />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>

          {/* Facebook Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-5 flex items-center gap-4 hover:bg-white/50 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-foreground block mb-2 uppercase tracking-wider">Facebook</label>
              <Input 
                value={socials.facebook}
                onChange={(e) => setSocials({...socials, facebook: e.target.value})}
                className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-sm font-medium focus-visible:outline-none"
                placeholder="Connect account"
              />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity text-white"
              size="lg"
              onClick={handleFinish}
            >
              Finish setup
            </Button>
          </motion.div>

          <motion.button 
            whileHover={{ opacity: 0.8 }}
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground transition-colors font-medium py-2.5 text-sm"
          >
            Skip for now
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
