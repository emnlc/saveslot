import { UseMutationResult } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import type { ListData } from "@/types/lists";

type Props = {
  setShowDeleteConfirm: (show: boolean) => void;
  deleteListMutation: UseMutationResult<
    { success: boolean },
    Error,
    string,
    unknown
  >;
  handleDeleteList: () => void;
  data: ListData;
};

const DeleteListConfirmation = ({
  setShowDeleteConfirm,
  deleteListMutation,
  handleDeleteList,
  data,
}: Props) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center modal-overlay">
        <div className="bg-base-200 rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Delete List</h3>
          <p className="text-base-content text-sm mb-6">
            Are you sure you want to delete "
            <span className="text-accent">{data?.name}</span>"? This action
            cannot be undone and will remove all games from this list.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 btn btn-neutral btn-sm"
              disabled={deleteListMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteList}
              className="px-4 py-2 btn btn-error btn-sm"
              disabled={deleteListMutation.isPending}
            >
              {deleteListMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete List
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteListConfirmation;
