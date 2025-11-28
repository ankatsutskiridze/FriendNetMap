import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Instagram, 
  MessageCircle, 
  Facebook,
  ChevronRight, 
  Plus, 
  Settings, 
  LogOut, 
  Shield, 
  FileText,
  Edit2,
  Loader2
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useCurrentUser, useUser, useFriends } from "@/lib/api";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/profile/:userId");
  
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { data: viewedUser, isLoading: viewedUserLoading } = useUser(params?.userId || "");
  const { data: friends = [] } = useFriends();

  const isOwnProfile = !params?.userId;
  const user = isOwnProfile ? currentUser : viewedUser;
  const isLoading = isOwnProfile ? currentUserLoading : viewedUserLoading;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Profile</h1>
        {isOwnProfile ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-secondary/20"
            onClick={() => setLocation("/settings")}
            data-testid="button-settings"
          >
            <Settings className="w-6 h-6 text-foreground" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto p-6 pt-8"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <Avatar className="h-32 w-32 border-[4px] border-white shadow-xl ring-1 ring-black/5">
              <AvatarImage src={user.photoURL || imgWoman} className="object-cover" />
              <AvatarFallback>{user.fullName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button 
                className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors border-[3px] border-white"
                onClick={() => setLocation("/profile/edit")}
                data-testid="button-edit-photo"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1" data-testid="text-user-name">
            {user.fullName || user.username}
          </h2>
          <p className="text-sm text-muted-foreground font-medium mb-1" data-testid="text-username">
            @{user.username}
          </p>
          {user.location && (
            <p className="text-sm text-muted-foreground font-medium mb-6" data-testid="text-location">
              {user.location}
            </p>
          )}
          
          {isOwnProfile && (
            <Button 
              variant="outline" 
              className="rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-bold px-8 shadow-sm"
              onClick={() => setLocation("/profile/edit")}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-10">
          <div className="flex flex-col items-center justify-center p-5 bg-secondary/10 rounded-2xl border border-secondary/20 shadow-sm">
            <span className="text-3xl font-bold text-secondary-foreground tabular-nums" data-testid="text-connections-count">
              {user.friends?.length || 0}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Connections</span>
          </div>
          <div className="flex flex-col items-center justify-center p-5 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
            <span className="text-3xl font-bold text-primary tabular-nums" data-testid="text-friends-count">
              {isOwnProfile ? friends.length : (user.friends?.length || 0)}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Friends</span>
          </div>
        </div>

        {user.about && (
          <div className="mb-10">
            <h3 className="text-lg font-bold text-foreground mb-3 px-1">About</h3>
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/50 shadow-sm">
              <p className="text-muted-foreground leading-relaxed" data-testid="text-about">
                {user.about}
              </p>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h3 className="text-lg font-bold text-foreground mb-3 px-1">Contact & Social</h3>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden divide-y divide-gray-100">
            <SocialRow 
              icon={<Instagram className="w-5 h-5 text-pink-600" />}
              label="Instagram"
              value={user.instagramHandle}
              isOwn={isOwnProfile}
            />
            <SocialRow 
              icon={<MessageCircle className="w-5 h-5 text-green-500" />}
              label="WhatsApp"
              value={user.whatsappNumber}
              isOwn={isOwnProfile}
            />
            <SocialRow 
              icon={<Facebook className="w-5 h-5 text-blue-600" />}
              label="Facebook"
              value={user.facebookHandle}
              isOwn={isOwnProfile}
            />
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex flex-col gap-4 px-2">
            <button className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <Shield className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span className="font-medium">Privacy Policy</span>
            </button>
            <button className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <FileText className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span className="font-medium">Terms of Service</span>
            </button>
            <button 
              className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors mt-2"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold">Log Out</span>
            </button>
          </div>
        )}

        <div className="h-8" />
      </motion.div>
    </div>
  );
}

function SocialRow({ icon, label, value, isOwn }: { icon: React.ReactNode, label: string, value: string | null | undefined, isOwn: boolean }) {
  return (
    <div className="w-full flex items-center justify-between p-4 text-left">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {value ? (
          <span className="text-sm text-muted-foreground font-medium" data-testid={`text-${label.toLowerCase()}`}>{value}</span>
        ) : isOwn ? (
          <div className="flex items-center text-primary text-sm font-bold bg-primary/5 px-3 py-1 rounded-full">
            <Plus className="w-3 h-3 mr-1" />
            Add
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not shared</span>
        )}
        {isOwn && <ChevronRight className="w-4 h-4 text-gray-300" />}
      </div>
    </div>
  );
}
