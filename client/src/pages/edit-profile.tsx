import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Camera, Instagram, Facebook, MessageCircle, Save } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";

export default function EditProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Mock initial state
  const [formData, setFormData] = useState({
    name: "Sara Jenkins",
    location: "San Francisco, CA",
    bio: "Love exploring new coffee shops and hiking trails! Always looking for the next adventure.",
    instagram: "travel_enthusiast",
    whatsapp: "",
    facebook: "sarajenkins"
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
    setTimeout(() => setLocation("/profile"), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
        {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20 -ml-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
        <Button
            variant="ghost"
            className="text-primary font-bold hover:bg-primary/5 hover:text-primary"
            onClick={handleSave}
        >
            Save
        </Button>
      </header>

      <div className="max-w-md mx-auto p-6">
        {/* Photo Edit */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer">
                <Avatar className="h-32 w-32 border-[4px] border-white shadow-xl ring-1 ring-black/5">
                    <AvatarImage src={imgWoman} className="object-cover opacity-90 group-hover:opacity-80 transition-opacity" />
                    <AvatarFallback>ME</AvatarFallback>
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

        {/* Personal Info Fields */}
        <div className="space-y-5 mb-8">
            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
                <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl border-gray-200 bg-white h-12 shadow-sm focus-visible:ring-primary/20"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Location</label>
                <Input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="rounded-xl border-gray-200 bg-white h-12 shadow-sm focus-visible:ring-primary/20"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Bio</label>
                <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="rounded-xl border-gray-200 bg-white min-h-[100px] shadow-sm focus-visible:ring-primary/20 resize-none"
                />
            </div>
        </div>

        {/* Social Links */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4 px-1">Social Links</h3>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden divide-y divide-gray-100">
                
                <div className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <Instagram className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                         <label className="text-xs font-semibold text-muted-foreground block mb-1">Instagram</label>
                         <Input 
                            value={formData.instagram}
                            onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-sm font-medium"
                            placeholder="Add username"
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
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-sm font-medium"
                            placeholder="Add phone number"
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
                            value={formData.facebook}
                            onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 text-sm font-medium"
                            placeholder="Add profile link"
                         />
                    </div>
                </div>

            </div>
        </div>

        <Button 
            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity mb-4" 
            size="lg"
            onClick={handleSave}
        >
            Save Changes
        </Button>

      </div>
    </div>
  );
}
