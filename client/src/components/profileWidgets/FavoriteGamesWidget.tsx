import {
  useFavoriteGames,
  useReorderFavorites,
  useRemoveFavoriteGame,
} from "@/hooks/favorites";
import { Plus, GripVertical, X } from "lucide-react";
import GameCard from "@/components/content/GameCard";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  userId: string;
  isOwnProfile: boolean;
  onAddClick?: () => void;
}

interface SortableFavoriteProps {
  favorite: {
    id: string;
    rank: number;
    game_id: number;
    games: {
      name: string;
      slug: string;
      cover_id: string | null;
    };
  };
  isEditMode: boolean;
  onRemove: (id: string) => void;
}

const SortableFavorite = ({
  favorite,
  isEditMode,
  onRemove,
}: SortableFavoriteProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: favorite.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Rank badge */}
      <div className="absolute top-1 left-1 z-10 bg-primary text-primary-content w-5 h-5 flex items-center justify-center font-bold text-xs rounded">
        {favorite.rank}
      </div>
      {/* Edit mode controls */}
      {isEditMode && (
        <>
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-1 right-1 z-10 bg-base-100/90 p-1 rounded cursor-grab active:cursor-grabbing hover:bg-base-100"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          {/* Remove button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(favorite.id);
            }}
            className="absolute bottom-1 right-1 z-10 bg-error/90 text-error-content p-1 rounded hover:bg-error transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      <div className="flex">
        <GameCard
          id={favorite.game_id.toString()}
          slug={favorite.games.slug}
          coverId={favorite.games.cover_id || ""}
        />
      </div>
    </div>
  );
};

const FavoriteGamesWidget = ({ userId, isOwnProfile, onAddClick }: Props) => {
  const { data: favorites, isLoading } = useFavoriteGames(userId);
  const reorderMutation = useReorderFavorites();
  const removeFavoriteMutation = useRemoveFavoriteGame();

  const [isEditMode, setIsEditMode] = useState(false);
  const [localFavorites, setLocalFavorites] = useState(favorites || []);
  const [toDelete, setToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (favorites) {
      setLocalFavorites(favorites);
    }
  }, [favorites]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalFavorites((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        // Update ranks based on new positions
        return reordered.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
      });
    }
  };

  const handleMarkForDeletion = (id: string) => {
    const favorite = localFavorites.find((f) => f.id === id);
    if (favorite) {
      setToDelete((prev) => [...prev, favorite.game_id]);
      setLocalFavorites((prev) => {
        const filtered = prev.filter((f) => f.id !== id);
        // Recalculate ranks after removal
        return filtered.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      // delete marked items
      for (const gameId of toDelete) {
        await removeFavoriteMutation.mutateAsync({
          user_id: userId,
          game_id: gameId,
        });
      }

      // reorder remaining items
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
        setLocalFavorites(favorites);
      }
      setToDelete([]);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setToDelete([]);

    if (favorites) {
      setLocalFavorites(favorites);
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
              className="aspect-[2/3] bg-base-300 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const displayFavorites = isEditMode ? localFavorites : favorites || [];

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
                  className="btn btn-xs btn-ghost"
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
      {!displayFavorites || displayFavorites.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-base-content/60">
            {isOwnProfile
              ? "Add your favorite games to showcase them here!"
              : "No favorite games yet."}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayFavorites.map((f) => f.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-5 gap-2">
              {displayFavorites.map((favorite) => (
                <SortableFavorite
                  key={favorite.id}
                  favorite={favorite}
                  isEditMode={isEditMode}
                  onRemove={handleMarkForDeletion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {isEditMode && (
        <p className="text-xs text-base-content/60 mt-3 text-center">
          Drag and drop to reorder • Click X to remove
        </p>
      )}
    </div>
  );
};

export default FavoriteGamesWidget;
