// components/SearchDropdown.tsx
import { Link } from "@tanstack/react-router";
import { useQuickSearch } from "@/hooks/SearchHooks/useSearch";
import { Game } from "@/Interface";
import { Search } from "lucide-react";

interface SearchDropdownProps {
  query: string;
  userId?: string;
  onClose: () => void;
}

const SearchDropdown = ({ query, userId, onClose }: SearchDropdownProps) => {
  const { data, isLoading } = useQuickSearch(query, userId);

  const hasGames = data && data.games.length > 0;

  return (
    <div className="w-full md:absolute md:top-full md:mt-2 md:w-80 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-[400px] overflow-y-auto md:z-50">
      {isLoading && (
        <div className="p-3 text-center text-xs text-base-content/60">
          Searching...
        </div>
      )}

      {!isLoading && !hasGames && (
        <div className="p-3 text-center text-xs text-base-content/60">
          No games found
        </div>
      )}

      {!isLoading && hasGames && (
        <>
          {/* Games */}
          <div className="">
            {data.games.map((game: Game) => (
              <Link
                key={game.id}
                to="/games/$gamesSlug"
                params={{ gamesSlug: game.slug }}
                onClick={onClose}
                className="flex items-center gap-2 p-1.5 hover:bg-base-200 rounded transition-colors"
              >
                {game.cover_id ? (
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover_id}.jpg`}
                    alt={game.name}
                    className="w-8 h-11 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-11 bg-base-300 rounded flex items-center justify-center">
                    <Search className="w-3 h-3 text-base-content/30" />
                  </div>
                )}
                <span className="text-xs font-medium truncate">
                  {game.name}
                </span>
              </Link>
            ))}
          </div>

          {/* View All Results Link */}
          <Link
            to="/search"
            search={{ q: query, category: undefined }}
            onClick={onClose}
            className="block p-2 text-center text-xs font-medium text-primary hover:bg-base-200 border-t border-base-300"
          >
            View all results
          </Link>
        </>
      )}
    </div>
  );
};

export default SearchDropdown;
