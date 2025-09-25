import { Game, GameLogWithProfile } from "@/Interface";
import { useGameLogForm } from "@/hooks/GameLogs/useGameLogForm";
import ModalHeader from "./ModalHeader";
import GameLogForm from "./GameLogForm";
import ModalFooter from "./ModalFooter";

type Props = {
  game: Game;
  userId: string;
  onClose: () => void;
  editingLog?: GameLogWithProfile | null;
  onSuccess?: () => void;
};

const CreateLogModal = ({ game, userId, onClose, editingLog }: Props) => {
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

  const onSubmit = () => handleSubmit(onClose);

  return (
    <dialog className="modal modal-open">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <ModalHeader game={game} onClose={onClose} isEditing={isEditing} />

        {/* Loading state for initial draft fetch */}
        {isDraftLoading && !isEditing && (
          <div className="flex items-center justify-center py-12">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="ml-3 text-base-content/60">Loading...</span>
          </div>
        )}

        {/* Form Content - only show when draft is loaded or when editing */}
        {(hasDraftLoaded || isEditing) && (
          <GameLogForm
            game={game}
            formData={formData}
            onFormDataChange={formHandlers}
          />
        )}

        {/* Footer - only show when draft is loaded or when editing */}
        {(hasDraftLoaded || isEditing) && (
          <ModalFooter
            onSaveDraft={saveDraft}
            onDeleteDraft={deleteDraft}
            onSubmit={onSubmit}
            onClose={onClose}
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
    </dialog>
  );
};

export default CreateLogModal;
