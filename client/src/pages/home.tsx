import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Plus, Minus, Navigation, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

// Assets
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

// --- Types ---
type NodeType = "me" | "friend" | "fof";

interface Node {
  id: string;
  type: NodeType;
  name: string;
  image: string;
  x: number;
  y: number;
  parentId?: string; // Who they are connected to (for friends of friends)
  bio?: string;
  mutuals?: number;
}

interface Link {
  source: string;
  target: string;
}

// --- Mock Data Generation ---
const GENERATED_IMAGES = [imgWoman, imgMan, imgPerson];

const ME: Node = {
  id: "me",
  type: "me",
  name: "You",
  image: imgWoman, // Assuming user is the woman for this demo
  x: 0,
  y: 0,
  bio: "Love exploring new coffee shops and hiking trails!",
  mutuals: 0,
};

const FRIENDS_COUNT = 6;
const FOF_PER_FRIEND = 3; // Increased density slightly for better visuals
const RING_1_RADIUS = 160; // Increased spacing
const RING_2_RADIUS = 320; // Increased spacing

const nodes: Node[] = [ME];
const links: Link[] = [];

// Generate Ring 1 (Direct Friends)
for (let i = 0; i < FRIENDS_COUNT; i++) {
  const angle = (i / FRIENDS_COUNT) * 2 * Math.PI;
  const id = `friend-${i}`;
  const x = Math.cos(angle) * RING_1_RADIUS;
  const y = Math.sin(angle) * RING_1_RADIUS;
  
  nodes.push({
    id,
    type: "friend",
    name: ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley"][i],
    image: GENERATED_IMAGES[(i + 1) % 3],
    x,
    y,
    parentId: "me",
    bio: "Digital nomad & photographer. Always looking for the next adventure.",
    mutuals: 5 + i,
  });
  
  links.push({ source: "me", target: id });

  // Generate Ring 2 (Friends of Friends)
  // We offset the angle slightly for children so they fan out
  for (let j = 0; j < FOF_PER_FRIEND; j++) {
    const childId = `fof-${i}-${j}`;
    // Spread slightly around the parent's angle
    // (j - (total-1)/2) centers the fan around the parent
    const spread = 0.35; 
    const childAngle = angle + (j - (FOF_PER_FRIEND - 1) / 2) * spread; 
    const cx = Math.cos(childAngle) * RING_2_RADIUS;
    const cy = Math.sin(childAngle) * RING_2_RADIUS;

    nodes.push({
      id: childId,
      type: "fof",
      name: ["Sam", "Jamie", "Robin", "Drew", "Quinn", "Avery", "Cameron", "Skyler", "Reese", "Dakota", "River", "Sage", "Peyton", "Hayden", "Blake", "Charlie", "Finley", "Rowan"][i * 3 + j],
      image: GENERATED_IMAGES[(i * 3 + j + 2) % 3],
      x: cx,
      y: cy,
      parentId: id,
      bio: "Tech enthusiast and weekend baker. Let's connect!",
      mutuals: Math.floor(Math.random() * 5) + 1,
    });

    links.push({ source: id, target: childId });
  }
}

// --- Components ---

