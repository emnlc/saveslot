import { useQuery } from "@tanstack/react-query";
import { Activity, UserActivityResponse } from "@/types/activity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useUserActivity = (userId: string, days: number = 14) => {
  return useQuery({
    queryKey: ["user-activity", userId, days],
    queryFn: async (): Promise<Activity[]> => {
      const response = await fetch(
        `${API_URL}/activity/user/${userId}?days=${days}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user activity");
      }

      const data: UserActivityResponse = await response.json();
      return data.activities;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
