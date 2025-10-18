import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileLayout } from "@/types/profiles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { UpdateProfileParams } from "@/types/profiles";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...updates }: UpdateProfileParams) => {
      const res = await fetch(`${API_URL}/profiles/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate all profile queries for this user
      queryClient.invalidateQueries({
        queryKey: ["profile", data.username],
      });
    },
  });
};

export const useUpdateProfileLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      layout,
    }: {
      userId: string;
      layout: ProfileLayout;
    }) => {
      const response = await fetch(`${API_URL}/profiles/${userId}/layout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });

      if (!response.ok) throw new Error("Failed to update profile layout");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile-layout", variables.userId],
      });
    },
  });
};