const Bubble = ({ node, isSelected, onClick }: { node: Node; isSelected: boolean; onClick: () => void }) => {
  // Enhanced sizes: Center is much larger now
  const size = node.type === "me" ? 100 : node.type === "friend" ? 64 : 48;
  const fontSize = node.type === "me" ? "text-sm font-bold" : node.type === "friend" ? "text-xs font-semibold" : "text-[10px] font-medium";
  
  // Z-index hierarchy
  const zIndex = node.type === "me" ? 30 : node.type === "friend" ? 20 : 10;

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center cursor-pointer touch-none"
      style={{
        left: node.x,
        top: node.y,
        width: size,
        height: size,
        x: "-50%", // Center the div on the coordinate
        y: "-50%",
        zIndex: isSelected ? 50 : zIndex,
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className={cn(
          "rounded-full p-1 transition-all duration-500 ease-out",
          // Selection glow effects
          isSelected 
            ? "ring-4 ring-primary ring-offset-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]" 
            : "ring-2 ring-white/80 shadow-sm",
          node.type === "me" ? "bg-primary/5" : "bg-white"
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: Math.random() * 0.2 }}
      >
        <Avatar className="w-full h-full pointer-events-none">
          <AvatarImage src={node.image} className="object-cover" />
          <AvatarFallback>{node.name[0]}</AvatarFallback>
        </Avatar>
      </motion.div>
      
      <span className={cn(
        "absolute top-full mt-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-foreground shadow-sm whitespace-nowrap pointer-events-none select-none border border-white/50",
        fontSize,
        isSelected && "font-bold text-primary"
      )}>
        {node.name}
      </span>
    </motion.div>
  );
};

export default function FriendsMap() {
  const [scale, setScale] = useState(0.9); // Start slightly zoomed out to see more
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Framer motion values for drag/pan
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.4));
  const handleRecenter = () => {
    x.set(0);
    y.set(0);
    setScale(1);
    setSelectedNode(ME);
  };

  const handleNodeClick = (node: Node) => {
    if (node.id === "me") {
        // Just recenter if clicking self
        handleRecenter();
        return;
    } 
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  // Center the map initially
  useEffect(() => {
    if (containerRef.current) {
      // Center logic handled by flex/absolute centering of the motion.div
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-white text-foreground font-sans">
      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-white/20 shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-tight">Friends Map</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground hidden sm:block">Welcome, You</span>
          <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
            <AvatarImage src={ME.image} />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Interactive Area */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <motion.div
          className="relative w-0 h-0" // Zero size container, nodes are positioned absolutely from center
          style={{ x, y, scale }}
          drag
          dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
          dragElastic={0.1}
        >
          {/* SVG Lines and Background Rings */}
          <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
            {/* Concentric Background Rings */}
            <circle cx="0" cy="0" r={RING_1_RADIUS} fill="none" stroke="currentColor" className="text-primary/5" strokeWidth="40" />
            <circle cx="0" cy="0" r={RING_1_RADIUS} fill="none" stroke="currentColor" className="text-primary/10" strokeWidth="1" strokeDasharray="4 4" />
            
            <circle cx="0" cy="0" r={RING_2_RADIUS} fill="none" stroke="currentColor" className="text-secondary/5" strokeWidth="40" />
            <circle cx="0" cy="0" r={RING_2_RADIUS} fill="none" stroke="currentColor" className="text-secondary/10" strokeWidth="1" strokeDasharray="4 4" />

            {links.map((link, i) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              // Calculate path
              let d = "";

              if (sourceNode.id === 'me') {
                // Center to Ring 1: Gentle S-curve or arc
                // We can use a Quadratic curve that bends slightly
                // Calculate a control point slightly offset from the midpoint
                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;
                
                // Offset control point perpendicular to the line
                // This gives a slight "petal" or organic curve feel rather than rigid spoke
                const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
                const curveIntensity = 20; // Pixel offset
                const cpX = midX + Math.cos(angle + Math.PI / 2) * curveIntensity;
                const cpY = midY + Math.sin(angle + Math.PI / 2) * curveIntensity;

                d = `M ${sourceNode.x} ${sourceNode.y} Q ${cpX} ${cpY} ${targetNode.x} ${targetNode.y}`;
              } else {
                // Ring 1 to Ring 2: Branching curves
                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;
                
                // Stronger curve for outer branches to show hierarchy
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const curveAmount = 0.25; 
                const cx = midX - dy * curveAmount;
                const cy = midY + dx * curveAmount;
                
                d = `M ${sourceNode.x} ${sourceNode.y} Q ${cx} ${cy} ${targetNode.x} ${targetNode.y}`;
              }

              return (
                <motion.g key={`${link.source}-${link.target}`}>
                   {/* Blur shadow for depth/softness */}
                   <motion.path
                    d={d}
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeOpacity="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5, delay: i * 0.03 }}
                  />
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="hsl(262, 60%, 85%)" // Soft pastel lavender
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 1.5, delay: i * 0.03, ease: "easeOut" }}
                  />
                </motion.g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <Bubble 
              key={node.id} 
              node={node} 
              isSelected={selectedNode?.id === node.id}
              onClick={() => handleNodeClick(node)}
            />
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute right-4 top-24 z-20 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 shadow-sm hover:bg-white"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4 text-foreground" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 shadow-sm hover:bg-white"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4 text-foreground" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-10 w-10 rounded-full shadow-sm bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 mt-2"
          onClick={handleRecenter}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom Sheet (Vaul Drawer) */}
      <Drawer.Root 
        open={isDrawerOpen} 
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setSelectedNode(null);
        }} 
        shouldScaleBackground
      >
        <Drawer.Trigger asChild>
            {/* Hidden trigger, we control via state */}
            <div className="hidden" />
        </Drawer.Trigger>
        
        {/* Default "Tap a bubble" bar (Only visible when drawer is closed) */}
        <AnimatePresence>
          {!isDrawerOpen && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/50 p-4 pb-8 text-center cursor-pointer z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[24px]"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={() => {
                  // Hint effect could go here
              }}
            >
              <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/20 mb-4" />
              <span className="text-sm font-semibold text-muted-foreground">Tap a bubble to explore connections</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="p-4 bg-white rounded-t-[32px] flex-1 overflow-y-auto">
              {/* Handle Bar */}
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 mb-8" />
              
              {selectedNode && (
                <div className="max-w-md mx-auto px-4 pb-8">
                  <div className="flex flex-col items-center text-center">
                    
                    {/* Avatar Section */}
                    <motion.div 
                        layoutId={`avatar-${selectedNode.id}`}
                        className="relative mb-4"
                    >
                        <Avatar className="h-24 w-24 border-[4px] border-white shadow-xl ring-1 ring-black/5">
                        <AvatarImage src={selectedNode.image} />
                        <AvatarFallback>{selectedNode.name[0]}</AvatarFallback>
                        </Avatar>
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-1 right-1 bg-green-400 w-5 h-5 rounded-full border-[3px] border-white shadow-sm" />
                    </motion.div>

                    {/* Name & Meta */}
                    <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">{selectedNode.name}</h2>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8">
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-bold">
                          {selectedNode.type === 'friend' ? 'Friend' : 'Friend of Friend'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span>Tel Aviv, Israel</span>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                        <div className="flex flex-col items-center justify-center p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
                            <span className="text-2xl font-bold text-secondary-foreground tabular-nums">{selectedNode.mutuals}</span>
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Mutuals</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <span className="text-2xl font-bold text-primary tabular-nums">{Math.floor(Math.random() * 400) + 120}</span>
                            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Friends</span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="w-full text-left mb-8">
                        <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {selectedNode.bio}
                        </p>
                    </div>

                    {/* Mutual Friends Section */}
                    <div className="w-full text-left mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-foreground">Mutual Friends</h3>
                            <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">View all</span>
                        </div>
                        <div className="flex items-center -space-x-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-black/5 overflow-hidden bg-gray-100">
                                   <img src={GENERATED_IMAGES[i % 3]} className="w-full h-full object-cover opacity-90" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-black/5 bg-gray-50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                +{(selectedNode.mutuals ?? 0) > 3 ? (selectedNode.mutuals ?? 0) - 3 : 0}
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                        className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity" 
                        size="lg"
                    >
                        <UserPlus className="mr-2 h-5 w-5" />
                        Request Introduction
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
