import { Edit3, Save, Trash2, X } from "lucide-react";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useParams } from "@tanstack/react-router";
import LikeButton from "@/components/controls/LikeButton";
import type { ListData } from "@/types/lists";

type Props = {
  editMode: boolean;
  editedName: string;
  setEditedName: (name: string) => void;
  saveChanges: () => void;
  cancelEdit: () => void;
  enterEditMode: () => void;
  setShowDeleteConfirm: (show: boolean) => void;
  hasChanges: boolean;
  updateListMutation: { isPending: boolean };
  removeGameMutation: { isPending: boolean };
  updateRanksMutation: { isPending: boolean };
  deleteListMutation: { isPending: boolean };
  data: ListData;
};

const ListHeader = ({
  editMode,
  editedName,
  setEditedName,
  saveChanges,
  cancelEdit,
  enterEditMode,
  setShowDeleteConfirm,
  hasChanges,
  updateListMutation,
  removeGameMutation,
  updateRanksMutation,
  deleteListMutation,
  data,
}: Props) => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        {editMode ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none min-w-0 flex-1 mr-4 transition-all"
            placeholder="Enter list name"
            maxLength={50}
          />
        ) : (
          <>
            <div className="flex flex-row gap-2 md:gap-4 items-center">
              <h1 className="text-2xl md:text-3xl font-bold">{data.name}</h1>
              <LikeButton targetId={data.id} targetType="list" />
            </div>
          </>
        )}
        {isOwnProfile && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={saveChanges}
                  disabled={
                    !hasChanges ||
                    updateListMutation.isPending ||
                    removeGameMutation.isPending ||
                    updateRanksMutation.isPending
                  }
                  className="flex items-center gap-2 px-4 py-2 btn btn-success btn-sm md:btn-md"
                >
                  {updateListMutation.isPending ||
                  removeGameMutation.isPending ||
                  updateRanksMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 btn btn-error btn-sm md:btn-md"
                  disabled={deleteListMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete List
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 btn btn-neutral btn-sm md:btn-md"
                  disabled={
                    updateListMutation.isPending ||
                    removeGameMutation.isPending ||
                    updateRanksMutation.isPending
                  }
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={enterEditMode}
                className="flex items-center gap-2 px-4 py-2 btn btn-secondary btn-sm md:btn-md"
              >
                <Edit3 className="w-4 h-4" />
                Edit List
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ListHeader;
