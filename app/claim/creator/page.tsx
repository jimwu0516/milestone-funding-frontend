// app/claim/creator/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import TxModal from "@/components/TxModal";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useClaimableCreator, useClaimCreator } from "@/hooks/useContract";
import { useQueryClient } from "@tanstack/react-query";

export default function ClaimCreatorPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: claimable, refetch } = useClaimableCreator();
  const { claim, isPending, isConfirming, isSuccess, error, hash } =
    useClaimCreator();

  const [showTxModal, setShowTxModal] = useState(false);

  const handleClaim = () => {
    setShowTxModal(true);
    claim();
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      refetch();
    }
  };

  if (!mounted) return null;

  const amountEth =
    claimable !== undefined
      ? parseFloat(formatEther(claimable as bigint)).toFixed(6)
      : "0";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Claim Creator Funds
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your claimable amount: <strong>{amountEth} ETH</strong>
        </p>
        <button
          onClick={handleClaim}
          disabled={isPending || isConfirming || Number(amountEth) === 0}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isPending || isConfirming ? "Processing..." : "Claim"}
        </button>

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
      </main>
    </div>
  );
}
