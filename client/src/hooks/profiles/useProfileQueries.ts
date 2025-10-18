import { useQuery } from "@tanstack/react-query";
import type { ProfileLayout } from "@/types/profiles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { Profile } from "@/types/profiles";

// Get profile by username
export const useProfile = (username: string, currentUserId?: string) => {
  return useQuery<Profile>({
    queryKey: ["profile", username, currentUserId],
    queryFn: async () => {
      const url = currentUserId
        ? `${API_URL}/profiles/${username}?current_user_id=${currentUserId}`
        : `${API_URL}/profiles/${username}`;

      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Profile not found");
        }
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message === "Profile not found") return false;
      return failureCount < 3;
    },
  });
};

export const useProfileLayout = (userId: string) => {
  return useQuery<ProfileLayout>({
    queryKey: ["profile-layout", userId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/profiles/${userId}/layout`);
      if (!response.ok) throw new Error("Failed to fetch profile layout");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
