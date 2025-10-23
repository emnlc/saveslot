import { useRef, useEffect } from "react";
import { Game, GameLogWithProfile } from "@/Interface";
import { useGameLogForm } from "@/hooks/gameLogs/useGameLogForm";
import ModalHeader from "./ModalHeader";
import GameLogForm from "./GameLogForm";
import ModalFooter from "./ModalFooter";

type Props = {
  game: Game;
  userId: string;
  onClose: () => void;
  isOpen: boolean;
  editingLog?: GameLogWithProfile | null;
  onSuccess?: () => void;
};

const CreateLogModal = ({
  game,
  userId,
  onClose,
  isOpen,
  editingLog,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    formData,
    formHandlers,
    saveDraft,
    deleteDraft,
    handleSubmit,
    isLoading,
    isDraftSaving,
    isDraftDeleting,
    isEditing,
    hasDraft,
    isDraftLoading,
    hasDraftLoaded,
    hasUnsavedChanges,
    isDraftSaved,
    isInitialDraftLoad,
  } = useGameLogForm({ userId, gameId: game.id, editingLog });

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

  const onSubmit = () => handleSubmit(onClose);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box rounded overflow-y-auto max-w-md md:max-w-2xl max-h-[80vh]">
        {/* Header */}
        <ModalHeader
          game={game}
          onClose={() => dialogRef.current?.close()}
          isEditing={isEditing}
        />

        {/* Loading state for initial draft fetch */}
        {isDraftLoading && !isEditing && (
          <div className="flex items-center justify-center py-12">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="ml-3 text-base-content/60">Loading...</span>
          </div>
        )}

        {/* Form Content */}
        {(hasDraftLoaded || isEditing) && (
          <GameLogForm
            game={game}
            formData={formData}
            onFormDataChange={formHandlers}
          />
        )}

        {/* Footer */}
        {(hasDraftLoaded || isEditing) && (
          <ModalFooter
            onSaveDraft={saveDraft}
            onDeleteDraft={deleteDraft}
            onSubmit={onSubmit}
            onClose={() => dialogRef.current?.close()}
            isLoading={isLoading}
            isDraftSaving={isDraftSaving}
            isDraftDeleting={isDraftDeleting}
            isEditing={isEditing}
            hasUnsavedChanges={hasUnsavedChanges}
            isDraftSaved={isDraftSaved}
            isInitialDraftLoad={isInitialDraftLoad}
            hasDraft={hasDraft}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-base-100/50 flex items-center justify-center rounded-lg">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default CreateLogModal;
