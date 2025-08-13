import React, { useState, useEffect } from "react";
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
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import SortableGameItem, { GameListItem } from "@/components/SortableGameItem";

interface DraggableGameListProps {
  games: GameListItem[];
  editMode: boolean;
  gamesToRemove: Set<string>;
  onToggleRemoval: (gameId: string) => void;
  onReorder: (reorderedGames: GameListItem[]) => void;
}

const DraggableGameList: React.FC<DraggableGameListProps> = ({
  games,
  editMode,
  gamesToRemove,
  onToggleRemoval,
  onReorder,
}) => {
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
    if (!over || active.id === over.id) return;

    const oldIndex = localGames.findIndex((item) => item.id === active.id);
    const newIndex = localGames.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(localGames, oldIndex, newIndex);
      setLocalGames(newOrder);
      onReorder(newOrder);
    }
  };

  const visibleGames = localGames.filter(
    ({ games }) => !gamesToRemove.has(games.id)
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {visibleGames.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={editMode ? [restrictToParentElement] : []}
        >
          <SortableContext
            items={visibleGames.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            {visibleGames.map((gameItem, index) => (
              <SortableGameItem
                key={gameItem.id}
                gameItem={gameItem}
                editMode={editMode}
                gamesToRemove={gamesToRemove}
                onToggleRemoval={onToggleRemoval}
                index={index}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-gray-500">
            No games in this list
          </h3>
          <p className="text-gray-400 mt-2">Add some games to get started!</p>
        </div>
      )}
    </div>
  );
};

export default DraggableGameList;
