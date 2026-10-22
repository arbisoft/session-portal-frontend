"use client";

import React, { useEffect, useRef } from "react";

import { useFormState } from "react-hook-form";

import ConfirmDialog from "@/components/ConfirmDialog";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import { FieldProps } from "./fields";

const LEAVE_DESCRIPTION =
  "The details you entered and any upload in progress will be lost. " +
  "You can continue an unfinished upload later by selecting the same video again.";

type LeaveGuardDialogProps = FieldProps & { hasFile: boolean };

/** Asks before an in-app link or a reload throws away the typed details or a video that is uploading. */
const LeaveGuardDialog = ({ control, hasFile }: LeaveGuardDialogProps) => {
  const { isDirty } = useFormState({ control });
  const { isBlocked, leave, stay } = useLeaveGuard(hasFile || isDirty);
  const context = { has_video: hasFile, has_unsaved_details: isDirty };

  // The prompt opens from a document-level click listener inside useLeaveGuard, so there is no handler here to hook into.
  // The ref keeps it to one report per time the prompt opens, even if the values it describes change meanwhile.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (!isBlocked) {
      reportedRef.current = false;
      return;
    }
    if (reportedRef.current) return;
    reportedRef.current = true;
    trackEvent(GA_EVENTS.UPLOAD_LEAVE_GUARD, ANALYTICS_CATEGORY.UPLOAD_VIDEO, {
      action: "shown",
      has_video: hasFile,
      has_unsaved_details: isDirty,
    });
  }, [isBlocked, hasFile, isDirty]);

  const handleStay = () => {
    trackEvent(GA_EVENTS.UPLOAD_LEAVE_GUARD, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { action: "stay", ...context });
    stay();
  };

  const handleLeave = () => {
    trackEvent(GA_EVENTS.UPLOAD_LEAVE_GUARD, ANALYTICS_CATEGORY.UPLOAD_VIDEO, { action: "leave", ...context });
    leave();
  };

  return (
    <ConfirmDialog
      open={isBlocked}
      title="Leave this page?"
      description={LEAVE_DESCRIPTION}
      confirmLabel="Leave page"
      cancelLabel="Stay"
      onConfirm={handleLeave}
      onCancel={handleStay}
    />
  );
};

export default LeaveGuardDialog;
