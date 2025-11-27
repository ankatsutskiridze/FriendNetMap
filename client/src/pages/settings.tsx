import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Bell, Users, LogOut, Trash2, Mail, HelpCircle, Info, Shield, Lock, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);
  const [fofRequestsEnabled, setFofRequestsEnabled] = useState(true);

  const handleLogOut = () => {
    setLocation("/welcome");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      setLocation("/welcome");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-8">
        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Account</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <button 
              onClick={() => setLocation("/profile/edit")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group"
            >
              <span className="font-medium text-foreground">Edit Profile</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <button 
              onClick={() => setLocation("/profile/edit")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group"
            >
              <span className="font-medium text-foreground">Manage Social Links</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <span className="font-medium text-foreground">Change Email</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Preferences</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <div className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="font-medium text-foreground block text-sm">Friend-of-Friend Requests</span>
                  <span className="text-xs text-muted-foreground">Allow intros from extended network</span>
                </div>
              </div>
              <Switch checked={fofRequestsEnabled} onCheckedChange={setFofRequestsEnabled} />
            </div>

            <div className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Push Notifications</span>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>

            <div className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Email Updates</span>
              </div>
              <Switch checked={emailUpdatesEnabled} onCheckedChange={setEmailUpdatesEnabled} />
            </div>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Support</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Help & FAQ</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Contact Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">About</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">About this App</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <div className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors">
              <span className="font-medium text-foreground">App Version</span>
              <span className="text-sm text-muted-foreground font-medium">1.0.0</span>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Security</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Block List</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Privacy Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Legal Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Legal</h2>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden divide-y divide-gray-100">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <span className="font-medium text-foreground">Privacy Policy</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group">
              <span className="font-medium text-foreground">Terms of Service</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Logout Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 pt-4 border-t border-gray-200"
        >
          <button 
            onClick={handleLogOut}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold py-3"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>

          <button 
            onClick={handleDeleteAccount}
            className="w-full text-center text-xs text-red-500 hover:text-red-600 transition-colors font-medium py-2"
          >
            Delete Account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
