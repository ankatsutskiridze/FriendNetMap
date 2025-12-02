import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, IntroRequest, UserSettings } from "@shared/schema";

type UserWithoutPassword = Omit<User, "password">;

const BASE_URL = import.meta.env.VITE_API_URL || "";

console.log("Current API URL:", BASE_URL); // Debugging log

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith("/") ? BASE_URL + url : url;
  const res = await fetch(fullUrl, {
    ...options,
    credentials: "include", // CRITICAL: Send cookies with requests
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Redirect to login if session expired
      // Use window.location to force a refresh and clear AuthContext state
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message);
  }
  return res.json();
}

export function useCurrentUser() {
  return useQuery<UserWithoutPassword>({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson("/api/auth/me"),
    retry: false,
  });
}

export function useFriends() {
  return useQuery<UserWithoutPassword[]>({
    queryKey: ["friends"],
    queryFn: () => fetchJson("/api/friends"),
  });
}

export function useFriendsOfFriends() {
  return useQuery<
    (UserWithoutPassword & {
      mutualFriends: {
        id: string;
        fullName: string;
        photoURL: string | null;
      }[];
    })[]
  >({
    queryKey: ["friendsOfFriends"],
    queryFn: () => fetchJson("/api/friends/fof"),
  });
}

export function useUser(userId: string) {
  return useQuery<UserWithoutPassword>({
    queryKey: ["user", userId],
    queryFn: () => fetchJson(`/api/users/${userId}`),
    enabled: !!userId,
  });
}

export function useSearchUsers(query: string, enabled: boolean = true) {
  return useQuery<UserWithoutPassword[]>({
    queryKey: ["searchUsers", query],
    queryFn: () =>
      fetchJson(`/api/users/search?q=${encodeURIComponent(query)}`),
    enabled: enabled,
    retry: false,
  });
}

export function useAllUsers() {
  return useQuery<UserWithoutPassword[]>({
    queryKey: ["allUsers"],
    queryFn: () => fetchJson("/api/users"),
  });
}

export function useIntroRequestsReceived() {
  return useQuery<IntroRequest[]>({
    queryKey: ["introRequests", "received"],
    queryFn: () => fetchJson("/api/intro-requests/received"),
  });
}

export function useIntroRequestsSent() {
  return useQuery<IntroRequest[]>({
    queryKey: ["introRequests", "sent"],
    queryFn: () => fetchJson("/api/intro-requests/sent"),
  });
}

export function useActivity() {
  return useQuery<IntroRequest[]>({
    queryKey: ["activity"],
    queryFn: () => fetchJson("/api/activity"),
  });
}

export function useSettings() {
  return useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: () => fetchJson("/api/settings"),
  });
}

export function useAddFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) =>
      fetchJson(`/api/friends/${friendId}`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendsOfFriends"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["introRequests", "sent"] });
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["receivedFriendRequests"] });
    },
  });
}

export function useSentFriendRequests() {
  return useQuery<IntroRequest[]>({
    queryKey: ["sentFriendRequests"],
    queryFn: async () => {
      const requests = await fetchJson<IntroRequest[]>(
        "/api/intro-requests/sent"
      );
      return requests.filter((r: IntroRequest) => r.type === "friend");
    },
  });
}

export function useReceivedFriendRequests() {
  return useQuery<IntroRequest[]>({
    queryKey: ["receivedFriendRequests"],
    queryFn: async () => {
      const requests = await fetchJson<IntroRequest[]>(
        "/api/intro-requests/received"
      );
      return requests.filter(
        (r: IntroRequest) => r.type === "friend" && r.status === "pending"
      );
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) =>
      fetchJson(`/api/friends/${friendId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendsOfFriends"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      fetchJson(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (userId: string) =>
      fetchJson(`/api/users/${userId}`, { method: "DELETE" }),
  });
}

export function useCreateIntroRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      fromUserId: string;
      toUserId: string;
      viaUserId: string;
      message?: string;
    }) =>
      fetchJson("/api/intro-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["introRequests"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useApproveIntroRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      fetchJson(`/api/intro-requests/${requestId}/approve`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["introRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["receivedFriendRequests"] });
    },
  });
}

export function useDeclineIntroRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      fetchJson(`/api/intro-requests/${requestId}/decline`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["introRequests"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["receivedFriendRequests"] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserSettings>) =>
      fetchJson("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["settings"] });
      const previous = queryClient.getQueryData<UserSettings>(["settings"]);
      queryClient.setQueryData<UserSettings>(["settings"], (old) =>
        old ? { ...old, ...newData } : undefined
      );
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["settings"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
