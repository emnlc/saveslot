import { Link } from "@tanstack/react-router";
import { ChevronDown, List as ListIcon } from "lucide-react";
import { GameListWithGames } from "@/Interface";
import { useState } from "react";

interface ListsSectionProps {
  lists: GameListWithGames[];
  displayedLists: GameListWithGames[];
  showAll: boolean;
  onLoadMore: () => void;
}

export const ListsSection = ({
  lists,
  displayedLists,
  showAll,
  onLoadMore,
}: ListsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (lists.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left mb-4 hover:text-primary transition-colors group"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ListIcon className="w-5 h-5" />
          User Lists
          <ChevronDown
            className={`w-5 h-5 ml-auto transition-transform duration-200 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`}
          />
        </h2>
      </button>
      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedLists.map((list: GameListWithGames) => (
              <Link
                key={list.id}
                to="/u/$username/list/$listslug"
                params={{
                  username: list.profile.username,
                  listslug: list.slug,
                }}
                className="p-4 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
              >
                <h3 className="font-semibold mb-2 line-clamp-1">{list.name}</h3>
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <img
                    src={
                      list.profile.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${list.profile.username}`
                    }
                    alt={list.profile.username}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>@{list.profile.username}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {lists.length > 12 && (
        <button onClick={onLoadMore} className="btn btn-neutral btn-sm mt-4">
          {showAll ? "Show Less" : `Load More (${lists.length - 12} more)`}
        </button>
      )}

      <hr className="mt-4 text-base-300" />
    </section>
  );
};
