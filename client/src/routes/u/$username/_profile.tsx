import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import ProfileHeader from "@/pages/UserPage/Sections/ProfileHeader";

import { useEffect } from "react";
import { UseProfileContext } from "@/context/ViewedProfileContext";

export const Route = createFileRoute("/u/$username/_profile")({
  component: () => <RouteComponent />,
});

function RouteComponent() {
  const { viewedProfile, setViewedProfile, notFound, isOwnProfile, username } =
    UseProfileContext();

  useEffect(() => {
    if (viewedProfile) {
      document.title = `${viewedProfile.display_name} @${viewedProfile.username}`;
    } else {
      document.title = "User Page";
    }
  }, [viewedProfile]);

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">User not found</h1>
        <p className="text-muted-foreground">
          The profile for @{username} doesn&apos;t exist.
        </p>
      </div>
    );
  }

  if (!viewedProfile) return <></>;

  return (
    <>
      <div className="flex flex-col container mx-auto md:max-w-5xl ">
        {/* Profile Header */}
        <ProfileHeader
          profile={viewedProfile}
          isOwnProfile={isOwnProfile}
          setViewedProfile={setViewedProfile}
        />

        {/* sections */}
        <div className="flex flex-wrap flex-row justify-center text-sm">
          <ul className="flex flex-row gap-8 border-base-200 border-2 px-4 md:px-16 py-2 rounded-lg overflow-x-auto mx-8">
            <li>
              <Link
                to="/u/$username"
                params={{ username }}
                activeProps={{ className: "text-primary" }}
                className="text-base-content hover:text-primary transition-all"
                activeOptions={{ exact: true }}
              >
                Profile
              </Link>
            </li>

            <li>
              <Link
                to="/u/$username/games"
                params={{ username }}
                activeProps={{ className: "text-primary" }}
                className="text-base-content hover:text-primary transition-all"
              >
                Games
              </Link>
            </li>

            <li>
              <Link
                to="/u/$username/lists"
                params={{ username }}
                activeProps={{ className: "text-primary" }}
                className="text-base-content hover:text-primary transition-all"
              >
                Lists
              </Link>
            </li>
            <li>
              <Link
                to="/u/$username/reviews"
                params={{ username }}
                activeProps={{ className: "text-primary" }}
                className="text-base-content hover:text-primary transition-all"
              >
                Reviews
              </Link>
            </li>
            <li>Activity</li>
            <li>
              <Link
                to="/u/$username/likes"
                params={{ username }}
                activeProps={{ className: "text-primary" }}
                className="text-base-content hover:text-primary transition-all"
              >
                Likes
              </Link>
            </li>
          </ul>
        </div>

        <Outlet />
      </div>
    </>
  );
}
