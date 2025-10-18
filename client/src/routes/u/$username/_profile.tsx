import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import ProfileHeader from "@/pages/UserPage/Sections/ProfileHeader";
import { useEffect } from "react";
import { useProfile } from "@/hooks/profiles";
import type { Profile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";

type ProfileOutletContext = {
  viewedProfile: Profile;
  isOwnProfile: boolean;
};

export const Route = createFileRoute("/u/$username/_profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = useParams({ from: "/u/$username/_profile" });
  const { profile: currentUser } = UserAuth();

  const {
    data: viewedProfile,
    isLoading,
    isError,
  } = useProfile(username, currentUser?.id);

  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  useEffect(() => {
    if (viewedProfile) {
      document.title = `${viewedProfile.display_name} @${viewedProfile.username}`;
    } else {
      document.title = "User Page";
    }
  }, [viewedProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !viewedProfile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">User not found</h1>
        <p className="text-muted-foreground">
          The profile for @{username} doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col container mx-auto md:max-w-5xl">
        <ProfileHeader profile={viewedProfile} isOwnProfile={isOwnProfile} />

        <div className="flex justify-center px-4 md:my-4">
          <div className="grid grid-cols-3 md:flex md:flex-row gap-2 w-full max-w-md md:max-w-none md:w-auto">
            <Link
              to="/u/$username"
              params={{ username }}
              activeProps={{ className: "btn-primary" }}
              inactiveProps={{ className: "btn-ghost" }}
              className="btn btn-sm md:btn-md"
              activeOptions={{ exact: true }}
            >
              Profile
            </Link>
            <Link
              to="/u/$username/games"
              params={{ username }}
              activeProps={{ className: "btn-primary" }}
              inactiveProps={{ className: "btn-ghost" }}
              className="btn btn-sm md:btn-md"
            >
              Games
            </Link>
            <Link
              to="/u/$username/lists"
              params={{ username }}
              activeProps={{ className: "btn-primary" }}
              inactiveProps={{ className: "btn-ghost" }}
              className="btn btn-sm md:btn-md"
            >
              Lists
            </Link>
            <Link
              to="/u/$username/reviews"
              params={{ username }}
              activeProps={{ className: "btn-primary" }}
              inactiveProps={{ className: "btn-ghost" }}
              className="btn btn-sm md:btn-md"
            >
              Reviews
            </Link>
            <Link
              to="/u/$username/activity"
              params={{ username }}
              activeProps={{ className: "btn-primary" }}
              inactiveProps={{ className: "btn-ghost" }}
              className="btn btn-sm md:btn-md"
            >
              Activity
            </Link>
            <Link
              to="/u/$username/likes"
              params={{ username }}
              activeProps={{ className: "btn-primary" }}
              inactiveProps={{ className: "btn-ghost" }}
              className="btn btn-sm md:btn-md"
            >
              Likes
            </Link>
          </div>
        </div>

        <Outlet />
      </div>
    </>
  );
}

export type { ProfileOutletContext };
