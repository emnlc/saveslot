import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import FavoriteSection from "./FavoriteSection";
import EditModal from "./EditModal";

import { UserAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase";
import type { Profile } from "@/Interface";
import FollowButton from "@/components/FollowButton";

const UserPage = () => {
  const { username } = useParams({ from: "/u/$username/" });
  const { profile, getFollowStats } = UserAuth();

  const AVATAR_PLACEHOLDER = `https://ui-avatars.com/api/?name=${username}&background=FE9FA1&color=fff`;

  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isEditModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEditModalOpen]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setNotFound(false);

      if (!username) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", username)
        .single();

      if (error || !data) {
        setNotFound(true);
        setViewedProfile(null);
        return;
      }

      const followStats = await getFollowStats(data.id);
      setViewedProfile({ ...data, ...followStats });
    };

    fetchProfileData();
  }, [getFollowStats, profile, username]);

  useEffect(() => {
    if (viewedProfile) {
      document.title = `${viewedProfile.display_name} @${viewedProfile.username}`;
    } else {
      document.title = "User Page";
    }
  }, [viewedProfile]);

  if (notFound)
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">User not found</h1>
        <p className="text-muted-foreground">
          The profile for @{username} doesn&apos;t exist.
        </p>
      </div>
    );

  if (!viewedProfile) return null;

  const isOwnProfile = profile?.id === viewedProfile.id;

  return (
    <>
      <div className="flex flex-col container mx-auto md:max-w-5xl ">
        <div
          className="w-full max-w-6xl -z-10 mx-auto aspect-[3/1] bg-cover bg-center bg-no-repeat relative "
          style={
            viewedProfile.banner_url
              ? {
                  backgroundImage: `url(${viewedProfile.banner_url})`,
                }
              : {
                  backgroundColor: "#333333",
                }
          }
        >
          {/* base overlay */}
          <div className="absolute inset-0 [data-theme=saveslot]:bg-gradient-to-b [data-theme=saveslot]:from-base-100/10 [data-theme=saveslot]:via-base-100/20 [data-theme=saveslot]:to-base-100/30" />

          {/* bottom gradient */}
          <div className="absolute bottom-0 left-0 w-full h-6 md:h-20 bg-gradient-to-b from-transparent to-base-100" />
          {/* left gradient */}
          <div className="hidden sm:block absolute top-0 left-0 h-full sm:w-12 md:w-20 sm:bg-gradient-to-r sm:from-base-100 sm:to-transparent" />
          {/* right gradient */}
          <div className="hidden sm:block absolute top-0 right-0 h-full sm:w-12 md:w-20 sm:bg-gradient-to-l sm:from-base-100 sm:to-transparent" />
        </div>
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 mb-8 w-full px-4 md:px-0 relative -mt-12 md:-mt-16">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={viewedProfile.avatar_url || AVATAR_PLACEHOLDER}
              alt="Avatar"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-base-100 "
            />
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col md:justify-center gap-1 md:mt-16 w-full">
            <div className="flex flex-row justify-between items-center w-full ">
              <h1 className="text-2xl font-semibold">
                {viewedProfile.display_name || viewedProfile.username}
              </h1>

              {isOwnProfile ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="btn btn-sm bg-primary text-white -mt-24 md:mt-0"
                >
                  Edit
                </button>
              ) : (
                <FollowButton
                  userId={viewedProfile.id}
                  onFollowChange={async () => {
                    // Refresh the viewed profile's follower stats when follow status changes
                    const followStats = await getFollowStats(viewedProfile.id);
                    setViewedProfile((prev) =>
                      prev ? { ...prev, ...followStats } : null
                    );
                  }}
                />
              )}
            </div>

            <h2 className="text-md text-muted-foreground">
              @{viewedProfile.username}
            </h2>

            <div className="mt-2">
              <p>
                {viewedProfile.bio ? (
                  viewedProfile.bio
                ) : (
                  <span className="italic text-sm">No bio</span>
                )}
              </p>
            </div>

            {/* Follower Stats */}
            <div className="mt-2 flex flex-row gap-4 text-sm text-base-content font-medium">
              <span className="hover:underline underline-offset-2">
                {viewedProfile.followers}{" "}
                <span className="text-base-content/80 font-normal">
                  Followers
                </span>{" "}
              </span>
              <span className="hover:underline underline-offset-2">
                {viewedProfile.following}{" "}
                <span className="text-base-content/80 font-normal">
                  Following
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Favorite Games */}
        <section className="flex items-center justify-center">
          <FavoriteSection userId={viewedProfile.id} />
        </section>

        {/* Recent Reviews */}

        {/* Game List */}
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
};

export default UserPage;
