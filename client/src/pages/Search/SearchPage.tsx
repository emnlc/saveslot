import { useSearch, useNavigate } from "@tanstack/react-router";
import { useFullSearch } from "@/hooks/SearchHooks/useSearch";
import { UserAuth } from "@/context/AuthContext";
import { useState } from "react";
import { User, List as ListIcon, FileText, Gamepad2 } from "lucide-react";
import { SearchHeader } from "./SearchHeader";
import { SearchSidebar } from "./SearchSidebar";
import { SearchResults } from "./SearchResults";

type SearchCategory = "all" | "games" | "users" | "lists" | "reviews";

const SearchPage = () => {
  const { q, category } = useSearch({ from: "/search/" });
  const navigate = useNavigate();
  const { profile } = UserAuth();
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>(
    (category as SearchCategory) || "all"
  );
  const [searchInput, setSearchInput] = useState(q || "");
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllLists, setShowAllLists] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data, isLoading } = useFullSearch(q, profile?.id);

  const allGames = [...(data?.local_games || []), ...(data?.igdb_games || [])];
  const displayedGames = showAllGames ? allGames : allGames.slice(0, 12);
  const displayedUsers = showAllUsers
    ? data?.users || []
    : (data?.users || []).slice(0, 12);
  const displayedLists = showAllLists
    ? data?.lists || []
    : (data?.lists || []).slice(0, 12);
  const displayedReviews = showAllReviews
    ? data?.reviews || []
    : (data?.reviews || []).slice(0, 6);

  const totalResults =
    allGames.length +
    (data?.users.length || 0) +
    (data?.lists.length || 0) +
    (data?.reviews.length || 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const query = searchInput.trim();
      setSearchInput("");
      navigate({ to: "/search", search: { q: query, category: undefined } });
    }
  };

  const getCategoryDisplay = () => {
    const categoryMap = {
      all: "All Results",
      games: "Games",
      users: "Users",
      lists: "Lists",
      reviews: "Reviews",
    };
    const count = {
      all: totalResults,
      games: allGames.length,
      users: data?.users.length || 0,
      lists: data?.lists.length || 0,
      reviews: data?.reviews.length || 0,
    }[selectedCategory];
    return `${categoryMap[selectedCategory]}${!isLoading && count > 0 ? ` (${count})` : ""}`;
  };

  const dropdownItems = [
    {
      label: `All Results${!isLoading && totalResults > 0 ? ` (${totalResults})` : ""}`,
      onClick: () => {
        setSelectedCategory("all");
        navigate({ to: "/search", search: { q, category: "all" } });
      },
      isSelected: selectedCategory === "all",
    },
    {
      label: `Games${!isLoading && allGames.length > 0 ? ` (${allGames.length})` : ""}`,
      onClick: () => {
        setSelectedCategory("games");
        navigate({ to: "/search", search: { q, category: "games" } });
      },
      isSelected: selectedCategory === "games",
      icon: Gamepad2,
    },
    {
      label: `Users${!isLoading && data?.users ? ` (${data.users.length})` : ""}`,
      onClick: () => {
        setSelectedCategory("users");
        navigate({ to: "/search", search: { q, category: "users" } });
      },
      isSelected: selectedCategory === "users",
      icon: User,
    },
    {
      label: `Lists${!isLoading && data?.lists ? ` (${data.lists.length})` : ""}`,
      onClick: () => {
        setSelectedCategory("lists");
        navigate({ to: "/search", search: { q, category: "lists" } });
      },
      isSelected: selectedCategory === "lists",
      icon: ListIcon,
    },
    {
      label: `Reviews${!isLoading && data?.reviews ? ` (${data.reviews.length})` : ""}`,
      onClick: () => {
        setSelectedCategory("reviews");
        navigate({ to: "/search", search: { q, category: "reviews" } });
      },
      isSelected: selectedCategory === "reviews",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <SearchHeader
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          getCategoryDisplay={getCategoryDisplay}
          dropdownItems={dropdownItems}
        />

        <div className="flex gap-8">
          <SearchSidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isLoading={isLoading}
            totalResults={totalResults}
            gamesCount={allGames.length}
            usersCount={data?.users.length || 0}
            listsCount={data?.lists.length || 0}
            reviewsCount={data?.reviews.length || 0}
          />

          <main className="flex-1 min-w-0">
            <SearchResults
              isLoading={isLoading}
              query={q}
              totalResults={totalResults}
              selectedCategory={selectedCategory}
              allGames={allGames}
              displayedGames={displayedGames}
              users={data?.users || []}
              displayedUsers={displayedUsers}
              lists={data?.lists || []}
              displayedLists={displayedLists}
              reviews={data?.reviews || []}
              displayedReviews={displayedReviews}
              showAllGames={showAllGames}
              showAllUsers={showAllUsers}
              showAllLists={showAllLists}
              showAllReviews={showAllReviews}
              setShowAllGames={setShowAllGames}
              setShowAllUsers={setShowAllUsers}
              setShowAllLists={setShowAllLists}
              setShowAllReviews={setShowAllReviews}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
