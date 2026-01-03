// components/SubmitMilestoneModal.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import TxModal from "@/components/TxModal";
import { useSubmitMilestone } from "@/hooks/useContract";
import { uploadToIPFS } from "@/lib/ipfs";
import { useQueryClient } from "@tanstack/react-query";

export default function SubmitMilestoneModal({
  projectId,
  onClose,
}: {
  projectId: bigint;
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
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover:scale-105 cursor-pointer";

  return (
    <>
      {showInputModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
          onClick={onClose}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Submit Milestone Proof Image
            </h3>

            {/* File selector */}
            <label
              htmlFor="milestone-file"
              className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed
                border-gray-300 dark:border-gray-600 rounded-lg
                text-gray-600 dark:text-gray-300
                cursor-pointer transition-all
                hover:border-blue-500 hover:text-blue-600
                hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              Choose image file
            </label>
            <input
              ref={fileInputRef}
              id="milestone-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* Image preview */}
            {preview && (
              <div className="relative mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white
                 rounded-full w-8 h-8 flex items-center justify-center transition"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
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
