import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Upload, Instagram, Phone, Facebook, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AddFriendPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    relationship: "",
    instagram: "",
    whatsapp: "",
    facebook: ""
  });

  const handleSave = () => {
    if (!formData.fullName) {
      toast({
        title: "Missing information",
        description: "Please enter a full name for your friend.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would save this to the backend
    // For now, we just simulate a success and redirect
    toast({
      title: "Friend added!",
      description: "Friend added and connected to your map.",
      duration: 3000,
      className: "bg-green-50 border-green-200 text-green-800"
    });

    // Delay redirect slightly for effect
    setTimeout(() => {
      setLocation("/");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary/20 -ml-2"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Add Friend</h1>
      </header>

      <div className="max-w-md mx-auto p-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white p-6 space-y-6"
        >
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="relative group cursor-pointer">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gray-100 text-gray-400">
                  <Upload className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Upload className="w-3 h-3" />
              </div>
            </div>
            <span className="text-xs text-primary font-bold mt-2">Add photo</span>
          </div>

          {/* Main Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="e.g. Alex Smith" 
                className="bg-white/60 border-gray-200 h-12 rounded-xl"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">
                Location
              </label>
              <Input 
                placeholder="e.g. San Francisco, CA" 
                className="bg-white/60 border-gray-200 h-12 rounded-xl"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">
                Relationship
              </label>
              <Select 
                value={formData.relationship} 
                onValueChange={(val) => setFormData({...formData, relationship: val})}
              >
                <SelectTrigger className="bg-white/60 border-gray-200 h-12 rounded-xl w-full">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="coworker">Coworker</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="acquaintance">Acquaintance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1 block">
              Social Links
            </label>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0 text-pink-600">
                <Instagram className="w-5 h-5" />
              </div>
              <Input 
                placeholder="@instagram_handle" 
                className="bg-white/60 border-gray-200 h-10 rounded-xl flex-1 text-sm"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-600">
                <Phone className="w-5 h-5" />
              </div>
              <Input 
                placeholder="Phone number" 
                className="bg-white/60 border-gray-200 h-10 rounded-xl flex-1 text-sm"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                <Facebook className="w-5 h-5" />
              </div>
              <Input 
                placeholder="Profile link" 
                className="bg-white/60 border-gray-200 h-10 rounded-xl flex-1 text-sm"
                value={formData.facebook}
                onChange={(e) => setFormData({...formData, facebook: e.target.value})}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-95 transition-all"
              onClick={handleSave}
            >
              <Save className="w-5 h-5 mr-2" />
              Save and add to map
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
