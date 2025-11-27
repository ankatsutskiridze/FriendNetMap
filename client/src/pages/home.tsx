import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { Plus, Minus, Navigation, UserPlus, Bell, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useCurrentUser, useFriends, useFriendsOfFriends } from "@/lib/api";

import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";
import emptyNetworkImg from "@assets/generated_images/empty_network_illustration.png";

type NodeType = "me" | "friend" | "fof";

interface Node {
  id: string;
  type: NodeType;
  name: string;
  image: string;
  x: number;
  y: number;
  parentId?: string;
  bio?: string;
  mutuals?: number;
  location?: string;
  mutualFriends?: { id: string; fullName: string; photoURL: string | null }[];
}

interface Link {
  source: string;
  target: string;
}

const GENERATED_IMAGES = [imgWoman, imgMan, imgPerson];
const RING_1_RADIUS = 160;
const RING_2_RADIUS = 320;

const Bubble = ({ node, isSelected, onClick }: { node: Node; isSelected: boolean; onClick: () => void }) => {
  const size = node.type === "me" ? 100 : node.type === "friend" ? 64 : 48;
  const fontSize = node.type === "me" ? "text-sm font-bold" : node.type === "friend" ? "text-xs font-semibold" : "text-[10px] font-medium";
  const zIndex = node.type === "me" ? 30 : node.type === "friend" ? 20 : 10;

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center cursor-pointer touch-none"
      style={{
        left: node.x,
        top: node.y,
        width: size,
        height: size,
        x: "-50%",
        y: "-50%",
        zIndex: isSelected ? 50 : zIndex,
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      data-testid={`bubble-${node.id}`}
    >
      <motion.div
        className={cn(
          "rounded-full p-1 transition-all duration-500 ease-out",
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
  const [scale, setScale] = useState(0.9);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: friendsOfFriends = [], isLoading: fofLoading } = useFriendsOfFriends();

  const isLoading = userLoading || friendsLoading || fofLoading;

  const { nodes, links, meNode } = useMemo(() => {
    if (!currentUser) {
      return { nodes: [], links: [], meNode: null };
    }

    const nodesArray: Node[] = [];
    const linksArray: Link[] = [];

    const me: Node = {
      id: "me",
      type: "me",
      name: currentUser.fullName?.split(" ")[0] || "You",
      image: currentUser.photoURL || imgWoman,
      x: 0,
      y: 0,
      bio: currentUser.about || "",
      location: currentUser.location || "",
    };
    nodesArray.push(me);

    friends.forEach((friend, i) => {
      const angle = (i / Math.max(friends.length, 1)) * 2 * Math.PI;
      const friendNode: Node = {
        id: friend.id,
        type: "friend",
        name: friend.fullName?.split(" ")[0] || friend.username,
        image: friend.photoURL || GENERATED_IMAGES[(i + 1) % 3],
        x: Math.cos(angle) * RING_1_RADIUS,
        y: Math.sin(angle) * RING_1_RADIUS,
        parentId: "me",
        bio: friend.about || "",
        location: friend.location || "",
        mutuals: friend.friends?.length || 0,
      };
      nodesArray.push(friendNode);
      linksArray.push({ source: "me", target: friend.id });
    });

    const fofGroupedByParent: Map<string, typeof friendsOfFriends> = new Map();
    friendsOfFriends.forEach(fof => {
      if (fof.mutualFriends && fof.mutualFriends.length > 0) {
        const parentId = fof.mutualFriends[0].id;
        if (!fofGroupedByParent.has(parentId)) {
          fofGroupedByParent.set(parentId, []);
        }
        fofGroupedByParent.get(parentId)!.push(fof);
      }
    });

    friends.forEach((friend, friendIndex) => {
      const friendAngle = (friendIndex / Math.max(friends.length, 1)) * 2 * Math.PI;
      const fofList = fofGroupedByParent.get(friend.id) || [];
      
      fofList.slice(0, 3).forEach((fof, j) => {
        const spread = 0.35;
        const childAngle = friendAngle + (j - 1) * spread;
        
        const fofNode: Node = {
          id: fof.id,
          type: "fof",
          name: fof.fullName?.split(" ")[0] || fof.username,
          image: fof.photoURL || GENERATED_IMAGES[(friendIndex * 3 + j + 2) % 3],
          x: Math.cos(childAngle) * RING_2_RADIUS,
          y: Math.sin(childAngle) * RING_2_RADIUS,
          parentId: friend.id,
          bio: fof.about || "",
          location: fof.location || "",
          mutuals: fof.mutualFriends?.length || 0,
          mutualFriends: fof.mutualFriends,
        };
        nodesArray.push(fofNode);
        linksArray.push({ source: friend.id, target: fof.id });
      });
    });

    return { nodes: nodesArray, links: linksArray, meNode: me };
  }, [currentUser, friends, friendsOfFriends]);

  const hasNodes = nodes.length > 1;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.4));
  const handleRecenter = () => {
    x.set(0);
    y.set(0);
    setScale(1);
    if (meNode) setSelectedNode(meNode);
  };

  const handleNodeClick = (node: Node) => {
    if (node.id === "me") {
      handleRecenter();
      return;
    }
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-white text-foreground font-sans">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-white/20 shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-tight" data-testid="text-page-title">Friends Map</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-white/50 text-muted-foreground hover:text-primary transition-colors" 
            onClick={() => setLocation("/requests")}
            data-testid="button-notifications"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </div>
          </Button>
          <span className="text-xs font-medium text-muted-foreground hidden sm:block">
            Welcome, {currentUser?.fullName?.split(" ")[0] || "Friend"}
          </span>
          <div 
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => setLocation("/profile")}
            data-testid="link-profile"
          >
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
              <AvatarImage src={currentUser?.photoURL || imgWoman} />
              <AvatarFallback>{currentUser?.fullName?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <motion.div
          className="relative w-0 h-0"
          style={{ x, y, scale }}
          drag
          dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
          dragElastic={0.1}
        >
          <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
            <circle cx="0" cy="0" r={RING_1_RADIUS} fill="none" stroke="currentColor" className="text-primary/5" strokeWidth="40" />
            <circle cx="0" cy="0" r={RING_1_RADIUS} fill="none" stroke="currentColor" className="text-primary/10" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r={RING_2_RADIUS} fill="none" stroke="currentColor" className="text-secondary/5" strokeWidth="40" />
            <circle cx="0" cy="0" r={RING_2_RADIUS} fill="none" stroke="currentColor" className="text-secondary/10" strokeWidth="1" strokeDasharray="4 4" />

            {links.map((link, i) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;
              
              let d = "";
              if (sourceNode.id === 'me') {
                const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
                const curveIntensity = 20;
                const cpX = midX + Math.cos(angle + Math.PI / 2) * curveIntensity;
                const cpY = midY + Math.sin(angle + Math.PI / 2) * curveIntensity;
                d = `M ${sourceNode.x} ${sourceNode.y} Q ${cpX} ${cpY} ${targetNode.x} ${targetNode.y}`;
              } else {
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const curveAmount = 0.25; 
                const cx = midX - dy * curveAmount;
                const cy = midY + dx * curveAmount;
                d = `M ${sourceNode.x} ${sourceNode.y} Q ${cx} ${cy} ${targetNode.x} ${targetNode.y}`;
              }

              return (
                <motion.g key={`${link.source}-${link.target}`}>
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
                    stroke="hsl(262, 60%, 85%)"
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

      <div className="absolute right-4 top-24 z-20 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 shadow-sm hover:bg-white"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white/90 shadow-sm hover:bg-white"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <Minus className="h-4 w-4 text-foreground" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-10 w-10 rounded-full shadow-sm bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 mt-2"
          onClick={handleRecenter}
          data-testid="button-recenter"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {!hasNodes && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-white z-30">
          <div className="text-center px-6 max-w-sm">
            <img src={emptyNetworkImg} alt="Empty map" className="w-40 h-40 mx-auto mb-8 opacity-90" />
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-empty-title">Your map is empty</h2>
            <p className="text-muted-foreground mb-8">Add your first friends to start building your network.</p>
            <Button 
              className="rounded-2xl font-bold px-8 h-12 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90" 
              data-testid="button-invite-friend"
              onClick={() => setLocation("/find-friends")}
            >
              Find Friends
            </Button>
          </div>
        </div>
      )}

      <Drawer.Root 
        open={isDrawerOpen} 
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setSelectedNode(null);
        }} 
        shouldScaleBackground
      >
        <Drawer.Trigger asChild>
          <div className="hidden" />
        </Drawer.Trigger>
        
        <AnimatePresence>
          {!isDrawerOpen && hasNodes && (
            <motion.div 
              className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/50 p-3 pb-3 text-center cursor-pointer z-30 shadow-lg rounded-2xl"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <span className="text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Tap a bubble to explore connections
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="p-4 bg-white rounded-t-[32px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 mb-8" />
              
              {selectedNode && (
                <div className="max-w-md mx-auto px-4 pb-8">
                  <div className="flex flex-col items-center text-center">
                    <motion.div className="relative mb-4">
                      <Avatar className="h-24 w-24 border-[4px] border-white shadow-xl ring-1 ring-black/5">
                        <AvatarImage src={selectedNode.image} />
                        <AvatarFallback>{selectedNode.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 bg-green-400 w-5 h-5 rounded-full border-[3px] border-white shadow-sm" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight" data-testid="text-selected-name">{selectedNode.name}</h2>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8">
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-bold">
                        {selectedNode.type === 'friend' ? 'Friend' : 'Friend of Friend'}
                      </span>
                      {selectedNode.location && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span>{selectedNode.location}</span>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                      <div className="flex flex-col items-center justify-center p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
                        <span className="text-2xl font-bold text-secondary-foreground tabular-nums">{selectedNode.mutuals || 0}</span>
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Mutuals</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <span className="text-2xl font-bold text-primary tabular-nums">{selectedNode.type === 'friend' ? 'Direct' : 'FoF'}</span>
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">Connection</span>
                      </div>
                    </div>

                    {selectedNode.bio && (
                      <div className="w-full text-left mb-8">
                        <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {selectedNode.bio}
                        </p>
                      </div>
                    )}

                    {selectedNode.mutualFriends && selectedNode.mutualFriends.length > 0 && (
                      <div className="w-full text-left mb-8">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-foreground">Connected Through</h3>
                        </div>
                        <div className="flex items-center -space-x-3">
                          {selectedNode.mutualFriends.slice(0, 3).map((mutual, i) => (
                            <div key={mutual.id} className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-black/5 overflow-hidden bg-gray-100">
                              <img src={mutual.photoURL || GENERATED_IMAGES[i % 3]} className="w-full h-full object-cover opacity-90" alt={mutual.fullName} />
                            </div>
                          ))}
                          {selectedNode.mutualFriends.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-black/5 bg-gray-50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                              +{selectedNode.mutualFriends.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedNode.type === 'fof' ? (
                      <Button 
                        className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity" 
                        size="lg"
                        onClick={() => setLocation(`/request-intro/${selectedNode.id}`)}
                        data-testid="button-request-intro"
                      >
                        <UserPlus className="mr-2 h-5 w-5" />
                        Request Introduction
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 transition-opacity" 
                        size="lg"
                        onClick={() => setLocation(`/profile/${selectedNode.id}`)}
                        data-testid="button-view-profile"
                      >
                        View Profile
                      </Button>
                    )}
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
