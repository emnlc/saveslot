import { useCreateList } from "@/hooks/lists";
import { supabase } from "@/services/supabase";
import { useState, useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateListModal = ({ isOpen, onClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const createListMutation = useCreateList();

  // Handle opening/closing the dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle dialog close event
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userId) return;

    try {
      await createListMutation.mutateAsync({
        name: name.trim(),
        isPublic,
        userId,
      });
      setName("");
      setIsPublic(true);
      dialogRef.current?.close();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleCancel = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box rounded overflow-y-auto max-w-md max-h-[600px] flex flex-col">
        <h3 className="font-bold text-lg mb-4">Create New List</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="new-list-name-input">
              <span className="text-sm label-text">List Name</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              id="new-list-name-input"
              placeholder="Enter list name"
              onChange={(e) => setName(e.target.value)}
              className="input w-full focus:outline-none focus:ring-0 focus:input-primary mt-2"
            />
          </div>

          <div className="form-control flex flex-row justify-between">
            <label
              htmlFor="new-list-public-toggle"
              className="cursor-pointer label"
            >
              <span className="text-sm label-text">Make this list public</span>
            </label>
            <input
              id="new-list-public-toggle"
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-sm btn-ghost"
              disabled={createListMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={!name.trim() || createListMutation.isPending || !userId}
            >
              {createListMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create List"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Click outside to close - using form method="dialog" */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default CreateListModal;
