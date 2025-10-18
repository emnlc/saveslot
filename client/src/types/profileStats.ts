export interface ProfileStats {
  total_games: number;
  completed_games: number;
  backlog_games: number;
  total_hours_played: number;
  completion_percentage: number;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface GenreData {
  name: string;
  count: number;
}

export interface ActivityHeatmap {
  [date: string]: number;
}
