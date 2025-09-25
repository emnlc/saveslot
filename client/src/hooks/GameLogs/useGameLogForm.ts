import { useState, useEffect, useCallback } from "react";
import { GameStatus, GameLogWithProfile } from "@/Interface";
import {
  useCreateGameLog,
  useUpdateGameLog,
  useSaveLogDraft,
  useLogDraft,
  useDeleteLogDraft,
} from "@/hooks/GameLogs/useGameLogs";

interface UseGameLogFormProps {
  userId: string;
  gameId: number;
  editingLog?: GameLogWithProfile | null;
}

export const useGameLogForm = ({
  userId,
  gameId,
  editingLog,
}: UseGameLogFormProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [playStartDate, setPlayStartDate] = useState("");
  const [playEndDate, setPlayEndDate] = useState("");
  const [hoursPlayed, setHoursPlayed] = useState<number | null>(null);
  const [minutesPlayed, setMinutesPlayed] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [platform, setPlatform] = useState<string>("");
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(false);

  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const createLogMutation = useCreateGameLog();
  const updateLogMutation = useUpdateGameLog();
  const saveDraftMutation = useSaveLogDraft();
  const deleteLogDraftMutation = useDeleteLogDraft();

  const { data: draft, isLoading: isDraftLoading } = useLogDraft(
    userId,
    gameId
  );
  const isEditing = !!editingLog;

  const serializeFormState = useCallback(() => {
    return JSON.stringify({
      rating,
      reviewText,
      gameStatus,
      platform,
      playStartDate,
      playEndDate,
      hoursPlayed,
      minutesPlayed,
      containsSpoilers,
    });
  }, [
    rating,
    reviewText,
    gameStatus,
    platform,
    playStartDate,
    playEndDate,
    hoursPlayed,
    minutesPlayed,
    containsSpoilers,
  ]);

  useEffect(() => {
    if (editingLog) {
      setRating(editingLog.rating || null);
      setReviewText(editingLog.review_text || "");
      setGameStatus((editingLog.game_status as GameStatus) || null);
      setPlatform(editingLog.platform || "");
      setPlayStartDate(editingLog.play_start_date || "");
      setPlayEndDate(editingLog.play_end_date || "");
      setHoursPlayed(editingLog.hours_played || null);
      setMinutesPlayed(editingLog.minutes_played || null);
      setContainsSpoilers(editingLog.contains_spoilers || false);
      setHasDraftLoaded(true);
    } else if (!isDraftLoading) {
      if (draft) {
        setRating(draft.rating || null);
        setReviewText(draft.review_text || "");
        setGameStatus((draft.game_status as GameStatus) || null);
        setPlatform(draft.platform || "");
        setPlayStartDate(draft.play_start_date || "");
        setPlayEndDate(draft.play_end_date || "");
        setHoursPlayed(draft.hours_played || null);
        setMinutesPlayed(draft.minutes_played || null);
        setContainsSpoilers(draft.contains_spoilers || false);
      }
      setHasDraftLoaded(true);
    }
  }, [draft, editingLog, isDraftLoading]);

  useEffect(() => {
    if (!hasDraftLoaded || isEditing) return;

    const currentState = serializeFormState();

    if (lastSavedState === "") {
      setLastSavedState(currentState);
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(currentState !== lastSavedState);
  }, [serializeFormState, hasDraftLoaded, isEditing, lastSavedState]);

  const saveDraft = useCallback(() => {
    if (isEditing || !hasDraftLoaded) return;

    if (
      rating ||
      reviewText ||
      gameStatus ||
      platform ||
      playStartDate ||
      playEndDate ||
      hoursPlayed ||
      minutesPlayed
    ) {
      saveDraftMutation.mutate(
        {
          user_id: userId,
          game_id: gameId,
          rating: rating || undefined,
          review_text: reviewText || undefined,
          game_status: gameStatus || undefined,
          platform: platform || undefined,
          play_start_date: playStartDate || undefined,
          play_end_date: playEndDate || undefined,
          hours_played: hoursPlayed || undefined,
          minutes_played: minutesPlayed || undefined,
          contains_spoilers: containsSpoilers,
        },
        {
          onSuccess: () => {
            setLastSavedState(serializeFormState());
            setHasUnsavedChanges(false);
            setIsInitialLoad(false);
          },
        }
      );
    }
  }, [
    isEditing,
    hasDraftLoaded,
    userId,
    gameId,
    rating,
    reviewText,
    gameStatus,
    platform,
    playStartDate,
    playEndDate,
    hoursPlayed,
    minutesPlayed,
    containsSpoilers,
    saveDraftMutation,
    serializeFormState,
  ]);

  // Auto-save every 30 seconds (only for new logs)
  useEffect(() => {
    if (isEditing || !hasDraftLoaded) return;

    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft, isEditing, hasDraftLoaded]);

  // Delete draft function
  const deleteDraft = useCallback(async () => {
    if (isEditing || !draft) return;

    try {
      await deleteLogDraftMutation.mutateAsync({
        userId,
        gameId,
      });

      // Reset form to empty state
      setRating(null);
      setReviewText("");
      setGameStatus(null);
      setPlatform("");
      setPlayStartDate("");
      setPlayEndDate("");
      setHoursPlayed(null);
      setMinutesPlayed(null);
      setContainsSpoilers(false);
      setHasUnsavedChanges(false);
      setLastSavedState("");
      setIsInitialLoad(true);
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  }, [isEditing, draft, deleteLogDraftMutation, userId, gameId]);

  // Submit handler
  const handleSubmit = useCallback(
    async (onSuccess?: () => void, onClose?: () => void) => {
      if (!rating && !reviewText?.trim()) {
        alert("Please provide either a rating or a review to log this game.");
        return;
      }

      const logData = {
        user_id: userId,
        game_id: gameId,
        rating: rating || undefined,
        review_text: reviewText || undefined,
        game_status: gameStatus || undefined,
        platform: platform || undefined,
        play_start_date: playStartDate || undefined,
        play_end_date: playEndDate || undefined,
        hours_played: hoursPlayed || undefined,
        minutes_played: minutesPlayed || undefined,
        contains_spoilers: containsSpoilers,
      };

      try {
        if (isEditing) {
          // Update existing log
          await updateLogMutation.mutateAsync({
            id: editingLog.id,
            ...logData,
          });
        } else {
          // Create new log
          await createLogMutation.mutateAsync(logData);

          // Delete draft after successful creation
          if (draft) {
            try {
              await deleteLogDraftMutation.mutateAsync({
                userId,
                gameId,
              });
            } catch (error) {
              console.error("Error deleting draft:", error);
            }
          }
        }
        onSuccess?.();
        onClose?.();
      } catch (error) {
        console.error(
          `Error ${isEditing ? "updating" : "creating"} log:`,
          error
        );
      }
    },
    [
      rating,
      reviewText,
      gameStatus,
      platform,
      playStartDate,
      playEndDate,
      hoursPlayed,
      minutesPlayed,
      containsSpoilers,
      userId,
      gameId,
      isEditing,
      editingLog,
      createLogMutation,
      updateLogMutation,
      draft,
      deleteLogDraftMutation,
    ]
  );

  // Form data object
  const formData = {
    rating,
    reviewText,
    gameStatus,
    playStartDate,
    playEndDate,
    hoursPlayed,
    minutesPlayed,
    hoveredRating,
    platform,
    containsSpoilers,
  };

  // Form handlers object
  const formHandlers = {
    setRating,
    setReviewText,
    setGameStatus,
    setPlayStartDate,
    setPlayEndDate,
    setHoursPlayed,
    setMinutesPlayed,
    setHoveredRating,
    setPlatform,
    setContainsSpoilers,
  };

  return {
    formData,
    formHandlers,
    saveDraft,
    deleteDraft,
    handleSubmit,
    isLoading: isEditing
      ? updateLogMutation.isPending
      : createLogMutation.isPending,
    isDraftSaving: saveDraftMutation.isPending,
    isDraftDeleting: deleteLogDraftMutation.isPending,
    isEditing,
    hasDraft: !!draft && !isEditing,
    isDraftLoading: isDraftLoading && !isEditing,
    hasDraftLoaded,
    hasUnsavedChanges,
    isDraftSaved: !hasUnsavedChanges && hasDraftLoaded && !isEditing,
    isInitialDraftLoad:
      isInitialLoad &&
      !!draft &&
      !isEditing &&
      !hasUnsavedChanges &&
      hasDraftLoaded,
  };
};
