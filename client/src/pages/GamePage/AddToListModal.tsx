import { useState } from "react";
import { useUserLists } from "@/hooks/UserListHooks/useListsQuery";
import { useCreateList } from "@/hooks/UserListHooks/useCreateListMutation";
import { useAddGameToList } from "@/hooks/UserListHooks/useAddGameMutation";
import { supabase } from "@/services/supabase";
import { ArrowLeft, Plus, Search, X } from "lucide-react";

type Props = {
  gameId: number;
  gameTitle: string;
  onClose: () => void;
};

type ViewMode = "selectList" | "createList";

const AddToListModal = ({ gameId, gameTitle, onClose }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>("selectList");
  const [newListName, setNewListName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  useState(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  });

  const { data: lists = [], isLoading: listsLoading } = useUserLists(
    userId || ""
  );
  const createListMutation = useCreateList();
  const addGameMutation = useAddGameToList();

  const filteredLists = lists.filter((list) => {
    const matchesSearch = list.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "public" ? list.is_public : !list.is_public;
    return matchesSearch && matchesTab;
  });

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      const newList = await createListMutation.mutateAsync({
        name: newListName,
        isPublic,
      });

      await addGameMutation.mutateAsync({
        listId: newList.id,
        gameId,
      });

      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
  };

  const handleAddToSelectedList = async () => {
    if (!selectedListId) return;

    try {
      await addGameMutation.mutateAsync({
        listId: selectedListId,
        gameId,
      });
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleBackToLists = () => {
    setViewMode("selectList");
    setNewListName("");
    setIsPublic(false);
    setSelectedListId(null);
  };

  const isLoading = createListMutation.isPending || addGameMutation.isPending;

  return (
    <dialog id="add_to_list_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md  max-h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          {viewMode === "createList" ? (
            <button
              onClick={handleBackToLists}
              className="btn btn-ghost btn-sm p-1"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}

          <h3 className="font-bold text-lg flex-1 text-center">
            {viewMode === "selectList"
              ? `Add "${gameTitle}" to list`
              : "Create new list"}
          </h3>

          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {viewMode === "selectList" ? (
          <>
            {/* Public/Private Toggle */}
            <div className="tabs tabs-boxed w-full mb-4">
              <button
                className={`tab flex-1 btn btn-ghost rounded-r-none ${activeTab === "public" ? "tab-active bg-primary text-primary-content rounded-l-lg" : ""}`}
                onClick={() => setActiveTab("public")}
              >
                Public
              </button>
              <button
                className={`tab flex-1 btn btn-ghost rounded-l-none ${activeTab === "private" ? "tab-active bg-primary text-primary-content rounded-r-lg" : ""}`}
                onClick={() => setActiveTab("private")}
              >
                Private
              </button>
            </div>

            {/* New List Button */}
            <button
              onClick={() => setViewMode("createList")}
              className="btn btn-ghost w-full justify-start mb-4 h-auto py-3"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>New list...</span>
            </button>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Type to search"
                className="input input-bordered w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Lists */}
            <div className="flex-1 overflow-hidden">
              <div className="space-y-2  max-h-40 overflow-y-auto">
                {listsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-12 w-full"></div>
                    ))}
                  </div>
                ) : filteredLists.length > 0 ? (
                  filteredLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleSelectList(list.id)}
                      disabled={isLoading}
                      className={`btn w-full justify-between h-auto py-3 ${
                        selectedListId === list.id ? "btn-primary" : "btn-ghost"
                      }`}
                    >
                      <span className="text-left">
                        <div className="font-medium">{list.name}</div>
                      </span>
                      <span className="text-sm opacity-50">
                        {list.game_count}{" "}
                        {list.game_count === 1 ? "game" : "games"}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-base-content/50 py-8">
                    {searchQuery
                      ? `No ${activeTab} lists found`
                      : `No ${activeTab} lists created yet`}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Create List Form */
          <div className="space-y-4">
            <div className="form-control space-y-4">
              <label className="label">
                <span className="label-text">List name</span>
              </label>
              <input
                type="text"
                placeholder="Enter list name"
                className="input input-bordered w-full"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newListName.trim()) {
                    handleCreateList();
                  }
                }}
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

            <button
              onClick={handleCreateList}
              disabled={!newListName.trim() || isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating and adding...
                </>
              ) : (
                "Create list and add game"
              )}
            </button>
          </div>
        )}

        {/* Add button for existing lists */}
        {viewMode === "selectList" && (
          <div className="modal-action mt-2">
            <button
              onClick={handleAddToSelectedList}
              disabled={!selectedListId || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span>Add to List</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default AddToListModal;
