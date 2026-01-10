//components/VoteModal.tsx
"use client";

import { useState, useEffect } from "react";
import TxModal from "./TxModal";
import { useProjectMeta, useProjectVoting, useVote } from "@/hooks/useContract";
import { useAccount } from "wagmi";
import { useMyVotes } from "@/hooks/useContract";

type VoteModalProps = {
  projectId: bigint;
  milestoneIndex: number; // VotingRound1 => 0, VotingRound2 => 1, VotingRound3 => 2
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

  const [selected, setSelected] = useState<1 | 2 | null>(null);
  const [showTx, setShowTx] = useState(false);

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

  const snapshotTotalWeight =
    votingData && Array.isArray(votingData) ? votingData[1] : 0n;

  const yesWeight =
    roundIndex !== null && yesWeights ? yesWeights[roundIndex] ?? 0n : 0n;

  const noWeight =
    roundIndex !== null && noWeights ? noWeights[roundIndex] ?? 0n : 0n;

  const yes = Number(yesWeight);
  const no = Number(noWeight);

  const sum = yes + no;

  const yesPercent = sum > 0 ? (yes / sum) * 100 : 0;
  const noPercent = sum > 0 ? (no / sum) * 100 : 0;

  const { address } = useAccount();

  const { refetch: refetchMyVotes } = useMyVotes(projectId, address);

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

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Vote on Milestone
          </h2>

          {milestoneCID ? (
            <img
              src={`https://gateway.pinata.cloud/ipfs/${milestoneCID}`}
              alt={`Milestone ${milestoneIndex + 1}`}
              className="mb-4 rounded object-cover w-full h-64"
            />
          ) : (
            <div className="mb-4 text-gray-600 dark:text-gray-400 h-64 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded">
              No milestone image
            </div>
          )}

          <div className="mb-4">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-900">
              {/* YES - green */}
              {yesPercent > 0 && (
                <div
                  className="bg-green-600 transition-all"
                  style={{ width: `${yesPercent}%` }}
                />
              )}

              {/* NO - red */}
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

          <div className="flex gap-4 mb-4">
            {/* YES */}
            <button
              onClick={() => setSelected(1)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-200
      ${
        selected === 1
          ? "bg-green-600 text-white"
          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-green-100 dark:hover:bg-green-900/40 hover:cursor-pointer"
      }
    `}
            >
              Yes
            </button>

            {/* NO */}
            <button
              onClick={() => setSelected(2)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-200
      ${
        selected === 2
          ? "bg-red-600 text-white"
          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900/40 hover:cursor-pointer"
      }
    `}
            >
              No
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={!selected}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:cursor-pointer"
            >
              Vote
            </button>
          </div>
        </div>
      </div>

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
