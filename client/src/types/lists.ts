export interface Game {
  id: number;
  name: string;
  cover_id: string | null;
  slug: string;
  is_nsfw: boolean;
  is_released?: boolean;
  official_release_date?: string | null;
  igdb_total_rating?: number | null;
  popularity?: number | null;
}

export interface GameList {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  is_public: boolean;
  last_updated: string;
  game_count: number;
  preview_games: Game[];
}

export interface GameListItem {
  id: string;
  rank: number;
  games: Game;
}

export interface ListData {
  id: string;
  name: string;
  slug: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  last_updated: string;
  games: GameListItem[];
}

export interface PopularList {
  id: string;
  name: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  last_updated: string;
  user_id: string;
  like_count: number;
  item_count: number;
  preview_games: Array<{
    id: number;
    name: string;
    slug: string;
    cover_id: string | null;
  }>;
}
