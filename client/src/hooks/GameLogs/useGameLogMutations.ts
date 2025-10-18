import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import {
  GameLog,
  CreateGameLogData,
  UpdateGameLogData,
  LogCommentWithProfile,
  CreateLogCommentData,
  LogDraft,
} from "@/Interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      queryClient.invalidateQueries({
        queryKey: ["game-logs", newLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["game-rating-stats", newLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-logs", newLog.user_id],
      });
      queryClient.removeQueries({
        queryKey: ["log-draft", newLog.user_id, newLog.game_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-reviews", newLog.user_id],
      });
    },
  });
};

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
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["log-comments"] });
    },
  });
};

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
