import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useUserLists } from "@/hooks/lists";
import { useParams } from "@tanstack/react-router";
import CreateListModal from "@/components/modals/CreateListModal";
import ListCard from "@/components/content/ListCard";

const Lists = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

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
          <p className="text-base-content/60">Loading lists...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading lists:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">No Profile Found</h1>
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isOwnProfile
              ? "Your Lists"
              : `${currentUser?.display_name || currentUser?.username}'s Lists`}
          </h2>
        </div>
        <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-2">No lists yet</h3>
          <p className="text-base-content/60">
            {isOwnProfile
              ? "Create your first game list to get started!"
              : `${viewedProfile?.display_name} hasn't created any lists yet.`}
          </p>

          {isOwnProfile && (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-secondary btn-sm mt-4"
              >
                Create List
              </button>
              <CreateListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            </>
          )}
        </div>
      </div>
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
            className="btn btn-secondary btn-sm"
          >
            New List
          </button>
        )}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
      <CreateListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Lists;
