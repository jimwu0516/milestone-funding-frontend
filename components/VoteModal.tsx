//components/VoteModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import TxModal from "./TxModal";
import {
  useProjectMeta,
  useProjectVoting,
  useVote,
  useMilestoneDescriptions,
} from "@/hooks/useContract";
import { useAccount } from "wagmi";
import { useMyVotes } from "@/hooks/useContract";

type VoteModalProps = {
  projectId: bigint;
  milestoneIndex: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function VoteModal({
  projectId,
  milestoneIndex,
  onClose,
  onSuccess,
}: VoteModalProps) {
  const { vote, hash, isPending, isConfirming, isSuccess, error } = useVote();
  const { data: meta, refetch: refetchMeta } = useProjectMeta(projectId);
  const { data: votingData, refetch: refetchVoting } =
    useProjectVoting(projectId);
  const { data: milestoneDescriptions } = useMilestoneDescriptions(projectId);

  const { address } = useAccount();
  const { refetch: refetchMyVotes } = useMyVotes(projectId, address);

  const [selected, setSelected] = useState<1 | 2 | null>(null);
  const [showTx, setShowTx] = useState(false);
  const [previewType, setPreviewType] = useState<"image" | "pdf">("image");
  const [imageLoading, setImageLoading] = useState(true);

  const milestoneHashes = meta?.[0];
  const milestoneCID =
    Array.isArray(milestoneHashes) &&
    milestoneIndex >= 0 &&
    milestoneIndex < milestoneHashes.length
      ? milestoneHashes[milestoneIndex]
      : null;

  const roundIndex =
    milestoneIndex >= 0 && milestoneIndex <= 2 ? milestoneIndex : null;

  const yesWeights =
    votingData && Array.isArray(votingData) ? votingData[2] : null;
  const noWeights =
    votingData && Array.isArray(votingData) ? votingData[3] : null;

  const yesWeight =
    roundIndex !== null && yesWeights ? yesWeights[roundIndex] ?? 0n : 0n;
  const noWeight =
    roundIndex !== null && noWeights ? noWeights[roundIndex] ?? 0n : 0n;

  const yes = Number(yesWeight);
  const no = Number(noWeight);
  const sum = yes + no;
  const yesPercent = sum > 0 ? (yes / sum) * 100 : 0;
  const noPercent = sum > 0 ? (no / sum) * 100 : 0;

  const handleVote = async () => {
    if (!selected) return;
    setShowTx(true);
    await vote(projectId, selected);
  };

  const handleCloseTx = async () => {
    setShowTx(false);
    if (isSuccess) {
      await refetchVoting();
      await refetchMeta();
      await refetchMyVotes();
      onSuccess?.();
      onClose();
    }
  };

  useEffect(() => {
    setImageLoading(true);
    setPreviewType("image");
  }, [milestoneCID]);

  const currentMilestoneDescription = useMemo(() => {
    if (!milestoneDescriptions) return "";
    return milestoneDescriptions[milestoneIndex] || "";
  }, [milestoneDescriptions, milestoneIndex]);

  const isPdf = previewType === "pdf";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-90 opacity-0 animate-fadeIn"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-2xl font-bold">
              Vote on Milestone {milestoneIndex + 1}
            </h2>
            <p className="text-sm opacity-80 mt-1">
              Support or reject this milestone
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Milestone Preview */}
            {milestoneCID ? (
              <div
                className="mb-4 w-full h-64 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-800 cursor-pointer group"
                onClick={() =>
                  window.open(
                    `https://gateway.pinata.cloud/ipfs/${milestoneCID}`,
                    "_blank"
                  )
                }
              >
                {isPdf ? (
                  <div className="h-full w-full overflow-auto">
                    <iframe
                      src={`https://gateway.pinata.cloud/ipfs/${milestoneCID}#page=1&view=FitH`}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 z-10">
                        Loading preview...
                      </div>
                    )}
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${milestoneCID}`}
                      alt={`Milestone ${milestoneIndex + 1}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoading ? "opacity-0" : "opacity-100"
                      }`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setPreviewType("pdf")}
                    />
                  </>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium text-m z-20">
                  View this file
                </div>
              </div>
            ) : (
              <div className="mb-4 h-64 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400">
                No milestone image
              </div>
            )}

            {/* Milestone Description */}
            {currentMilestoneDescription && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
                {currentMilestoneDescription}
              </div>
            )}

            {/* Voting Bar */}
            <div>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                {yesPercent > 0 && (
                  <div
                    className="bg-green-600 transition-all"
                    style={{ width: `${yesPercent}%` }}
                  />
                )}
                {noPercent > 0 && (
                  <div
                    className="bg-red-600 transition-all"
                    style={{ width: `${noPercent}%` }}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-700 dark:text-gray-300">
                <span>Yes: {yesPercent.toFixed(2)}%</span>
                <span>No: {noPercent.toFixed(2)}%</span>
              </div>
            </div>

            {/* Vote Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setSelected(1)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors duration-200 ${
                  selected === 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-green-100 dark:hover:bg-green-900/40 cursor-pointer"
                }`}
              >
                Yes
              </button>

              <button
                onClick={() => setSelected(2)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors duration-200 ${
                  selected === 2
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer"
                }`}
              >
                No
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:opacity-90 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVote}
                disabled={!selected}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-50 hover:opacity-90 cursor-pointer"
              >
                Vote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TxModal
        isOpen={showTx}
        onClose={handleCloseTx}
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
