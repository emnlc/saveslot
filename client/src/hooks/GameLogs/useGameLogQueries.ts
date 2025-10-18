import { useQuery } from "@tanstack/react-query";
import {
  GameLogWithProfile,
  GameRatingStats,
  LogFilters,
  LogCommentWithProfile,
  LogDraft,
} from "@/Interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    staleTime: 5 * 60 * 1000,
  });
};

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
    staleTime: 2 * 60 * 1000,
  });
};

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
    staleTime: 30 * 1000,
  });
};

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
