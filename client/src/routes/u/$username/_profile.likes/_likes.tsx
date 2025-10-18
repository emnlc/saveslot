import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
  useNavigate,
  useMatchRoute,
} from "@tanstack/react-router";
import Dropdown from "@/components/controls/Dropdown";
import { Heart, List, MessageSquare } from "lucide-react";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/u/$username/_profile/likes/_likes")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = useParams({
    from: "/u/$username/_profile/likes/_likes",
  });
  const { profile: currentUser } = UserAuth();

  const { data: viewedProfile } = useProfile(username, currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const isGamesActive = matchRoute({
    to: "/u/$username/likes/games",
    params: { username },
  });
  const isListsActive = matchRoute({
    to: "/u/$username/likes/lists",
    params: { username },
  });
  const isReviewsActive = matchRoute({
    to: "/u/$username/likes/reviews",
    params: { username },
  });

  const getActiveLabel = () => {
    if (isGamesActive) return "Games";
    if (isListsActive) return "Lists";
    if (isReviewsActive) return "Reviews";
    return "Select";
  };

  const dropdownItems = [
    {
      label: "Games",
      icon: Heart,
      isSelected: !!isGamesActive,
      onClick: () =>
        navigate({ to: "/u/$username/likes/games", params: { username } }),
    },
    {
      label: "Lists",
      icon: List,
      isSelected: !!isListsActive,
      onClick: () =>
        navigate({ to: "/u/$username/likes/lists", params: { username } }),
    },
    {
      label: "Reviews",
      icon: MessageSquare,
      isSelected: !!isReviewsActive,
      onClick: () =>
        navigate({ to: "/u/$username/likes/reviews", params: { username } }),
    },
  ];

  if (!viewedProfile) return null;

  return (
    <>
      <div className="p-6 my-12 flex flex-col gap-6">
        <div className="flex flex-row justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {isOwnProfile
              ? "Your Likes"
              : `${viewedProfile?.display_name}'s Likes`}
          </h2>

          {/* Mobile: Dropdown */}
          <div className="md:hidden">
            <Dropdown buttonText={getActiveLabel()} items={dropdownItems} />
          </div>

          {/* Desktop: Link buttons */}
          <div className="hidden md:flex gap-2">
            <Link
              to="/u/$username/likes/games"
              params={{ username }}
              className="btn btn-sm"
              activeProps={{
                className: "btn-secondary",
              }}
              inactiveProps={{
                className: "btn-ghost hover:btn-secondary",
              }}
            >
              Games
            </Link>
            <Link
              to="/u/$username/likes/lists"
              params={{ username }}
              className="btn btn-sm"
              activeProps={{
                className: "btn-secondary",
              }}
              inactiveProps={{
                className: "btn-ghost hover:btn-secondary",
              }}
            >
              Lists
            </Link>
            <Link
              to="/u/$username/likes/reviews"
              params={{ username }}
              className="btn btn-sm"
              activeProps={{
                className: "btn-secondary",
              }}
              inactiveProps={{
                className: "btn-ghost hover:btn-secondary",
              }}
            >
              Reviews
            </Link>
          </div>
        </div>

        <Outlet />
      </div>
    </>
  );
}
