export interface LikeInput {
  user_id: string;
  target_type: "game" | "list" | "review";
  target_id: string | number;
}

export interface UnlikeInput {
  user_id: string;
  target_type: "game" | "list" | "review";
  target_id: string | number;
}

export interface Like {
  id: string;
  user_id: string;
  target_type: "game" | "list" | "review";
  liked_at: string;
  game_id?: number;
  list_id?: string;
  review_id?: string;
}

export interface LikedGame {
  id: number;
  name: string;
  cover_id: string | null;
  slug: string;
  is_nsfw: boolean;
  liked_at: string;
  like_id: string;
}

export interface LikedList {
  id: string;
  name: string;
  slug: string;
  user_id: string;
  created_at: string;
  is_public: boolean;
  liked_at: string;
  like_id: string;
  game_count: number;
  preview_games?: Array<{
    id: number;
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

export interface LikedReview {
  id: string;
  game_id: number;
  user_id: string;
  rating: number | null;
  review_text: string | null;
  game_status: string | null;
  platform: string | null;
  contains_spoilers: boolean;
  created_at: string;
  updated_at: string;
  is_draft: boolean;
  liked_at: string;
  like_id: string;
  game?: {
    id: number;
    name: string;
    cover_id: string | null;
    slug: string;
  };
  profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}
