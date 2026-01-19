// app/claim/creator/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import TxModal from "@/components/TxModal";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useClaimableCreator, useClaimCreator } from "@/hooks/useContract";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ClaimCreatorPage() {
  const { address, isConnected } = useAccount();
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
    if (isSuccess) refetch();
  };

  if (!mounted) return null;

  const amountEth =
    claimable !== undefined
      ? parseFloat(formatEther(claimable as bigint)).toFixed(6)
      : "0";

  const isDisabled = isPending || isConfirming || Number(amountEth) === 0;

  if (!isConnected) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-gray-400">
        <Navbar />

        <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              Wallet Not Connected
            </h2>
            <p className="mb-6">
              Please connect your wallet to claim your funds.
            </p>

            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                openAccountModal,
                mounted,
              }) => {
                if (!mounted)
                  return (
                    <div className="h-10 w-32 rounded-lg animate-pulse bg-gray-700" />
                  );

                const connected = account && chain;

                return connected ? (
                  <button
                    onClick={openAccountModal}
                    className="h-10 px-6 rounded-lg bg-gray-800 text-purple-300 border border-purple-500/30 hover:bg-gray-700 hover:border-purple-400/50 transition-all font-medium"
                  >
                    {account.displayName}
                  </button>
                ) : (
                  <button
                    onClick={openConnectModal}
                    className="h-10 px-6 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 active:bg-purple-700 transition-colors shadow-sm"
                  >
                    Connect Wallet
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Navbar />

      <main className="flex items-center justify-center px-4 py-28">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Creator Claim
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Withdraw your earned funds
          </p>

          {/* Amount */}
          <div className="mt-8">
            <div className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Claimable Amount
            </div>
            <div className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">
              {amountEth}
              <span className="ml-2 text-lg font-medium text-gray-500">
                ETH
              </span>
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={isDisabled}
            className={`
              mt-10 w-full rounded-xl px-6 py-4 text-lg font-semibold
              transition-all duration-200
              ${
                isDisabled
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30 cursor-pointer"
              }
            `}
          >
            {isDisabled ? "No funds available to claim" : "Claim Funds"}
          </button>
        </div>

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
          errorMessage={
            error ? "Transaction failed. Please try again." : undefined
          }
        />
      </main>
    </div>
  );
}
