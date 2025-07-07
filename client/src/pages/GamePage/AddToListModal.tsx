import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import type { GameList } from "@/Interface"; // You should define this type if not already
import { createGameList, addGameToList } from "@/utils/listHelpers";

type Props = {
  gameId: number;
  onClose: () => void;
};

const AddToListModal = ({ gameId, onClose }: Props) => {
  const [lists, setLists] = useState<GameList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLists = async () => {
    const { data, error } = await supabase
      .from("game_lists")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

    if (!error) setLists(data);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setLoading(true);
    const newList = await createGameList(newListName, isPublic);
    if (newList) {
      setLists((prev) => [...prev, newList]);
      setSelectedListId(newList.id);
      setNewListName("");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedListId) return;
    setLoading(true);
    try {
      await addGameToList(selectedListId, gameId);
      onClose();
    } catch (err) {
      alert((err as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <dialog id="add_to_list_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add to a List</h3>

        <div className="py-4">
          <div className="form-control">
            <label className="label">Choose a List:</label>
            <select
              className="select select-bordered"
              value={selectedListId ?? ""}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              <option disabled value="">
                Select a list
              </option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div className="divider">or</div>

          <div className="form-control">
            <label className="label">Create New List:</label>
            <div className="form-control mt-2">
              <label className="cursor-pointer label">
                <span className="label-text">Make list public?</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="input input-bordered flex-1"
                placeholder="New list name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <button
                className="btn btn-outline"
                onClick={handleCreateList}
                disabled={loading}
              >
                Create
              </button>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!selectedListId || loading}
          >
            {loading ? "Adding..." : "Add Game"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AddToListModal;
