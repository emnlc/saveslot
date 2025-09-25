import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface LikedList {
  id: string;
  name: string;
  slug: string;
  user_id: string;
  created_at: string;
  liked_at: string;
  like_id: string;
  game_count?: number;
  preview_games?: Array<{
    id: string;
    name: string;
    cover_id: string | null;
    slug: string;
  }>;
  author?: {
    id: string;
    username: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
  };
}

export const useUserLikedLists = (userId: string) => {
  return useQuery({
    queryKey: ["user-liked-lists", userId],
    queryFn: async (): Promise<LikedList[]> => {
      const { data: likes, error: likesError } = await supabase
        .from("likes")
        .select("id, liked_at, list_id")
        .eq("user_id", userId)
        .not("list_id", "is", null)
        .order("liked_at", { ascending: false });

      if (likesError) {
        throw likesError;
      }

      if (!likes || likes.length === 0) {
        return [];
      }

      // Get all the list IDs that were liked
      const listIds = likes.map((like) => like.list_id);

      // Fetch the actual list data
      const { data: lists, error: listsError } = await supabase
        .from("game_lists")
        .select("id, user_id, name, slug, created_at")
        .in("id", listIds);

      if (listsError) {
        throw listsError;
      }

      if (!lists) {
        return [];
      }

      // Get unique user IDs for all list authors
      const authorIds = [...new Set(lists.map((list) => list.user_id))];

      // Fetch author profiles
      const { data: authors, error: authorsError } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .in("id", authorIds);

      if (authorsError) {
        console.warn("Error fetching authors:", authorsError);
      }

      const enrichedLists: LikedList[] = [];

      for (const like of likes) {
        const list = lists.find((l) => String(l.id) === String(like.list_id));

        if (!list) continue;

        // Get game count for this list
        const { count } = await supabase
          .from("game_list_items")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id);

        // Get preview games
        const { data: items } = await supabase
          .from("game_list_items")
          .select("game_id")
          .eq("list_id", list.id)
          .order("rank", { ascending: true })
          .limit(10);

        let previewGames: Array<{
          id: string;
          name: string;
          cover_id: string | null;
          slug: string;
        }> = [];

        if (items && items.length > 0) {
          const gameIds = items.map((item) => item.game_id);

          const { data: games } = await supabase
            .from("games")
            .select("id, name, cover_id, slug")
            .in("id", gameIds);

          if (games) {
            // Reorder games according to the ranked items
            previewGames = items
              .map((item) => games.find((g) => g.id === item.game_id))
              .filter(Boolean) as typeof previewGames;
          }
        }

        // Find the author for this list
        const author = authors?.find(
          (a) => String(a.id) === String(list.user_id)
        );

        enrichedLists.push({
          id: list.id,
          name: list.name,
          slug: list.slug,
          user_id: list.user_id,
          created_at: list.created_at,
          liked_at: like.liked_at,
          like_id: like.id,
          game_count: count || 0,
          preview_games: previewGames,
          author: author
            ? {
                id: author.id,
                username: author.username,
                display_name: author.display_name,
                bio: author.bio,
                avatar_url: author.avatar_url,
              }
            : undefined,
        });
      }

      return enrichedLists;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
