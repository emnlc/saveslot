export interface UpdateGameStatusParams {
  userId: string;
  gameId: number;
  status: GameStatus;
}

export interface RemoveGameStatusParams {
  userId: string;
  gameId: number;
}

export type GameStatus =
  | "completed"
  | "dropped"
  | "playing"
  | "backlog"
  | "played"
  | "wishlist"
  | "abandoned";

export interface Game {
  id: number;
  name: string;
  cover_id: string | null;
  slug: string;
  is_nsfw: boolean;
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: number;
  status: GameStatus;
  created_at: string;
  last_updated: string;
  game: Game;
}
