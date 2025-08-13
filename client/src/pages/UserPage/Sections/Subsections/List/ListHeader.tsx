import { Edit3, Save, Trash2, X } from "lucide-react";
import { UseProfileContext } from "@/context/ViewedProfileContext";

interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

// Define the GameListItem type (the nested structure) - now includes rank
interface GameListItem {
  id: string; // The game_list_items id for updating rank
  rank: number;
  games: Game;
}

export interface ListData {
  id: string;
  name: string;
  games: GameListItem[];
}

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
  const { isOwnProfile } = UseProfileContext();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        {/* List Title - Input in edit mode, heading otherwise */}
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
          <h1 className="text-2xl font-bold">{data.name}</h1>
        )}

        {/* Action Buttons */}
        {isOwnProfile && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                {/* Save Button */}
                <button
                  onClick={saveChanges}
                  disabled={
                    !hasChanges ||
                    updateListMutation.isPending ||
                    removeGameMutation.isPending ||
                    updateRanksMutation.isPending
                  }
                  className="flex items-center gap-2 px-4 py-2 btn btn-success btn-sm"
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

                {/* Delete Button - only visible in edit mode */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 btn btn-error btn-sm"
                  disabled={deleteListMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete List
                </button>

                {/* Cancel Button */}
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 btn btn-neutral btn-sm"
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
              /* Edit Button - only visible when not in edit mode */
              <button
                onClick={enterEditMode}
                className="flex items-center gap-2 px-4 py-2 btn btn-secondary btn-sm"
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
