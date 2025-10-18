import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import {
  AddFavoriteParams,
  RemoveFavoriteParams,
  ReorderFavoritesParams,
} from "@/types/favorites";

export const useAddFavoriteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, game_id, rank }: AddFavoriteParams) => {
      const res = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, game_id, rank }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add favorite game");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favorite-games", variables.user_id],
      });
    },
  });
};

export const useRemoveFavoriteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, game_id }: RemoveFavoriteParams) => {
      const res = await fetch(`${API_URL}/favorites/${user_id}/${game_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove favorite game");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favorite-games", variables.user_id],
      });
    },
  });
};

export const useReorderFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, favorites }: ReorderFavoritesParams) => {
      const res = await fetch(`${API_URL}/favorites/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, favorites }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reorder favorites");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favorite-games", variables.user_id],
      });
    },
  });
};
