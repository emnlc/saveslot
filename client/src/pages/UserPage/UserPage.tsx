import { useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Profile } from "@/Interface";

import FavoriteSection from "./FavoriteSection";

import {
  fetchProfile as fetchProfileHelper,
  handleSignOut,
  getFollowerCount,
  getFollowingCount,
  followUser,
  unfollowUser,
} from "@/utils/authHelpers";
import { supabase } from "@/services/supabase";
import EditModal from "./EditModal";

const UserPage = () => {
  const { username } = useParams({ from: "/u/$username/" });
  const navigate = useNavigate();
  const AVATAR_PLACEHOLDER = `https://ui-avatars.com/api/?name=${username}&background=random`;

  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () =>
    fetchProfileHelper(username, setError, setProfile);

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isEditModalOpen]);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      await fetchProfile();

      if (!profile || !user?.id) return;

      const { data: existingFollow } = await supabase
        .from("follows")
        .select("*")
        .match({ follower_id: user.id, following_id: profile.id })
        .maybeSingle();

      setIsFollowing(!!existingFollow);

      const followerCount = await getFollowerCount(profile);
      setFollowerCount(followerCount ?? 0);

      const followingCount = await getFollowingCount(profile);
      setFollowingCount(followingCount ?? 0);
    };

    loadData();
  });

  if (error) return <div>{error}</div>;
  if (!profile || followerCount === null || followingCount === null)
    return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-col container md:mx-auto px-4 my-16 max-w-5xl ">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 ">
          {/* Avatar */}
          <div className="flex-shrink-0 ">
            <img
              src={profile.avatar_url || AVATAR_PLACEHOLDER}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-2 border-primary"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col justify-center items-start gap-1 ">
            <div className="flex flex-row justify-between items-center w-full">
              <h1 className="text-2xl font-semibold">
                {profile.display_name ? profile.display_name : profile.username}
              </h1>
              {currentUserId === profile.id && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="btn btn-sm bg-primary text-white"
                >
                  Edit
                </button>
              )}

              {currentUserId && currentUserId !== profile.id && (
                <button
                  onClick={async () => {
                    if (isFollowing) {
                      await unfollowUser(currentUserId, profile.id);
                      setIsFollowing(false);
                      setFollowerCount((prev) => (prev ?? 1) - 1);
                    } else {
                      await followUser(currentUserId, profile.id);
                      setIsFollowing(true);
                      setFollowerCount((prev) => (prev ?? 0) + 1);
                    }
                  }}
                  className={`btn btn-sm   ${
                    isFollowing ? "btn-secondary" : "btn-primary"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
            <h2 className="text-md text-muted-foreground">
              @{profile.username}
            </h2>

            {/* Follower Stats */}
            <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
              <span>
                <strong>{followingCount}</strong> Following
              </span>
              <span>
                <strong>{followerCount}</strong> Followers
              </span>
            </div>

            <div className="mt-2">
              <p>
                {profile.bio ? (
                  profile.bio
                ) : (
                  <span className="italic text-sm">No bio</span>
                )}
              </p>
            </div>

            {currentUserId === profile.id && (
              <button
                onClick={() => handleSignOut(navigate)}
                className="btn mt-4 px-6 py-2 text-white btn-sm"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Favorite Games */}
        <section className="mb-10">
          <FavoriteSection userId={profile.id} />
        </section>

        {/* Recent Reviews */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-2">📝 Recent Reviews</h3>
          <div className="space-y-4">
            {[1, 2].map((id) => (
              <div
                key={id}
                className="bg-base-200 p-4 rounded-lg shadow-sm space-y-2"
              >
                <p className="font-semibold">Game Title #{id}</p>
                <p className="text-sm text-base-content/80">
                  This game was really fun. I loved the combat system and the
                  storyline. Would definitely recommend!
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Game List */}
        <section>
          <h3 className="text-xl font-semibold mb-2">📚 Game List</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="p-3 rounded-lg border border-base-300 flex justify-between items-center"
              >
                <span>Game Title #{id}</span>
                <span className="text-sm text-muted-foreground">⭐ 4.5</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
      />
    </>
  );
};

export default UserPage;
