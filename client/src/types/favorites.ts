export interface AddFavoriteParams {
  user_id: string;
  game_id: number;
  rank: number;
}

export interface RemoveFavoriteParams {
  user_id: string;
  game_id: number;
}

export interface ReorderFavoritesParams {
  user_id: string;
  favorites: Array<{ id: string; rank: number }>;
}

export interface FavoriteGame {
  id: string;
  game_id: number;
  rank: number;
  created_at: string;
  games: {
    id: number;
    name: string;
    slug: string;
    cover_id: string | null;
    official_release_date: string | null;
  };
}
