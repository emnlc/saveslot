import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useUserLikedLists } from "@/hooks/likes";
import { useParams } from "@tanstack/react-router";
import LikedList from "./LikedList";

const UserListLikes = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const {
    data: likedLists,
    isLoading,
    error,
    isError,
  } = useUserLikedLists(viewedProfile?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading liked lists...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading liked lists:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!likedLists || likedLists.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-2">No liked lists yet</h3>
          <p className="text-base-content/60">
            {isOwnProfile
              ? "Lists you like will appear here!"
              : `${viewedProfile?.display_name} hasn't liked any lists yet`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {likedLists.map((list) => (
        <LikedList key={list.like_id} list={list} />
      ))}
    </div>
  );
};

export default UserListLikes;
