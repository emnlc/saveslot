import { User, List as ListIcon, FileText, Gamepad2 } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";

type SearchCategory = "all" | "games" | "users" | "lists" | "reviews";

interface SearchSidebarProps {
  selectedCategory: SearchCategory;
  setSelectedCategory: (category: SearchCategory) => void;
  isLoading: boolean;
  totalResults: number;
  gamesCount: number;
  usersCount: number;
  listsCount: number;
  reviewsCount: number;
}

export const SearchSidebar = ({
  selectedCategory,
  setSelectedCategory,
  isLoading,
  totalResults,
  gamesCount,
  usersCount,
  listsCount,
  reviewsCount,
}: SearchSidebarProps) => {
  const navigate = useNavigate();
  const { q } = useSearch({ from: "/search/" });

  const handleCategoryClick = (category: SearchCategory) => {
    setSelectedCategory(category);
    navigate({ to: "/search", search: { q, category } });
  };

  const categories = [
    {
      id: "all" as const,
      label: "All Results",
      count: totalResults,
      icon: null,
    },
    {
      id: "games" as const,
      label: "Games",
      count: gamesCount,
      icon: Gamepad2,
    },
    {
      id: "users" as const,
      label: "Users",
      count: usersCount,
      icon: User,
    },
    {
      id: "lists" as const,
      label: "Lists",
      count: listsCount,
      icon: ListIcon,
    },
    {
      id: "reviews" as const,
      label: "Reviews",
      count: reviewsCount,
      icon: FileText,
    },
  ];

  return (
    <aside className="hidden md:block w-48 flex-shrink-0">
      <nav className="sticky top-24 space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`btn btn-sm w-full justify-start ${
                Icon ? "gap-2" : ""
              } ${isSelected ? "btn-primary" : "btn-ghost"}`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="flex-1 text-left">{category.label}</span>
              {!isLoading && category.count > 0 && (
                <span className="text-xs opacity-70">({category.count})</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
