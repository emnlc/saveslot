import GameCard from "@/components/content/GameCard";

interface Game {
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

interface GameListItem {
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

type Props = {
  editMode: boolean;
  data: ListData;
  gamesToRemove: Set<number>;
  toggleGameRemoval: (gameId: number) => void;
};

const RemovedItems = ({
  editMode,
  data,
  gamesToRemove,
  toggleGameRemoval,
}: Props) => {
  return (
    <>
      {editMode && gamesToRemove.size > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            Games to be removed ({gamesToRemove.size}):
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 opacity-50 transition-all">
            {data.games
              .filter(({ games }) => gamesToRemove.has(games.id))
              .map(({ games }) => (
                <GameCard
                  key={`remove-${games.id}`}
                  id={games.id.toString()}
                  name={games.name}
                  slug={games.slug}
                  coverId={games.cover_id || ""}
                  editMode={true}
                  onRemoveClick={() => toggleGameRemoval(games.id)}
                  isMarkedForRemoval={true}
                  showAsMarkedForRemoval={true}
                />
              ))}
          </div>
          <p className="text-sm text-red-600 mt-2">
            Click on a game above to un-mark it for removal
          </p>
        </div>
      )}
    </>
  );
};

export default RemovedItems;
