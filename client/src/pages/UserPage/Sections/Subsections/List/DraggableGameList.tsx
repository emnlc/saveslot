import React, { useState, useEffect } from "react";
import SortableGameGrid, {
  SortableGameData,
} from "@/components/controls/SortableGameGrid";
import type { GameListItem } from "@/types/lists";

interface DraggableGameListProps {
  games: GameListItem[];
  editMode: boolean;
  gamesToRemove: Set<number>;
  onToggleRemoval: (gameId: number) => void;
  onReorder: (reorderedGames: GameListItem[]) => void;
}

const DraggableGameList: React.FC<DraggableGameListProps> = ({
  games,
  editMode,
  gamesToRemove,
  onToggleRemoval,
  onReorder,
}) => {
  const [sortableGames, setSortableGames] = useState<SortableGameData[]>([]);

  useEffect(() => {
    const visibleGames = games.filter(
      (item) => !gamesToRemove.has(item.games.id)
    );

    const transformed = visibleGames.map((item, index) => ({
      id: item.id,
      gameId: item.games.id,
      slug: item.games.slug,
      name: item.games.name,
      coverId: item.games.cover_id,
      rank: index + 1,
    }));

    setSortableGames(transformed);
  }, [games, gamesToRemove]);

  const handleReorder = (reorderedGames: SortableGameData[]) => {
    const reorderedOriginal = reorderedGames.map((sortableGame) => {
      const originalItem = games.find((g) => g.id === sortableGame.id);
      return originalItem!;
    });

    onReorder(reorderedOriginal);
  };

  const handleRemove = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (game) {
      onToggleRemoval(game.games.id);
    }
  };

  return (
    <SortableGameGrid
      games={sortableGames}
      isEditMode={editMode}
      showRank={true}
      columns="grid-cols-2 md:grid-cols-6"
      emptyMessage="No games in this list"
      emptySubMessage="Add some games to get started!"
      onReorder={handleReorder}
      onRemove={handleRemove}
    />
  );
};

export default DraggableGameList;
