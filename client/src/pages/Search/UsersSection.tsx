import { Link } from "@tanstack/react-router";
import { ChevronDown, User } from "lucide-react";
import { Profile } from "@/Interface";
import { useState } from "react";

interface UsersSectionProps {
  users: Profile[];
  displayedUsers: Profile[];
  showAll: boolean;
  onLoadMore: () => void;
}

export const UsersSection = ({
  users,
  displayedUsers,
  showAll,
  onLoadMore,
}: UsersSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (users.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left mb-4 hover:text-primary transition-colors group"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" />
          Users
          <ChevronDown
            className={`w-5 h-5 ml-auto transition-transform duration-200 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`}
          />
        </h2>
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedUsers.map((user: Profile) => (
              <Link
                key={user.id}
                to="/u/$username"
                params={{ username: user.username }}
                className="flex items-center gap-4 p-4 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
              >
                <img
                  src={
                    user.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  alt={user.display_name || user.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold truncate">
                    {user.display_name || user.username}
                  </span>
                  {user.display_name && (
                    <span className="text-sm text-base-content/60 truncate">
                      @{user.username}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      {users.length > 12 && (
        <button onClick={onLoadMore} className="btn btn-neutral btn-sm mt-4">
          {showAll ? "Show Less" : `Load More (${users.length - 12} more)`}
        </button>
      )}

      <hr className="mt-4 text-base-300" />
    </section>
  );
};
