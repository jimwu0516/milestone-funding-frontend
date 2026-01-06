//components/CancelProjectButton.tsx
"use client";

import { useState } from "react";
import TxModal from "@/components/TxModal";
import { useCancelProject } from "@/hooks/useContract";
import { useQueryClient } from "@tanstack/react-query";

export function CancelProjectButton({ projectId }: { projectId: bigint }) {
  const [open, setOpen] = useState(false);
  const { cancel, isPending, isConfirming, isSuccess, error, hash } =
    useCancelProject();
  const queryClient = useQueryClient();

  const handleCancel = async () => {
    setOpen(true);
    try {
      await cancel(projectId);
    } catch {}
  };

  const handleClose = () => {
    setOpen(false);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  };

  return (
    <>
      <button
        onClick={handleCancel}
        disabled={isPending || isConfirming}
        className="px-3 py-1 bg-red-600 text-white rounded-lg disabled:opacity-50 hover:cursor-pointer"
      >
        {isPending || isConfirming ? "Canceling..." : "Cancel"}
      </button>

      <TxModal
        isOpen={open}
        onClose={handleClose}
        status={
          error
            ? "error"
            : isSuccess
            ? "success"
            : isConfirming
            ? "confirming"
            : "pending"
        }
        hash={hash ?? null}
      />
    </>
  );
}
