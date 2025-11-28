import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Camera, Instagram, MessageCircle, Facebook, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, useUpdateProfile } from "@/lib/api";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    about: "",
    instagramHandle: "",
    whatsappNumber: "",
    facebookHandle: ""
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || "",
        location: currentUser.location || "",
        about: currentUser.about || "",
        instagramHandle: currentUser.instagramHandle || "",
        whatsappNumber: currentUser.whatsappNumber || "",
        facebookHandle: currentUser.facebookHandle || ""
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      await updateProfile.mutateAsync({
        userId: currentUser.id,
        data: formData
      });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      setTimeout(() => setLocation("/profile"), 500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20 -ml-2"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Edit Profile</h1>
        <Button
          variant="ghost"
          className="text-primary font-bold hover:bg-primary/5 hover:text-primary"
          onClick={handleSave}
          disabled={updateProfile.isPending}
          data-testid="button-save"
        >
          {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </header>

      <div className="max-w-md mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <Avatar className="h-32 w-32 border-[4px] border-white shadow-xl ring-1 ring-black/5">
              <AvatarImage src={currentUser?.photoURL || imgWoman} className="object-cover opacity-90 group-hover:opacity-80 transition-opacity" />
              <AvatarFallback>{currentUser?.fullName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md">
              <Camera className="w-4 h-4 text-primary" />
            </div>
          </div>
          <span className="text-sm font-medium text-primary mt-3">Change Photo</span>
        </div>

        <div className="space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
            <Input 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="rounded-xl border-gray-200 bg-white h-12 shadow-sm focus-visible:ring-primary/20"
              data-testid="input-fullname"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Location</label>
            <Input 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="rounded-xl border-gray-200 bg-white h-12 shadow-sm focus-visible:ring-primary/20"
              placeholder="City, Country"
              data-testid="input-location"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Bio</label>
            <Textarea 
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="rounded-xl border-gray-200 bg-white min-h-[100px] shadow-sm focus-visible:ring-primary/20 resize-none"
              placeholder="Tell us about yourself..."
              data-testid="input-about"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 px-1">Contact & Social</h3>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Instagram</label>
                <Input 
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({...formData, instagramHandle: e.target.value})}
                  className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-sm font-medium"
                  placeholder="@username"
                  data-testid="input-instagram"
                />
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">WhatsApp</label>
                <Input 
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-sm font-medium"
                  placeholder="+1 234 567 8900"
                  data-testid="input-whatsapp"
                />
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Facebook</label>
                <Input 
                  value={formData.facebookHandle}
                  onChange={(e) => setFormData({...formData, facebookHandle: e.target.value})}
                  className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-sm font-medium"
                  placeholder="facebook.com/username"
                  data-testid="input-facebook"
                />
              </div>
            </div>

          </div>
        </div>

        <Button 
          className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity mb-4" 
          size="lg"
          onClick={handleSave}
          disabled={updateProfile.isPending}
          data-testid="button-save-changes"
        >
          {updateProfile.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
