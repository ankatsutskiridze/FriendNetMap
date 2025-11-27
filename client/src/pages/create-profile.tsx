import { useState } from "react";
import { useLocation } from "wouter";
import { Camera, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Reuse assets
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

export default function CreateProfilePage() {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: ""
  });

  const handleContinue = () => {
    // Simulate saving profile and move to next step
    setLocation("/add-socials");
  };

  const handleSkip = () => {
    // Skip to next step
    setLocation("/add-socials");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground p-6 flex flex-col items-center justify-center">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* White Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-lg p-8 space-y-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create your profile
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              This helps your friends introduce you to the right people.
            </p>
          </motion.div>

          {/* Avatar Upload */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 12 }}
            className="flex justify-center"
          >
            <button className="relative group cursor-pointer focus:outline-none">
              <Avatar className="h-36 w-36 border-4 border-white shadow-xl ring-1 ring-black/5">
                <AvatarImage src={imgPerson} className="object-cover" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-full">
                <div className="bg-white/95 p-3 rounded-full shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-primary" strokeWidth={2.5} />
                </div>
              </div>
            </button>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
          >
            {/* Full Name */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Full Name
              </label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Alex Smith"
                className="rounded-2xl border-gray-200 bg-white/50 h-12 text-base placeholder:text-muted-foreground/50 shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary"
              />
            </div>

            {/* Location */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Location
              </label>
              <Input 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. San Francisco, CA"
                className="rounded-2xl border-gray-200 bg-white/50 h-12 text-base placeholder:text-muted-foreground/50 shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary"
              />
            </div>

            {/* Short Bio */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Short Bio
              </label>
              <Textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="What are your interests? (e.g. Coffee, Hiking, Tech, Design)"
                className="rounded-2xl border-gray-200 bg-white/50 min-h-[100px] text-base placeholder:text-muted-foreground/50 shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary resize-none"
              />
            </div>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity text-white" 
              size="lg"
              onClick={handleContinue}
            >
              Continue
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Skip Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-foreground transition-colors font-medium py-2 text-sm"
            >
              Skip for now
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
