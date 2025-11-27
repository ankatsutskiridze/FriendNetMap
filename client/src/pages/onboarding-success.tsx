import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingSuccessPage() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm w-full relative z-10"
      >
        {/* Network Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-12 relative h-40 w-40"
        >
          {/* Central bubble */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full" />
          </motion.div>

          {/* Outer bubbles - animated orbit */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            {/* Top bubble */}
            <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-secondary rounded-full shadow-md" />
            {/* Bottom bubble */}
            <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-cyan-400 rounded-full shadow-md" />
            {/* Left bubble */}
            <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-pink-400 rounded-full shadow-md" />
            {/* Right bubble */}
            <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-300 rounded-full shadow-md" />
          </motion.div>

          {/* Connection lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 160 160"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="80" cy="80" r="40" className="text-primary/20" />
            <circle cx="80" cy="80" r="60" className="text-primary/10" />
            <line x1="80" y1="40" x2="80" y2="20" className="text-primary/20" />
            <line x1="80" y1="120" x2="80" y2="140" className="text-primary/20" />
            <line x1="40" y1="80" x2="20" y2="80" className="text-primary/20" />
            <line x1="120" y1="80" x2="140" y2="80" className="text-primary/20" />
          </svg>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              You're all set!
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Start exploring your friends map and meeting new people.
            </p>
          </div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="pt-4"
          >
            <Button
              onClick={handleContinue}
              className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity text-white flex items-center justify-center gap-2"
            >
              Go to Friends Map
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
