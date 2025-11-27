import { useState } from "react";
import { useLocation } from "wouter";
import { Camera, ChevronRight } from "lucide-react";
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
    // Simulate saving profile
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground p-6 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Your Profile</h1>
          <p className="text-muted-foreground">Tell us a bit about yourself to get started.</p>
        </div>

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <Avatar className="h-32 w-32 border-[4px] border-white shadow-xl ring-1 ring-black/5">
              <AvatarImage src={imgPerson} className="object-cover opacity-90" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full group-hover:bg-black/20 transition-colors">
               <div className="bg-white/90 p-2.5 rounded-full shadow-sm backdrop-blur-sm">
                 <Camera className="w-6 h-6 text-primary" />
               </div>
            </div>
          </div>
          <span className="text-sm font-semibold text-primary mt-3">Upload Photo</span>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
                <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Alex Smith"
                    className="rounded-xl border-gray-200 bg-white h-12 shadow-sm focus-visible:ring-primary/20"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Location</label>
                <Input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. New York, NY"
                    className="rounded-xl border-gray-200 bg-white h-12 shadow-sm focus-visible:ring-primary/20"
                />
            </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Short Bio</label>
                <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="What are your interests? (e.g. Coffee, Hiking, Tech)"
                    className="rounded-xl border-gray-200 bg-white min-h-[100px] shadow-sm focus-visible:ring-primary/20 resize-none text-base"
                />
            </div>
        </div>

        <Button 
            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-all active:scale-[0.98]" 
            size="lg"
            onClick={handleContinue}
        >
            Continue
            <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
