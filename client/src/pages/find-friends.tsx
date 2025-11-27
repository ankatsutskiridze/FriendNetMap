import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, UserPlus, UserCheck, Filter } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Drawer } from "vaul";

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
    </div>
  );
}
