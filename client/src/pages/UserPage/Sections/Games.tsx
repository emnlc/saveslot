import { useUserGames, useGamesByStatus } from "@/hooks/userGames";
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import GameCard from "@/components/content/GameCard";
import { Link, useParams } from "@tanstack/react-router";
import Dropdown from "@/components/controls/Dropdown";
import type { GameStatus } from "@/types/userGames";

const statusFilters: Array<{ key: GameStatus; label: string }> = [
  { key: "playing", label: "Playing" },
  { key: "played", label: "Played" },
  { key: "completed", label: "Completed" },
  { key: "backlog", label: "Backlog" },
  { key: "wishlist", label: "Wishlist" },
  { key: "dropped", label: "Dropped" },
  { key: "abandoned", label: "Abandoned" },
];

interface GamesProps {
  search: { filter?: string };
  navigate: (options: {
    search: { filter: string };
    replace?: boolean;
  }) => void;
}

const Games = ({ search, navigate }: GamesProps) => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const [filter, setFilter] = useState<GameStatus>(
    (search.filter as GameStatus) || "playing"
  );

  const updateFilter = (newFilter: GameStatus) => {
    setFilter(newFilter);
    navigate({
      search: { filter: newFilter },
      replace: true,
    });
  };

  useEffect(() => {
    if (search.filter && search.filter !== filter) {
      setFilter(search.filter as GameStatus);
    }
  }, [filter, search.filter]);

  const {
    data: allGames,
    isLoading: allGamesLoading,
    error: allGamesError,
    isError: allGamesIsError,
  } = useUserGames(viewedProfile?.id || "");

  const {
    data: filteredGames,
    isLoading: filteredLoading,
    error: filteredError,
    isError: filteredIsError,
  } = useGamesByStatus(viewedProfile?.id || "", filter);

  const isLoading = allGamesLoading || filteredLoading;
  const isError = allGamesIsError || filteredIsError;
  const error = allGamesError || filteredError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading games...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500">
        Error loading games:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  if (!allGames || allGames.length === 0) {
    return (
      <>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isOwnProfile
                ? "Your Games"
                : `${currentUser?.display_name || currentUser?.username}'s Games`}
            </h2>
          </div>
          <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
            <h3 className="text-lg font-semibold mb-2">No games yet</h3>
            <p className="text-base-content/60">
              {isOwnProfile
                ? "Add some games to your library to get started!"
                : `${viewedProfile?.display_name} hasn't added any games yet.`}
            </p>
            {isOwnProfile && (
              <Link className="mt-4 btn btn-secondary btn-sm " to="/games">
                Discover Games
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between gap-4 items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isOwnProfile
            ? "Your Games"
            : `${viewedProfile?.display_name}'s Games`}
        </h2>
        <div className="hidden md:flex flex-wrap md:gap-2">
          {statusFilters.map((s) => (
            <button
              key={s.key}
              onClick={() => updateFilter(s.key)}
              className={`btn btn-sm ${
                filter === s.key
                  ? "btn-secondary"
                  : "btn-ghost hover:btn-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
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
          />
        </div>
      </div>

      {!filteredGames || filteredGames.length === 0 ? (
        <p className="text-center text-base-content/60 py-12">
          No games in {filter} yet.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {filteredGames.map((userGame) => (
            <GameCard
              key={userGame.id}
              name={userGame.game.name}
              id={userGame.game.id.toString()}
              slug={userGame.game.slug}
              coverId={userGame.game.cover_id || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;
