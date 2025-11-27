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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-white p-6 font-sans relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-sm w-full z-10"
      >
        {/* App Icon / Logo Placeholder */}
        <div className="w-20 h-20 bg-white rounded-3xl shadow-lg shadow-primary/10 flex items-center justify-center mb-8 rotate-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-purple-400 rounded-xl" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Welcome</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Find friends through trusted introductions.
        </p>

        <div className="w-full space-y-4 mb-12">
          <Button 
            className="w-full h-14 rounded-2xl bg-white text-foreground border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all text-base font-bold flex items-center justify-center gap-3"
            onClick={handleLogin}
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </Button>

          <Button 
            className="w-full h-14 rounded-2xl bg-black text-white hover:bg-gray-900 shadow-md transition-all text-base font-bold flex items-center justify-center gap-3"
            onClick={handleLogin}
          >
            <AppleIcon className="w-5 h-5 fill-current" />
            Continue with Apple
          </Button>
        </div>

        <button className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
            Privacy Policy
        </button>

      </motion.div>
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
