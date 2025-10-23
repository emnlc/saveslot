import {
  useFavoriteGames,
  useReorderFavorites,
  useRemoveFavoriteGame,
} from "@/hooks/favorites";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import SortableGameGrid, {
  SortableGameData,
} from "@/components/controls/SortableGameGrid";

interface Props {
  userId: string;
  isOwnProfile: boolean;
  onAddClick?: () => void;
}

const FavoriteGamesWidget = ({ userId, isOwnProfile, onAddClick }: Props) => {
  const { data: favorites, isLoading } = useFavoriteGames(userId);
  const reorderMutation = useReorderFavorites();
  const removeFavoriteMutation = useRemoveFavoriteGame();

  const [isEditMode, setIsEditMode] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<SortableGameData[]>([]);
  const [toDelete, setToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (favorites) {
      const transformed = favorites.map((fav) => ({
        id: fav.id,
        gameId: fav.game_id,
        slug: fav.games.slug,
        name: fav.games.name,
        coverId: fav.games.cover_id,
        rank: fav.rank,
      }));
      setLocalFavorites(transformed);
    }
  }, [favorites]);

  const handleReorder = (reorderedGames: SortableGameData[]) => {
    setLocalFavorites(reorderedGames);
  };

  const handleRemove = (id: string) => {
    const favorite = localFavorites.find((f) => f.id === id);
    if (favorite) {
      setToDelete((prev) => [...prev, favorite.gameId]);
      setLocalFavorites((prev) => {
        const filtered = prev.filter((f) => f.id !== id);

        return filtered.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      for (const gameId of toDelete) {
        await removeFavoriteMutation.mutateAsync({
          user_id: userId,
          game_id: gameId,
        });
      }

      if (localFavorites.length > 0) {
        const updates = localFavorites.map((fav, index) => ({
          id: fav.id,
          rank: index + 1,
        }));
        await reorderMutation.mutateAsync({
          user_id: userId,
          favorites: updates,
        });
      }

      setIsEditMode(false);
      setToDelete([]);
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
      if (favorites) {
        const transformed = favorites.map((fav) => ({
          id: fav.id,
          gameId: fav.game_id,
          slug: fav.games.slug,
          name: fav.games.name,
          coverId: fav.games.cover_id,
          rank: fav.rank,
        }));
        setLocalFavorites(transformed);
      }
      setToDelete([]);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setToDelete([]);
    if (favorites) {
      const transformed = favorites.map((fav) => ({
        id: fav.id,
        gameId: fav.game_id,
        slug: fav.games.slug,
        name: fav.games.name,
        coverId: fav.games.cover_id,
        rank: fav.rank,
      }));
      setLocalFavorites(transformed);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Favorite Games</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-base-300 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Favorite Games</h2>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={
                    reorderMutation.isPending ||
                    removeFavoriteMutation.isPending
                  }
                  className="btn btn-xs btn-success"
                >
                  {reorderMutation.isPending || removeFavoriteMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={
                    reorderMutation.isPending ||
                    removeFavoriteMutation.isPending
                  }
                  className="btn btn-xs btn-ghost"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  disabled={!favorites || favorites.length === 0}
                  className="btn btn-xs btn-soft"
                >
                  Edit
                </button>
                <button
                  onClick={onAddClick}
                  className="btn btn-xs btn-secondary"
                  disabled={favorites && favorites.length >= 10}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <SortableGameGrid
        games={localFavorites}
        isEditMode={isEditMode}
        showRank={false}
        showName={false}
        columns="grid-cols-5"
        emptyMessage={
          isOwnProfile
            ? "Add your favorite games to showcase them here!"
            : "No favorite games yet."
        }
        onReorder={handleReorder}
        onRemove={handleRemove}
      />

      {isEditMode && localFavorites.length > 0 && (
        <p className="text-xs text-base-content/60 mt-3 text-center">
          Drag and drop to reorder • Click X to remove
        </p>
      )}
    </div>
  );
};

export default FavoriteGamesWidget;
