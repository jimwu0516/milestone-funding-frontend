// components/SubmitMilestoneModal.tsx
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import TxModal from "@/components/TxModal";
import {
  useSubmitMilestone,
  useMilestoneDescriptions,
} from "@/hooks/useContract";
import { uploadToIPFS } from "@/lib/ipfs";
import { useQueryClient } from "@tanstack/react-query";

export default function SubmitMilestoneModal({
  projectId,
  state,
  onClose,
}: {
  projectId: bigint;
  state: number;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showInputModal, setShowInputModal] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();
  const { submit, isPending, isConfirming, isSuccess, error, hash } =
    useSubmitMilestone();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setUploading(true);
      const cid = await uploadToIPFS(file);

      setShowInputModal(false);
      setShowTxModal(true);
      submit(projectId, cid);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
      setShowInputModal(true);
      setShowTxModal(false);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
    }
    onClose();
  };

  const baseButtonClass =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover:cursor-pointer";

  const currentMilestoneIndex = useMemo(() => {
    switch (state) {
      case 2:
      case 3:
      case 4:
        return 0;
      case 5:
      case 6:
      case 7:
        return 1;
      case 8:
      case 9:
      case 10:
        return 2;
      default:
        return 0;
    }
  }, [state]);

  const { data: milestoneDescriptionsRaw } =
    useMilestoneDescriptions(projectId);
  const milestoneDescriptions = milestoneDescriptionsRaw as
    | string[]
    | undefined;

  const currentMilestoneDescription = useMemo(() => {
    if (!milestoneDescriptions) return "";
    return milestoneDescriptions[currentMilestoneIndex] || "";
  }, [milestoneDescriptions, currentMilestoneIndex]);

  const isPdf = file?.type === "application/pdf";

  return (
    <>
      {showInputModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-90 opacity-0 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b dark:border-gray-700 bg-gradient-to-r from-green-600 to-green-700 text-white">
              <h2 className="text-2xl font-bold">
                Submit Milestone {currentMilestoneIndex + 1}
              </h2>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Ensure the image clearly shows milestone completion
              </span>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* File selector */}
              <label
                htmlFor="milestone-file"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed
              border-gray-300 dark:border-gray-600 rounded-lg
              text-gray-600 dark:text-gray-300
              cursor-pointer transition-all
              hover:border-green-500 hover:text-green-600
              hover:bg-green-50 dark:hover:bg-gray-700"
              >
                Choose image or pdf file
              </label>
              <input
                ref={fileInputRef}
                id="milestone-file"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              {/* File Preview */}
              {preview && file && (
                <div className="relative mt-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {isPdf ? (
                    <div className="h-64 overflow-y-auto bg-gray-100 dark:bg-gray-800">
                      <iframe
                        src={`${preview}#page=1&view=FitH`}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  ) : (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white
                      rounded-full w-8 h-8 flex items-center justify-center transition"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Milestone Description */}
              {currentMilestoneDescription && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 text-sm text-gray-700 dark:text-gray-300">
                  {currentMilestoneDescription}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className={`${baseButtonClass} bg-green-600 hover:bg-green-700 text-white w-full disabled:opacity-50`}
                >
                  {uploading ? "Uploading..." : "Submit"}
                </button>
                <button
                  onClick={onClose}
                  className={`${baseButtonClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white w-full`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TxModal
        isOpen={showTxModal}
        onClose={handleCloseTxModal}
        status={
          error
            ? "error"
            : isSuccess
              ? "success"
              : isConfirming
                ? "confirming"
                : "pending"
        }
        hash={hash || null}
        errorMessage={error ? "Try again" : undefined}
      />
    </>
  );
}
