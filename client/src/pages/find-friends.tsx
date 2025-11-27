import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, UserPlus, UserCheck, Filter, ChevronRight, Link2, Phone, Copy, Share2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Drawer } from "vaul";
import { useToast } from "@/hooks/use-toast";

// Assets
import imgWoman from "@assets/generated_images/friendly_young_woman_avatar.png";
import imgMan from "@assets/generated_images/friendly_young_man_avatar.png";
import imgPerson from "@assets/generated_images/friendly_person_avatar.png";

// Mock Data for Suggestions
const SUGGESTED_USERS = [
  {
    id: "suggested-1",
    name: "Jamie Rivera",
    avatar: imgWoman,
    mutuals: 5,
    status: "none" // none, requested, added
  },
  {
    id: "suggested-2",
    name: "Sam Wilson",
    avatar: imgMan,
    mutuals: 3,
    status: "none"
  },
  {
    id: "suggested-3",
    name: "Alex Morgan",
    avatar: imgPerson,
    mutuals: 8,
    status: "requested"
  },
  {
    id: "suggested-4",
    name: "Casey Jordan",
    avatar: imgWoman,
    mutuals: 2,
    status: "none"
  },
  {
    id: "suggested-5",
    name: "Drew Taylor",
    avatar: imgMan,
    mutuals: 12,
    status: "none"
  }
];

export default function FindFriendsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [users, setUsers] = useState(SUGGESTED_USERS);
  const [selectedUser, setSelectedUser] = useState<typeof SUGGESTED_USERS[0] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [expandedInvite, setExpandedInvite] = useState<"link" | "phone" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  
  const inviteLink = "https://app.friendsmap.com/invite/ABC123";

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === "none" ? "added" : user.status;
        
        // If adding, persist to localStorage for Home map to pick up
        if (newStatus === "added") {
          const newFriend = {
            id: `new-friend-${Date.now()}`,
            type: "friend",
            name: user.name,
            image: user.avatar,
            x: Math.random() * 200 - 100, // Random position near center
            y: Math.random() * 200 - 100,
            parentId: "me",
            bio: "New friend added!",
            mutuals: user.mutuals
          };
          
          const existingFriends = JSON.parse(localStorage.getItem("my-friends") || "[]");
          localStorage.setItem("my-friends", JSON.stringify([...existingFriends, newFriend]));
        }
        
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleUserClick = (user: typeof SUGGESTED_USERS[0]) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      description: "Invite link copied to clipboard.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Friends Map",
          text: "Join me on Friends Map to connect and network!",
          url: inviteLink,
        });
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendSMS = () => {
    if (!phoneNumber) {
      toast({
        description: "Please enter a phone number.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      description: "Invite sent. Your friend will get a link to join.",
    });
    setPhoneNumber("");
    setIsInviteDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white font-sans text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 rounded-full hover:bg-secondary/20"
          onClick={() => setLocation("/connections")} // Back to connections or home
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Find Friends</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search people by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-white shadow-sm rounded-xl h-12 text-base placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Friends of friends", "People you may know"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white/60 text-muted-foreground hover:bg-white border border-white/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Invite Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsInviteDrawerOpen(true)}
          className="bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 rounded-2xl p-5 mb-6 cursor-pointer hover:shadow-lg transition-all border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Invite friends who aren't on the app yet</h3>
              <p className="text-sm text-muted-foreground">Send them a link or SMS so they can join.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary shrink-0 ml-3" />
          </div>
        </motion.div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleUserClick(user)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground">{user.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {user.mutuals} mutual friends
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={(e) => handleAddUser(e, user.id)}
                disabled={user.status !== "none"}
                className={`rounded-full px-5 font-bold transition-all ${
                  user.status === "added"
                    ? "bg-green-100 text-green-700 hover:bg-green-100 shadow-none border border-green-200"
                    : user.status === "requested"
                    ? "bg-gray-100 text-muted-foreground hover:bg-gray-100 shadow-none"
                    : "bg-primary text-white hover:opacity-90 shadow-md shadow-primary/20"
                }`}
              >
                {user.status === "added" ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" />
                    Added
                  </>
                ) : user.status === "requested" ? (
                  "Requested"
                ) : (
                  "Add"
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mini Profile Drawer */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-50" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none shadow-2xl">
            <div className="p-6 bg-white rounded-t-[32px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8" />
              
              {selectedUser && (
                <div className="max-w-md mx-auto pb-8 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24 border-[4px] border-white shadow-xl">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-1">{selectedUser.name}</h2>
                  <p className="text-muted-foreground font-medium mb-8">
                    {selectedUser.mutuals} mutual friends
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                        <span className="block text-2xl font-bold text-secondary-foreground">{selectedUser.mutuals}</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Mutuals</span>
                     </div>
                     <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <span className="block text-2xl font-bold text-primary">120</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Friends</span>
                     </div>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-purple-500"
                    onClick={() => {
                        // Handle request intro logic here if needed
                        setIsDrawerOpen(false);
                    }}
                  >
                    Request Introduction
                  </Button>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Invite Friends Drawer */}
      <Drawer.Root open={isInviteDrawerOpen} onOpenChange={setIsInviteDrawerOpen} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-50" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] outline-none shadow-2xl">
            <div className="p-6 bg-white rounded-t-[32px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-6" />
              
              <div className="max-w-md mx-auto pb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Invite Friends</h2>
                <p className="text-muted-foreground mb-8">Choose how you want to invite them.</p>

                <div className="space-y-3">
                  {/* Invite by Link */}
                  <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedInvite(expandedInvite === "link" ? null : "link")}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Link2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-foreground">Invite by link</h3>
                        <p className="text-sm text-muted-foreground">Share a link to join</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedInvite === "link" ? "rotate-90" : ""}`} />
                    </button>
                    
                    {expandedInvite === "link" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 p-4 space-y-3"
                      >
                        <div className="bg-gray-50 rounded-xl p-3 text-sm text-foreground font-mono break-all">
                          {inviteLink}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCopyLink}
                            className="flex-1 rounded-xl font-bold"
                            variant="outline"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy link
                          </Button>
                          <Button
                            onClick={handleShare}
                            className="flex-1 rounded-xl font-bold bg-gradient-to-r from-primary to-purple-500 text-white"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share…
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Invite by Phone */}
                  <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedInvite(expandedInvite === "phone" ? null : "phone")}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-foreground">Invite by phone</h3>
                        <p className="text-sm text-muted-foreground">Send an SMS invite</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedInvite === "phone" ? "rotate-90" : ""}`} />
                    </button>
                    
                    {expandedInvite === "phone" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 p-4 space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-2">Phone number</label>
                          <Input
                            type="tel"
                            placeholder="e.g. +1 555 123 4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <Button
                          onClick={handleSendSMS}
                          className="w-full rounded-xl font-bold bg-gradient-to-r from-primary to-purple-500 text-white h-12"
                        >
                          Send SMS invite
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
