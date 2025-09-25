import { UseProfileContext } from "@/context/ViewedProfileContext";
import { useUserLikedLists } from "@/hooks/UserLikeHooks/useUserLikedLists";

import { Heart } from "lucide-react";
import LikedList from "./LikedList";

const UserListLikes = () => {
  const { viewedProfile, isOwnProfile } = UseProfileContext();

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
          Error loading liked lists: {error?.message}
        </p>
      </div>
    );
  }

  if (!likedLists || likedLists.length === 0) {
    return (
      <div className="p-8 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No liked lists yet</h3>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? "Lists you like will appear here!"
            : `${viewedProfile?.display_name} hasn't liked any lists yet.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 ">
      {likedLists.map((list) => (
        <LikedList key={list.like_id} list={list} />
      ))}
    </div>
  );
};

export default UserListLikes;
