import { Gamepad2, ChevronDown } from "lucide-react";
import { Game } from "@/Interface";
import GameCard from "@/components/content/GameCard";
import { useState } from "react";

interface GamesSectionProps {
  games: Game[];
  displayedGames: Game[];
  showAll: boolean;
  onLoadMore: () => void;
}

export const GamesSection = ({
  games,
  displayedGames,
  showAll,
  onLoadMore,
}: GamesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (games.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left mb-4 hover:text-primary transition-colors group"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Games
          <ChevronDown
            className={`w-5 h-5 ml-auto transition-transform duration-200 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`}
          />
        </h2>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayedGames.map((game: Game) => (
              <GameCard
                key={game.id}
                id={game.id.toString()}
                slug={game.slug}
                coverId={game.cover_id || ""}
                name={game.name}
              />
            ))}
          </div>
          {games.length > 12 && (
            <button
              onClick={onLoadMore}
              className="btn btn-neutral btn-sm mt-4"
            >
              {showAll ? "Show Less" : `Load More (${games.length - 12} more)`}
            </button>
          )}
        </>
      )}

      <hr className="mt-4 text-base-300" />
    </section>
  );
};
