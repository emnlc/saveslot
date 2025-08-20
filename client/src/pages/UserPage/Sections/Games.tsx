import { useUserGames } from "@/hooks/GameStatusHooks/useGamesQuery";
import { useState, useEffect } from "react";
import { UseProfileContext } from "@/context/ViewedProfileContext";
import GameCard from "@/components/GameCard";
import { Link } from "@tanstack/react-router";
import Dropdown from "@/components/controls/Dropdown";

const statusFilters = [
  { key: "playing", label: "Playing" },
  { key: "played", label: "Played" },
  { key: "backlog", label: "Backlog" },
  { key: "wishlist", label: "Wishlist" },
  { key: "dropped", label: "Dropped" },
];

interface GamesProps {
  search: { filter?: string };
  navigate: (options: {
    search: { filter: string };
    replace?: boolean;
  }) => void;
}

const Games = ({ search, navigate }: GamesProps) => {
  const { viewedProfile, isOwnProfile } = UseProfileContext();

  const [filter, setFilter] = useState<string>(search.filter || "playing");

  const updateFilter = (newFilter: string) => {
    setFilter(newFilter);
    navigate({
      search: { filter: newFilter },
      replace: true,
    });
  };

  useEffect(() => {
    if (search.filter && search.filter !== filter) {
      setFilter(search.filter);
    }
  }, [filter, search.filter]);

  const {
    data: games,
    isLoading,
    error,
    isError,
  } = useUserGames(viewedProfile?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500">Error loading games: {error?.message}</p>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No games yet</h3>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? "Add some games to your library to get started!"
            : `${viewedProfile?.display_name} hasn't added any games yet.`}
        </p>
        {isOwnProfile && (
          <Link className="mt-2 btn btn-primary btn-sm md:btn-md" to="/games">
            Discover Games
          </Link>
        )}
      </div>
    );
  }

  const filteredGames = games.filter((ug) => ug.status === filter);

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-row justify-between gap-4 items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isOwnProfile
            ? "Your Games"
            : `${viewedProfile?.display_name}'s Games`}
        </h2>

        {/* Desktop buttons */}
        <div className="hidden md:flex flex-wrap md:gap-2">
          {statusFilters.map((s) => (
            <button
              key={s.key}
              onClick={() => updateFilter(s.key)}
              className={`btn btn-sm md:btn-md ${
                filter === s.key
                  ? "btn-secondary"
                  : "btn-ghost hover:btn-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden">
          <Dropdown
            buttonText={
              statusFilters.find((s) => s.key === filter)?.label || "Filter"
            }
            items={statusFilters.map((s) => ({
              label: s.label,
              onClick: () => updateFilter(s.key),
              isSelected: s.key === filter,
            }))}
            buttonClass="btn btn-secondary btn-sm md:btn-md w-full"
          />
        </div>
      </div>

      {/* Games display */}
      {filteredGames.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No games in {filter} yet.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {filteredGames.map((userGame) => (
            <GameCard
              key={userGame.id}
              name={userGame.game.name}
              id={userGame.game.id}
              slug={userGame.game.slug}
              coverId={userGame.game.cover_id!}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;
