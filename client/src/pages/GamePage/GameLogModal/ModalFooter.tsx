import { Save, Send, Check, Trash2 } from "lucide-react";

type Props = {
  onSaveDraft: () => void;
  onDeleteDraft: () => void;
  onSubmit: () => void;
  onClose: () => void;
  isLoading: boolean;
  isDraftSaving: boolean;
  isDraftDeleting: boolean;
  isEditing?: boolean;
  hasUnsavedChanges?: boolean;
  isDraftSaved?: boolean;
  isInitialDraftLoad?: boolean;
  hasDraft?: boolean;
};

const ModalFooter = ({
  onSaveDraft,
  onDeleteDraft,
  onSubmit,
  onClose,
  isLoading,
  isDraftSaving,
  isDraftDeleting,
  isEditing = false,
  hasUnsavedChanges = false,
  isDraftSaved = false,
  isInitialDraftLoad = false,
  hasDraft = false,
}: Props) => {
  const getDraftButtonContent = () => {
    if (isDraftSaving) {
      return (
        <>
          <div className="loading loading-spinner loading-sm mr-2"></div>
          Saving...
        </>
      );
    }

    if (isDraftSaved && !hasUnsavedChanges) {
      if (isInitialDraftLoad) {
        return (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600" />
            Draft Loaded
          </>
        );
      }
      return (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          Draft Saved
        </>
      );
    }

    return (
      <>
        <Save className="w-4 h-4 mr-2" />
        Save Draft
      </>
    );
  };

  const getDraftButtonClass = () => {
    if (isDraftSaved && !hasUnsavedChanges) {
      return "btn btn-ghost btn-sm text-green-600";
    }
    return "btn btn-ghost btn-sm";
  };

  const handleDeleteDraft = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this draft? This action cannot be undone."
      )
    ) {
      onDeleteDraft();
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-base-300">
      <div className="flex space-x-3">
        {/* Only show Save Draft button when creating new logs */}
        {!isEditing && (
          <>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={
                isDraftSaving ||
                (isDraftSaved && !hasUnsavedChanges) ||
                isDraftDeleting
              }
              className={getDraftButtonClass()}
            >
              {getDraftButtonContent()}
            </button>

            {/* Delete Draft button */}
            {hasDraft && (
              <button
                type="button"
                onClick={handleDeleteDraft}
                disabled={isDraftDeleting || isDraftSaving}
                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                title="Delete draft"
              >
                {isDraftDeleting ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </>
        )}
      </div>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-ghost"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="btn btn-sm btn-primary"
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading
            ? isEditing
              ? "Updating..."
              : "Publishing..."
            : isEditing
              ? "Update Log"
              : "Publish Log"}
        </button>
      </div>
    </div>
  );
};

export default ModalFooter;
