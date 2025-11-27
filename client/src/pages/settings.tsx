import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Bell, Users, LogOut, Trash2, Mail, HelpCircle, Info, Shield, Lock, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettings, useUpdateSettings, useDeleteAccount, useCurrentUser } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { logout } = useAuth();

  const { data: currentUser } = useCurrentUser();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const deleteAccount = useDeleteAccount();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: value });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const handleLogOutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogOut = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    try {
      await deleteAccount.mutateAsync(currentUser.id);
      window.location.href = "/auth";
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete account",
        variant: "destructive"
      });
    }
    setShowDeleteConfirm(false);
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
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Settings</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-8">
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
              data-testid="button-edit-profile"
            >
              <span className="font-medium text-foreground">Edit Profile</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>

            <button 
              onClick={() => setLocation("/profile/edit")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors group"
              data-testid="button-social-links"
            >
              <span className="font-medium text-foreground">Manage Social Links</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </motion.div>

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
              <Switch 
                checked={settings?.introRequestsEnabled ?? true} 
                onCheckedChange={(value) => handleToggle("introRequestsEnabled", value)} 
                disabled={updateSettings.isPending}
                data-testid="switch-fof-requests"
              />
            </div>

            <div className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Push Notifications</span>
              </div>
              <Switch 
                checked={settings?.notificationsEnabled ?? true} 
                onCheckedChange={(value) => handleToggle("notificationsEnabled", value)}
                disabled={updateSettings.isPending}
                data-testid="switch-notifications"
              />
            </div>

            <div className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Email Updates</span>
              </div>
              <Switch 
                checked={settings?.emailUpdatesEnabled ?? false} 
                onCheckedChange={(value) => handleToggle("emailUpdatesEnabled", value)}
                disabled={updateSettings.isPending}
                data-testid="switch-email-updates"
              />
            </div>
          </div>
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 pt-4 border-t border-gray-200"
        >
          <button 
            onClick={handleLogOutClick}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 transition-colors font-bold py-3"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>

          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-center text-xs text-red-500 hover:text-red-600 transition-colors font-medium py-2"
            data-testid="button-delete-account"
          >
            Delete Account
          </button>
        </motion.div>
      </div>

      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
          >
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">Log out?</h2>
            <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
              You'll need to sign in again to access your map and connections.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-primary border-2 border-primary hover:bg-primary/5 transition-colors"
                data-testid="button-cancel-logout"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogOut}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                data-testid="button-confirm-logout"
              >
                Log out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">Delete Account?</h2>
            <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
              This action cannot be undone. All your data, connections, and history will be permanently deleted.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-primary border-2 border-primary hover:bg-primary/5 transition-colors"
                data-testid="button-cancel-delete"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                data-testid="button-confirm-delete"
              >
                {deleteAccount.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
