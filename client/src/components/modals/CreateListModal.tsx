import { useCreateList } from "@/hooks/lists";
import { supabase } from "@/services/supabase";
import { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateListModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const createListMutation = useCreateList();

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
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New List</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">List Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter list name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="label-text">Make this list public</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={createListMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default CreateListModal;
