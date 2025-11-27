import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  ChevronRight, 
  Plus, 
  Settings, 
  LogOut, 
  Shield, 
  FileText,
  Edit2
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

// Reuse assets
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";

export default function ProfilePage() {
  const [, setLocation] = useLocation();

  // Mock User Data
  const user = {
    name: "You", // Or actual name
    location: "San Francisco, CA",
    image: imgWoman,
    bio: "Love exploring new coffee shops and hiking trails! Always looking for the next adventure.",
    stats: {
      mutuals: 24,
      friends: 156
    },
    socials: {
      instagram: "@travel_enthusiast",
      whatsapp: null, // Not connected
      facebook: "Connected" 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20"
        >
          <Settings className="w-6 h-6 text-foreground" />
        </Button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto p-6 pt-8"
      >
        {/* Top Section: Avatar & Info */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <Avatar className="h-32 w-32 border-[4px] border-white shadow-xl ring-1 ring-black/5">
              <AvatarImage src={user.image} className="object-cover" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors border-[3px] border-white">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Sara Jenkins</h2>
          <p className="text-sm text-muted-foreground font-medium mb-6">{user.location}</p>
          
          <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-bold px-8 shadow-sm">
            Edit Profile
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="flex flex-col items-center justify-center p-5 bg-secondary/10 rounded-2xl border border-secondary/20 shadow-sm">
                <span className="text-3xl font-bold text-secondary-foreground tabular-nums">{user.stats.mutuals}</span>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Mutuals</span>
            </div>
            <div className="flex flex-col items-center justify-center p-5 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
                <span className="text-3xl font-bold text-primary tabular-nums">{user.stats.friends}</span>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Friends</span>
            </div>
        </div>

        {/* About Section */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-foreground mb-3 px-1">About</h3>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/50 shadow-sm">
            <p className="text-muted-foreground leading-relaxed">
              {user.bio}
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-foreground mb-3 px-1">Contact & Social</h3>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden divide-y divide-gray-100">
            
            {/* Instagram */}
            <SocialRow 
              icon={<Instagram className="w-5 h-5 text-pink-600" />}
              label="Instagram"
              value={user.socials.instagram}
            />

            {/* WhatsApp */}
            <SocialRow 
              icon={<MessageCircle className="w-5 h-5 text-green-500" />}
              label="WhatsApp"
              value={user.socials.whatsapp}
            />

            {/* Facebook */}
            <SocialRow 
              icon={<Facebook className="w-5 h-5 text-blue-600" />}
              label="Facebook"
              value={user.socials.facebook}
            />
          </div>
        </div>

        {/* Settings / Misc Links */}
        <div className="flex flex-col gap-4 px-2">
          <button className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
            <Shield className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="font-medium">Privacy Policy</span>
          </button>
          <button className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
            <FileText className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="font-medium">Terms of Service</span>
          </button>
          <button className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors mt-2">
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Log Out</span>
          </button>
        </div>

        <div className="h-8" /> {/* Bottom spacer */}
      </motion.div>
    </div>
  );
}

function SocialRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50/80 transition-colors text-left">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {value ? (
          <span className="text-sm text-muted-foreground font-medium">{value}</span>
        ) : (
          <div className="flex items-center text-primary text-sm font-bold bg-primary/5 px-3 py-1 rounded-full">
            <Plus className="w-3 h-3 mr-1" />
            Add
          </div>
        )}
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </button>
  );
}
