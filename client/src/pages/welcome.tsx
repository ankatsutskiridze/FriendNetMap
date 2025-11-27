import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    // Mock login - go to create profile for onboarding flow
    setLocation("/create-profile");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-br from-blue-50 via-purple-50 to-white p-6 font-sans relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      {/* Top spacer */}
      <div className="h-12" />

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-sm w-full z-10 flex-1 justify-center"
      >
        {/* App Icon / Logo */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 12 }}
          className="w-20 h-20 bg-white rounded-3xl shadow-lg shadow-primary/20 flex items-center justify-center mb-8"
        >
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-400 rounded-xl" />
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-foreground mb-4 tracking-tight"
        >
          Welcome
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-16 leading-relaxed"
        >
          Find friends through trusted introductions.
        </motion.p>

        {/* Login Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-16 rounded-2xl bg-white text-foreground border-2 border-gray-200 hover:border-primary/30 hover:bg-primary/5 shadow-sm transition-all text-base font-bold flex items-center justify-center gap-3"
              onClick={handleLogin}
            >
              <GoogleIcon className="w-6 h-6" />
              Continue with Google
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 shadow-lg shadow-black/20 transition-all text-base font-bold flex items-center justify-center gap-3"
              onClick={handleLogin}
            >
              <AppleIcon className="w-6 h-6 fill-current" />
              Continue with Apple
            </Button>
          </motion.div>
        </motion.div>

        {/* Email signin link */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogin}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-semibold mb-8"
        >
          Sign in with email
        </motion.button>
      </motion.div>

      {/* Bottom legal text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground text-center max-w-sm leading-relaxed"
      >
        By continuing you agree to our{" "}
        <button className="text-primary hover:underline font-semibold transition-colors">
          Terms of Service
        </button>
        {" "}and{" "}
        <button className="text-primary hover:underline font-semibold transition-colors">
          Privacy Policy
        </button>
      </motion.p>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
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
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.68-.32-1.58-.32-2.27 0-1.02.48-2.1.55-3.08-.4-1.95-1.87-3.28-5.88-1.37-8.55 1.1-1.55 2.88-1.97 4.25-1.58.85.25 1.58.85 2.22.85.65 0 1.48-.63 2.45-.83 1.58-.32 3.18.43 4.05 1.58-3.55 1.7-2.95 5.93.55 7.4-.78 1.55-1.85 3.13-3.68 1.13zm-4.53-16.2c.5-.55 1.32-1.08 2.22-1.08.18 1.43-.95 2.83-2.02 3.35-.65.33-1.45.2-2.25-.15-.13-1.25 1.05-2.12 2.05-2.12z" />
    </svg>
  );
}
