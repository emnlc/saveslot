import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create new list
export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      isPublic,
      userId,
    }: {
      name: string;
      isPublic: boolean;
      userId: string;
    }) => {
      const res = await fetch(`${API_URL}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          is_public: isPublic,
          user_id: userId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create list");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-lists", variables.userId],
      });
    },
  });
};

// Update list
export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      name,
      isPublic,
    }: {
      listId: string;
      name?: string;
      isPublic?: boolean;
    }) => {
      const res = await fetch(`${API_URL}/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          is_public: isPublic,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update list");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
    },
  });
};

// Delete list
export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      const res = await fetch(`${API_URL}/lists/${listId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete list");
      }
      return res.json();
    },
    onSuccess: () => {
      // Cancel any outgoing list-items queries
      queryClient.cancelQueries({ queryKey: ["list-items"] });
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      // Remove list-items queries from cache
      queryClient.removeQueries({ queryKey: ["list-items"] });
      // Invalidate all game stats
      queryClient.invalidateQueries({ queryKey: ["game-stats"] });
    },
  });
};

// Add game to list
export const useAddGameToList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      gameId,
    }: {
      listId: string;
      gameId: number;
    }) => {
      const res = await fetch(`${API_URL}/lists/${listId}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add game to list");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });

      // Invalidate game stats
      queryClient.invalidateQueries({
        queryKey: ["game-stats", variables.gameId],
      });
    },
  });
};

// Remove game from list
export const useRemoveGameFromList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      gameId,
    }: {
      listId: string;
      gameId: number;
    }) => {
      const res = await fetch(`${API_URL}/lists/${listId}/games/${gameId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove game from list");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });

      queryClient.invalidateQueries({
        queryKey: ["game-stats", variables.gameId],
      });
    },
  });
};

// Update game ranks
export const useUpdateRanks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      updates,
    }: {
      listId: string;
      updates: Array<{ item_id: string; rank: number }>;
    }) => {
      const res = await fetch(`${API_URL}/lists/${listId}/ranks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update ranks");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
    },
  });
};
