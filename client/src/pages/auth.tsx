import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider, facebookProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Facebook, Check, X, Loader2 } from "lucide-react";

interface AuthPageProps {
  mode?: "login" | "username-setup";
}

export default function AuthPage({ mode = "login" }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const { loginWithFirebase, updateUser, user } = useAuth();
  const { toast } = useToast();

  // Username setup state
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const handleSocialLogin = async (provider: any) => {
    console.log("Starting social login...");
    setLoading(true);
    try {
      console.log("Opening popup...");
      const result = await signInWithPopup(auth, provider);
      console.log("Popup success, getting token...");
      const token = await result.user.getIdToken();
      console.log("Token received, logging in with backend...");
      await loginWithFirebase(token);
      console.log("Backend login success");
      // If successful, App.tsx will re-render.
      // If isOnboardingCompleted is false, it will render AuthPage with mode="username-setup"
    } catch (error: any) {
      console.error("Social login error:", error);
      toast({
        description: error.message || "Social login failed",
        variant: "destructive",
      });
    } finally {
      console.log("Social login finished (finally block)");
      setLoading(false);
    }
  };

  // Debounce username check
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setIsAvailable(null);
        return;
      }
      setIsChecking(true);
      try {
        const res = await fetch(`/api/auth/check-username?username=${username}`);
        const data = await res.json();
        setIsAvailable(data.available);
      } catch (error) {
        console.error("Check username error", error);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (username) checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    setLoading(true);

    try {
      // Update user with new username and set isOnboardingCompleted = true
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, isOnboardingCompleted: true }),
      });

      if (!res.ok) throw new Error("Failed to update username");
      
      const updatedUser = await res.json();
      updateUser(updatedUser);
      // App.tsx will re-render and show Home
    } catch (error: any) {
      toast({
        description: error.message || "Failed to set username",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === "username-setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Choose your username
            </h1>
            <p className="text-muted-foreground">
              Pick a unique username to complete your setup.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-bold text-foreground mb-2">
                  Username
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="@yourname"
                    value={username}
                    onChange={(e) => {
                      // Remove @ if typed, enforce lowercase/alphanumeric if needed
                      const val = e.target.value.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
                      setUsername(val);
                    }}
                    required
                    className={`rounded-xl pr-10 ${
                      isAvailable === true ? "border-green-500 focus-visible:ring-green-500" : 
                      isAvailable === false ? "border-red-500 focus-visible:ring-red-500" : ""
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isAvailable === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : isAvailable === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {isAvailable === false && (
                  <p className="text-xs text-red-500 mt-1">Username is taken</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !isAvailable}
                className="w-full rounded-xl font-bold h-12 bg-gradient-to-r from-primary to-purple-500 text-white"
              >
                {loading ? "Please wait..." : "Continue"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">
            Friends Map
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect through trusted introductions
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin(googleProvider)}
            disabled={loading}
            className="w-full h-14 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-100 text-lg font-medium shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-3"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSocialLogin(facebookProvider)}
            disabled={loading}
            className="w-full h-14 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-100 text-lg font-medium shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-3"
          >
            <Facebook className="h-6 w-6 text-[#1877F2]" />
            Continue with Facebook
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
