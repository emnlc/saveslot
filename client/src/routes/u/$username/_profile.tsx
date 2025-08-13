import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import ProfileHeader from "@/pages/UserPage/Sections/ProfileHeader";
import EditModal from "@/pages/UserPage/EditModal";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { UseProfileContext } from "@/context/ViewedProfileContext";

export const Route = createFileRoute("/u/$username/_profile")({
  component: () => <RouteComponent />,
});

function RouteComponent() {
  const { profile } = UserAuth();
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const { viewedProfile, setViewedProfile, notFound, isOwnProfile, username } =
    UseProfileContext();

  useEffect(() => {
    document.body.style.overflow = isEditModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEditModalOpen]);

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
          setEditModalOpen={setEditModalOpen}
        />

        {/* sections */}
        <div className="flex flex-wrap flex-row justify-center">
          <ul className="flex flex-row gap-8 border-base-200 border-2 md:px-16 py-2 rounded-lg">
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
                to="/u/$username/lists"
                params={{ username }}
                activeProps={{ className: "text-primary" }}
                className="text-base-content hover:text-primary transition-all"
              >
                Lists
              </Link>
            </li>
            <li>Reviews</li>
            <li>Activity</li>
            <li>Likes</li>
          </ul>
        </div>

        {/* Simple Outlet without context */}
        <Outlet />
      </div>

      {profile && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
}
