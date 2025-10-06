import { GamesSection } from "./GamesSection";
import { UsersSection } from "./UsersSection";
import { ListsSection } from "./ListsSection";
import { ReviewsSection } from "./ReviewsSection";
import {
  Game,
  Profile,
  GameListWithGames,
  GameLogWithProfile,
} from "@/Interface";

type SearchCategory = "all" | "games" | "users" | "lists" | "reviews";

interface SearchResultsProps {
  isLoading: boolean;
  query: string;
  totalResults: number;
  selectedCategory: SearchCategory;
  allGames: Game[];
  displayedGames: Game[];
  users: Profile[];
  displayedUsers: Profile[];
  lists: GameListWithGames[];
  displayedLists: GameListWithGames[];
  reviews: GameLogWithProfile[];
  displayedReviews: GameLogWithProfile[];
  showAllGames: boolean;
  showAllUsers: boolean;
  showAllLists: boolean;
  showAllReviews: boolean;
  setShowAllGames: (show: boolean) => void;
  setShowAllUsers: (show: boolean) => void;
  setShowAllLists: (show: boolean) => void;
  setShowAllReviews: (show: boolean) => void;
}

export const SearchResults = ({
  isLoading,
  query,
  totalResults,
  selectedCategory,
  allGames,
  displayedGames,
  users,
  displayedUsers,
  lists,
  displayedLists,
  reviews,
  displayedReviews,
  showAllGames,
  showAllUsers,
  showAllLists,
  showAllReviews,
  setShowAllGames,
  setShowAllUsers,
  setShowAllLists,
  setShowAllReviews,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-sm text-base-content/60">Searching...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-12 text-base-content/60">
        Enter a search query to see results
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="text-center md:text-left text-base-content/60">
        No results found for "{query}"
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(selectedCategory === "all" || selectedCategory === "games") && (
        <GamesSection
          games={allGames}
          displayedGames={displayedGames}
          showAll={showAllGames}
          onLoadMore={() => setShowAllGames(!showAllGames)}
        />
      )}

      {(selectedCategory === "all" || selectedCategory === "users") && (
        <UsersSection
          users={users}
          displayedUsers={displayedUsers}
          showAll={showAllUsers}
          onLoadMore={() => setShowAllUsers(!showAllUsers)}
        />
      )}

      {(selectedCategory === "all" || selectedCategory === "lists") && (
        <ListsSection
          lists={lists}
          displayedLists={displayedLists}
          showAll={showAllLists}
          onLoadMore={() => setShowAllLists(!showAllLists)}
        />
      )}

      {(selectedCategory === "all" || selectedCategory === "reviews") && (
        <ReviewsSection
          reviews={reviews}
          displayedReviews={displayedReviews}
          showAll={showAllReviews}
          onLoadMore={() => setShowAllReviews(!showAllReviews)}
        />
      )}
    </div>
  );
};
