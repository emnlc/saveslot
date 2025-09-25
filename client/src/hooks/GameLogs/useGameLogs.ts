import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import {
  GameLog,
  GameLogWithProfile,
  GameRatingStats,
  CreateGameLogData,
  UpdateGameLogData,
  LogFilters,
  LogCommentWithProfile,
  CreateLogCommentData,
  LogDraft,
} from "@/Interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Fetch logs for a specific game
export const useGameLogs = (gameId: number, filters: LogFilters = {}) => {
  const { sort_by = "newest", limit = 20, offset = 0 } = filters;

  return useQuery({
    queryKey: ["game-logs", gameId, sort_by, limit, offset],
    queryFn: async (): Promise<GameLogWithProfile[]> => {
      const params = new URLSearchParams({
        sort_by,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_URL}/reviews/game/${gameId}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch game logs");
      }

      return response.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch rating statistics for a game
export const useGameRatingStats = (gameId: number) => {
  return useQuery({
    queryKey: ["game-rating-stats", gameId],
    queryFn: async (): Promise<GameRatingStats> => {
      const response = await fetch(`${API_URL}/reviews/game/${gameId}/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch rating stats");
      }

      return response.json();
    },
    enabled: !!gameId,
    staleTime: 10 * 60 * 1000,
  });
};

// Fetch logs by user
export const useUserLogs = (userId: string, filters: LogFilters = {}) => {
  const { sort_by = "newest", limit = 20, offset = 0 } = filters;

  return useQuery({
    queryKey: ["user-logs", userId, sort_by, limit, offset],
    queryFn: async (): Promise<GameLogWithProfile[]> => {
      const params = new URLSearchParams({
        sort_by,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_URL}/reviews/user/${userId}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user logs");
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch comments for a log
export const useLogComments = (logId: string) => {
  return useQuery({
    queryKey: ["log-comments", logId],
    queryFn: async (): Promise<LogCommentWithProfile[]> => {
      const response = await fetch(`${API_URL}/reviews/${logId}/comments`);

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      return response.json();
    },
    enabled: !!logId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch draft for user/game
export const useLogDraft = (userId: string, gameId: number) => {
  return useQuery({
    queryKey: ["log-draft", userId, gameId],
    queryFn: async (): Promise<LogDraft | null> => {
      const response = await fetch(
        `${API_URL}/reviews/drafts/${userId}/${gameId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch draft");
      }

      return response.json();
    },
    enabled: !!userId && !!gameId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Create a new log
export const useCreateGameLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      logData: CreateGameLogData & { user_id: string }
    ): Promise<GameLog> => {
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...logData,
          hours_played: logData.hours_played || 0,
          minutes_played: logData.minutes_played || 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create log");
      }

      return response.json();
    },
    onSuccess: async (newLog) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["game-logs", newLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["game-rating-stats", newLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-logs", newLog.user_id],
      });

      // Remove draft from cache
      queryClient.removeQueries({
        queryKey: ["log-draft", newLog.user_id, newLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-reviews", newLog.user_id],
      });
    },
  });
};

// Update an existing log
export const useUpdateGameLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updateData: UpdateGameLogData & { user_id: string }
    ): Promise<GameLog> => {
      const { id, ...updates } = updateData;

      const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update log");
      }

      return response.json();
    },
    onSuccess: (updatedLog) => {
      queryClient.invalidateQueries({
        queryKey: ["game-logs", updatedLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["game-rating-stats", updatedLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-logs", updatedLog.user_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-reviews", updatedLog.user_id],
      });
    },
  });
};

// Delete a log
export const useDeleteGameLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      logId,
      userId,
    }: {
      logId: string;
      userId: string;
    }): Promise<void> => {
      const response = await fetch(`${API_URL}/reviews/${logId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete log");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["game-logs"] });
      queryClient.invalidateQueries({ queryKey: ["game-rating-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["user-logs", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-reviews", variables.userId],
      });
    },
  });
};

// Create a comment
export const useCreateLogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      commentData: CreateLogCommentData & { user_id: string }
    ): Promise<LogCommentWithProfile> => {
      const { log_id, ...data } = commentData;

      const response = await fetch(`${API_URL}/reviews/${log_id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create comment");
      }

      return response.json();
    },
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({
        queryKey: ["log-comments", newComment.log_id],
      });
    },
  });
};

// Delete a comment
export const useDeleteLogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      userId,
    }: {
      commentId: string;
      userId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("log_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId); // Ensure ownership

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate comments for all logs since we don't have the log_id
      queryClient.invalidateQueries({ queryKey: ["log-comments"] });
    },
  });
};

// Save/update draft
export const useSaveLogDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      draftData: Partial<CreateGameLogData> & {
        user_id: string;
        game_id: number;
      }
    ): Promise<LogDraft> => {
      const response = await fetch(`${API_URL}/reviews/drafts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draftData,
          hours_played: draftData.hours_played || 0,
          minutes_played: draftData.minutes_played || 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save draft");
      }

      return response.json();
    },
    onSuccess: (draft) => {
      queryClient.setQueryData(
        ["log-draft", draft.user_id, draft.game_id],
        draft
      );
    },
  });
};

// Delete draft
export const useDeleteLogDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      gameId,
    }: {
      userId: string;
      gameId: number;
    }): Promise<void> => {
      const { error } = await supabase
        .from("log_drafts")
        .delete()
        .eq("user_id", userId)
        .eq("game_id", gameId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.removeQueries({
        queryKey: ["log-draft", variables.userId, variables.gameId],
      });
    },
  });
};

// Custom hook for infinite loading of game logs
export const useInfiniteGameLogs = (
  gameId: number,
  sortBy: LogFilters["sort_by"] = "newest"
) => {
  return useQuery({
    queryKey: ["infinite-game-logs", gameId, sortBy],
    queryFn: async ({
      pageParam = 0,
    }): Promise<{ logs: GameLogWithProfile[]; nextOffset: number | null }> => {
      const limit = 20;
      const offset = pageParam as number;

      const params = new URLSearchParams({
        sort_by: sortBy,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_URL}/reviews/game/${gameId}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch game logs");
      }

      const logs = await response.json();
      const nextOffset = logs.length === limit ? offset + limit : null;

      return { logs, nextOffset };
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });
};
