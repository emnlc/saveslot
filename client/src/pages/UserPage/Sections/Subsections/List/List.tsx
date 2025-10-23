import { useParams, useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import {
  useListItems,
  useUpdateList,
  useDeleteList,
  useRemoveGameFromList,
  useUpdateRanks,
} from "@/hooks/lists";
import { useState, useEffect } from "react";
import DraggableGameList from "@/pages/UserPage/Sections/Subsections/List/DraggableGameList";
import DeleteListConfirmation from "./DeleteListConfirmation";
import ListHeader from "./ListHeader";
import RemovedItems from "./RemovedItems";
import type { ListData } from "@/types/lists";

const List = () => {
  const navigate = useNavigate();
  const { username, listslug } = useParams({
    from: "/u/$username/list/_list/$listslug",
  });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username, currentUser?.id);

  const { data, isLoading, isError, error } = useListItems(
    viewedProfile?.username || "",
    listslug
  );

  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();
  const removeGameMutation = useRemoveGameFromList();
  const updateRanksMutation = useUpdateRanks();

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [gamesToRemove, setGamesToRemove] = useState<Set<number>>(new Set());
  const [reorderedGames, setReorderedGames] = useState<
    ListData["games"] | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.name) {
      setEditedName(data.name);
    }
  }, [data?.name]);

  useEffect(() => {
    const nameChanged = editedName.trim() !== data?.name;
    const gamesChanged = gamesToRemove.size > 0;
    const orderChanged = reorderedGames !== null;
    setHasChanges(nameChanged || gamesChanged || orderChanged);
  }, [editedName, gamesToRemove, reorderedGames, data?.name]);

  const enterEditMode = () => {
    setEditMode(true);
    setEditedName(data?.name || "");
    setGamesToRemove(new Set());
    setReorderedGames(null);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedName(data?.name || "");
    setGamesToRemove(new Set());
    setReorderedGames(null);
    setHasChanges(false);
  };

  const handleReorder = (newOrder: ListData["games"]) => {
    setReorderedGames(newOrder);
  };

  const toggleGameRemoval = (gameId: number) => {
    const newSet = new Set(gamesToRemove);
    if (newSet.has(gameId)) {
      newSet.delete(gameId);
    } else {
      newSet.add(gameId);
    }
    setGamesToRemove(newSet);
  };

  const saveChanges = async () => {
    if (!data?.id || !viewedProfile?.id) return;

    try {
      let updatedData = data;

      if (editedName.trim() !== data.name) {
        updatedData = await updateListMutation.mutateAsync({
          listId: data.id,
          name: editedName.trim(),
        });
      }

      if (reorderedGames) {
        const rankUpdates = reorderedGames.map((game, index) => ({
          item_id: game.id,
          rank: index + 1,
        }));

        await updateRanksMutation.mutateAsync({
          listId: data.id,
          updates: rankUpdates,
        });
      }

      if (gamesToRemove.size > 0) {
        for (const gameId of gamesToRemove) {
          await removeGameMutation.mutateAsync({
            listId: data.id,
            gameId: gameId,
          });
        }
      }

      if (updatedData.slug !== listslug) {
        navigate({
          to: "/u/$username/list/$listslug",
          params: {
            username: viewedProfile.username,
            listslug: updatedData.slug,
          },
          replace: true,
        });
      }

      setEditMode(false);
      setGamesToRemove(new Set());
      setReorderedGames(null);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleDeleteList = async () => {
    if (!data?.id) return;

    try {
      await deleteListMutation.mutateAsync(data.id);
      navigate({
        to: "/u/$username/lists",
        params: { username: viewedProfile?.username || "" },
      });
    } catch (error) {
      console.error("Failed to delete list:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading list...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading list:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!viewedProfile || !data) {
    return (
      <div className="p-8 text-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto md:max-w-5xl my-12 px-4 md:px-0">
        <ListHeader
          editMode={editMode}
          editedName={editedName}
          setEditedName={setEditedName}
          saveChanges={saveChanges}
          cancelEdit={cancelEdit}
          enterEditMode={enterEditMode}
          setShowDeleteConfirm={setShowDeleteConfirm}
          hasChanges={hasChanges}
          updateListMutation={updateListMutation}
          removeGameMutation={removeGameMutation}
          updateRanksMutation={updateRanksMutation}
          deleteListMutation={deleteListMutation}
          data={data}
        />

        <DraggableGameList
          games={reorderedGames || data.games}
          editMode={editMode}
          gamesToRemove={gamesToRemove}
          onToggleRemoval={toggleGameRemoval}
          onReorder={handleReorder}
        />

        <RemovedItems
          editMode={editMode}
          data={data}
          gamesToRemove={gamesToRemove}
          toggleGameRemoval={toggleGameRemoval}
        />
      </div>

      {showDeleteConfirm && (
        <DeleteListConfirmation
          deleteListMutation={deleteListMutation}
          setShowDeleteConfirm={setShowDeleteConfirm}
          handleDeleteList={handleDeleteList}
          data={data}
        />
      )}
    </>
  );
};

export default List;
