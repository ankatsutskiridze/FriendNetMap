import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, MapPin, UserPlus, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";

interface IntroPageProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Users,
    title: "Welcome to Friends Map",
    description: "Connect with new friends through people you already trust. Your social network, visualized.",
    gradient: "from-blue-400 to-purple-500",
    bgGradient: "from-blue-50 to-purple-50",
  },
  {
    icon: MapPin,
    title: "Your Network Map",
    description: "See your connections in beautiful circles. Your direct friends in the inner ring, friends-of-friends in the outer ring.",
    gradient: "from-purple-400 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    icon: UserPlus,
    title: "Two Ways to Connect",
    description: "Send direct friend requests, or ask a mutual friend to introduce you. Introductions need approval from both sides.",
    gradient: "from-pink-400 to-orange-500",
    bgGradient: "from-pink-50 to-orange-50",
  },
  {
    icon: Sparkles,
    title: "Discover New Friends",
    description: "Browse friends-of-friends, request introductions, and grow your trusted network naturally.",
    gradient: "from-orange-400 to-yellow-500",
    bgGradient: "from-orange-50 to-yellow-50",
  },
];

export default function IntroPage({ onComplete }: IntroPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const completeIntro = () => {
    onComplete();
  };

  const goToNext = () => {
    if (isLastSlide) {
      completeIntro();
    } else {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const skipIntro = () => {
    completeIntro();
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      if (!isLastSlide) {
        setDirection(1);
        setCurrentSlide((prev) => prev + 1);
      }
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      if (!isFirstSlide) {
        setDirection(-1);
        setCurrentSlide((prev) => prev - 1);
      }
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slide.bgGradient} flex flex-col transition-colors duration-500`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <button
          onClick={skipIntro}
          className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-skip-intro"
        >
          Skip
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center text-center max-w-sm cursor-grab active:cursor-grabbing"
          >
            <motion.div
              className={`w-28 h-28 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-xl`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Icon className="w-14 h-14 text-white" />
            </motion.div>

            <motion.h1
              className="text-2xl font-bold text-foreground mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              data-testid={`text-intro-title-${currentSlide}`}
            >
              {slide.title}
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-lg leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              data-testid={`text-intro-description-${currentSlide}`}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `bg-gradient-to-r ${slide.gradient} w-8`
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              data-testid={`button-dot-${index}`}
            />
          ))}
        </div>

        <div className="flex gap-3 max-w-sm mx-auto">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              onClick={goToPrev}
              className="flex-1 h-14 rounded-2xl text-base font-semibold"
              data-testid="button-prev"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}

          <Button
            onClick={goToNext}
            className={`flex-1 h-14 rounded-2xl text-base font-semibold bg-gradient-to-r ${slide.gradient} hover:opacity-90 text-white border-0 shadow-lg`}
            data-testid="button-next"
          >
            {isLastSlide ? "Get Started" : "Next"}
            {!isLastSlide && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
