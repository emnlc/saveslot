import { useEffect } from "react";
import { UseProfileContext } from "@/context/ViewedProfileContext";
import { useUserLists } from "@/hooks/UserListHooks/useListsQuery";
import CreateListModal from "@/components/CreateListModal";
import { useState } from "react";

import ListCard from "@/components/ListCard";

const Lists = () => {
  const { viewedProfile, isOwnProfile } = UseProfileContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const {
    data: lists,
    isLoading,
    error,
    isError,
  } = useUserLists(viewedProfile?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lists...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading lists: {error?.message}</p>
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No lists yet</h3>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? "Create your first game list to get started!"
            : `${viewedProfile?.display_name} hasn't created any lists yet.`}
        </p>
        {isOwnProfile && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary btn-lg"
          >
            Create List
          </button>
        )}
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <>
        <h1 className="my-36">No Viewed Profile</h1>
      </>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isOwnProfile
            ? "Your Lists"
            : `${viewedProfile?.display_name}'s Lists`}
        </h2>
        {isOwnProfile && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary btn-sm md:btn-md"
          >
            New List
          </button>
        )}
        <CreateListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};

export default Lists;
