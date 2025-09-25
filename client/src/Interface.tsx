export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;

  display_name: string | null;
  bio: string | null;

  followers: number;
  following: number;
}

export type GameList = {
  id: string;
  user_id: string;
  name: string;
  is_private: boolean;
  created_at: string;
  slug: string;
};

export interface Game {
  cover_id?: string;
  id: number;
  name: string;
  cover: {
    id: string;
    image_id: string;
  };
  first_release_date: number;
  slug: string;
  involved_companies: InvolvedCompanies[];
  platforms: Platforms[];
  artworks: Artwork[];
  summary: string;
  storyline: string;
  rating: number;
  rating_count: number;
  aggregated_rating: number;
  url: string;
  videos: Video[];
  game_type: number;
  genres: [
    {
      id: number;
      name: string;
    },
  ];
  screenshots: [
    {
      id: number;
      image_id: string;
    },
  ];
  tags: number[];
  age_ratings: [
    {
      id: number;
      rating_category: {
        id: number;
        organization: {
          id: number;
          name: string;
        };
        rating: string;
        rating_cover_url: string;
      };
    },
  ];
  websites: [
    {
      id: number;
      url: string;
      type: {
        id: number;
        type: string;
      };
    },
  ];
  collections: [{ games: [Game] }];
}

interface Video {
  id: number;
  video_id: string;
  name: string;
  checksum: unknown;
}

interface Artwork {
  id: number;
  image_id: string;
}

interface InvolvedCompanies {
  company: {
    id: number;
    name: string;
  };
  developer: boolean;
  id: number;
  publisher: boolean;
}

interface Platforms {
  id: number;
  name: string;
  abbreviation: string;
  platform_logo: {
    id: number;
    image_id: string;
  };
}

// REVIEW TYPES
export interface GameLogWithProfile extends GameLog {
  profile: Profile;
  game: Game;
}

export interface LogComment {
  id: string;
  log_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface LogCommentWithProfile extends LogComment {
  profile: Profile;
}

export interface GameLog {
  id: string;
  user_id: string;
  game_id: number;
  rating?: number;
  review_text?: string;
  game_status?: string;
  platform?: string;
  play_start_date?: string;
  play_end_date?: string;
  hours_played: number;
  minutes_played: number;
  contains_spoilers: boolean;
  created_at: string;
  updated_at: string;
  is_draft: boolean;
}

export interface CreateGameLogData {
  game_id: number;
  rating?: number;
  review_text?: string;
  game_status?: string;
  platform?: string;
  play_start_date?: string;
  play_end_date?: string;
  hours_played?: number;
  minutes_played?: number;
  contains_spoilers?: boolean;
}

export interface LogDraft {
  id: string;
  user_id: string;
  game_id: number;
  rating?: number;
  review_text?: string;
  game_status?: string;
  platform?: string;
  play_start_date?: string;
  play_end_date?: string;
  hours_played: number;
  minutes_played: number;
  contains_spoilers: boolean;
  created_at: string;
  updated_at: string;
}
export interface UpdateGameLogData extends Partial<CreateGameLogData> {
  id: string;
}

export interface CreateLogCommentData {
  log_id: string;
  comment_text: string;
}

export interface GameRatingStats {
  average_rating: number;
  total_logs: number;
  rating_distribution: {
    [key: string]: number;
  };
  completion_rate: number;
  recent_activity: number;
  average_completion_time: string | null;
}

export interface LogFilters {
  sort_by?: "newest" | "oldest" | "highest_rated" | "lowest_rated";
  limit?: number;
  offset?: number;
}

export type GameStatus =
  | "completed"
  | "playing"
  | "dropped"
  | "plan_to_play"
  | "abandoned";

export interface GameListWithGames extends GameList {
  item_count: number;
  like_count: number;
  top_games: Game[];
  profile: Profile;
}
