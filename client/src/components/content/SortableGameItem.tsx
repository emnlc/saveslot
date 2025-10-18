import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { GameListItem } from "@/types/lists";

interface SortableGameItemProps {
  gameItem: GameListItem;
  editMode: boolean;
  gamesToRemove: Set<number>;
  onToggleRemoval: (gameId: number) => void;
  index: number;
}

const SortableGameItem = ({
  gameItem,
  editMode,
  gamesToRemove,
  onToggleRemoval,
  index,
}: SortableGameItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: gameItem.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isMarkedForRemoval = gamesToRemove.has(gameItem.games.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        isMarkedForRemoval ? "opacity-50" : ""
      } ${editMode ? "cursor-move" : ""}`}
    >
      {editMode && (
        <>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-1 left-1 z-10 p-1 bg-base-300/80 rounded cursor-move hover:bg-base-300"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onToggleRemoval(gameItem.games.id)}
            className={`absolute top-1 right-1 z-10 p-1 rounded ${
              isMarkedForRemoval
                ? "bg-success/80 hover:bg-success"
                : "bg-error/80 hover:bg-error"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Rank Badge */}
      <div className="absolute bottom-1 left-1 z-10 bg-base-300/90 text-xs px-2 py-1 rounded">
        #{index + 1}
      </div>

      <Link
        to="/games/$gamesSlug"
        params={{ gamesSlug: gameItem.games.slug }}
        className="block"
      >
        {gameItem.games.cover_id ? (
          <img
            src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${gameItem.games.cover_id}.jpg`}
            alt={gameItem.games.name}
            className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-base-300 rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-500">No Image</span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default SortableGameItem;
