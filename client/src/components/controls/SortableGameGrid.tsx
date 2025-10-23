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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import GameCard from "@/components/content/GameCard";

export interface SortableGameData {
  id: string;
  gameId: number;
  slug: string;
  name: string;
  coverId: string | null;
  rank?: number;
  releaseDate?: string;
}

interface SortableGameCardProps {
  game: SortableGameData;
  isEditMode: boolean;
  showRank: boolean;
  showName: boolean;
  index: number;
  onRemove: (id: string) => void;
}

const SortableGameCard = ({
  game,
  isEditMode,
  showRank,
  showName,
  index,
  onRemove,
}: SortableGameCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayRank = game.rank ?? index + 1;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="relative">
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
                onRemove(game.id);
              }}
              className="absolute bottom-1 right-1 z-10 bg-error/90 text-error-content p-1 rounded hover:bg-error transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="flex">
          <GameCard
            id={game.gameId.toString()}
            slug={game.slug}
            coverId={game.coverId || ""}
            name={showName ? game.name : undefined}
            release_date_human={game.releaseDate}
          />
        </div>
      </div>

      {showRank && (
        <div className="text-center">
          <span className="text-xs md:text-sm font-medium text-base-content">
            {displayRank}
          </span>
        </div>
      )}
    </div>
  );
};

interface SortableGameGridProps {
  games: SortableGameData[];
  isEditMode: boolean;
  showRank?: boolean;
  showName?: boolean;
  columns?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  onReorder: (reorderedGames: SortableGameData[]) => void;
  onRemove: (id: string) => void;
}

const SortableGameGrid = ({
  games,
  isEditMode,
  showRank = true,
  showName = true,
  columns = "grid-cols-5",
  emptyMessage = "No games yet",
  emptySubMessage,
  onReorder,
  onRemove,
}: SortableGameGridProps) => {
  const [localGames, setLocalGames] = useState(games);

  useEffect(() => {
    setLocalGames(games);
  }, [games]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalGames((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        const withUpdatedRanks = reordered.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

        onReorder(withUpdatedRanks);
        return withUpdatedRanks;
      });
    }
  };

  if (localGames.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-base-content/60">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-xs text-base-content/40 mt-1">{emptySubMessage}</p>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localGames.map((g) => g.id)}
        strategy={rectSortingStrategy}
      >
        <div className={`grid ${columns} gap-2`}>
          {localGames.map((game, index) => (
            <SortableGameCard
              key={game.id}
              game={game}
              isEditMode={isEditMode}
              showRank={showRank}
              showName={showName}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableGameGrid;
