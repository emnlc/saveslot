// components/AddFavoriteModal.tsx
import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useFavoriteGames, useAddFavoriteGame } from "@/hooks/favorites";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  userId: string;
  onClose: () => void;
}

interface GameSearchResult {
  id: number;
  name: string;
  slug: string;
  cover_id: string | null;
  official_release_date?: string | null;
  release_date_human?: string | null;
}

const AddFavoriteModal = ({ userId, onClose }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: currentFavorites } = useFavoriteGames(userId);
  const addFavoriteMutation = useAddFavoriteGame();

  // Search games using /search/quick endpoint
  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(
          `${API_URL}/search/quick?q=${encodeURIComponent(debouncedSearch)}`
        );
        const data = await response.json();
        setSearchResults(data.games || []);
      } catch (error) {
        console.error("Error searching games:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchGames();
  }, [debouncedSearch]);

  const favoriteGameIds = new Set(
    currentFavorites?.map((f) => f.game_id) || []
  );
  const canAddMore = (currentFavorites?.length || 0) < 10;

  const handleAddFavorite = async (game: GameSearchResult) => {
    if (!canAddMore) return;

    // Find next available rank
    const usedRanks = new Set(currentFavorites?.map((f) => f.rank) || []);
    let nextRank = 1;
    while (usedRanks.has(nextRank) && nextRank <= 10) {
      nextRank++;
    }

    try {
      await addFavoriteMutation.mutateAsync({
        user_id: userId,
        game_id: game.id,
        rank: nextRank,
      });
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      alert("Failed to add favorite. Please try again.");
    }
  };

  // Helper to extract year from release date
  const getYear = (game: GameSearchResult): string => {
    if (game.official_release_date) {
      try {
        const date = new Date(game.official_release_date);
        return date.getFullYear().toString();
      } catch {
        // Fall through to next check
      }
    }

    if (game.release_date_human) {
      const match = game.release_date_human.match(/\d{4}/);
      if (match) return match[0];
    }

    return "TBA";
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl w-full max-h-[80vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 shrink-0">
          <div>
            <h2 className="text-lg font-bold">Add Favorite Games</h2>
            <p className="text-xs text-base-content/60">
              {currentFavorites?.length || 0} of 10 favorites
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60" />
            <input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10"
              disabled={!canAddMore}
              autoFocus
            />
          </div>
          {!canAddMore && (
            <p className="text-xs text-warning mt-2">
              You've reached the maximum of 10 favorites
            </p>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {searchQuery.length < 2 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-3 text-base-content/20" />
              <p className="text-sm text-base-content/60">
                Type at least 2 characters to search
              </p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-12">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((game) => {
                const isFavorite = favoriteGameIds.has(game.id);
                const year = getYear(game);

                return (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:border-primary transition-all"
                  >
                    {game.cover_id ? (
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover_id}.jpg`}
                        alt={game.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-base-300 rounded flex items-center justify-center">
                        <span className="text-xl font-bold text-base-content/20">
                          {game.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {game.name}
                        <span className="text-base-content/60 ml-2">
                          ({year})
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddFavorite(game)}
                      disabled={
                        isFavorite ||
                        !canAddMore ||
                        addFavoriteMutation.isPending
                      }
                      className={`btn btn-sm ${isFavorite ? "btn-ghost" : "btn-primary"}`}
                    >
                      {isFavorite ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-base-content/60">No games found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 shrink-0">
          <button onClick={onClose} className="btn btn-block">
            Done
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>
    </div>
  );
};

export default AddFavoriteModal;
