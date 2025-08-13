import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import GameCard from "@/components/GameCard";

interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

export interface GameListItem {
  id: string;
  rank: number;
  games: Game;
}

interface SortableGameItemProps {
  gameItem: GameListItem;
  editMode: boolean;
  gamesToRemove: Set<string>;
  onToggleRemoval: (gameId: string) => void;
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
  } = useSortable({ id: gameItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col items-center gap-2 relative transition-all duration-200 ${
        isDragging ? "z-50" : ""
      }`}
    >
      {editMode && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing px-3 py-2 bg-primary/25 rounded-lg hover:bg-primary/50 transition-colors"
            aria-label="Drag to reorder"
          >
            <GripHorizontal className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}

      <div
        className={`flex overflow-hidden relative group transition-all ${
          editMode ? "cursor-pointer hover:border-error" : ""
        }`}
        onClick={
          editMode ? () => onToggleRemoval(gameItem.games.id) : undefined
        }
      >
        <GameCard
          id={parseInt(gameItem.games.id)}
          name={gameItem.games.name}
          slug={gameItem.games.slug}
          coverId={gameItem.games.cover_id || ""}
          editMode={editMode}
          onRemoveClick={
            editMode ? () => onToggleRemoval(gameItem.games.id) : undefined
          }
          isMarkedForRemoval={gamesToRemove.has(gameItem.games.id)}
        />
      </div>

      {editMode && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-primary text-primary-content text-xs px-2 py-1 rounded-full">
            #{index + 1}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableGameItem;
