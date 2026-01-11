// app/project/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TxModal from "@/components/TxModal";
import {
  useProjectCore,
  useAllInvestments,
  useFundProject,
  useMilestoneDescriptions,
} from "@/hooks/useContract";

const CATEGORY_LABELS = [
  "Technology",
  "Hardware",
  "Creative",
  "Education",
  "SocialImpact",
  "Research",
  "Business",
  "Community",
];

const CATEGORY_STYLES: Record<number, string> = {
  0: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  1: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  2: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  3: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  4: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  5: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  6: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  7: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id ? BigInt(params.id as string) : undefined;
  const { address } = useAccount();

  const [showInputModal, setShowInputModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [prevState, setPrevState] = useState<string | null>(null);

  const states = [
    "Cancelled",
    "Funding",
    "BuildingStage1",
    "VotingRound1",
    "FailureRound1",
    "BuildingStage2",
    "VotingRound2",
    "FailureRound2",
    "BuildingStage3",
    "VotingRound3",
    "FailureRound3",
    "Completed",
  ];

  const {
    data: projectCore,
    isLoading: coreLoading,
    refetch: refetchCore,
  } = useProjectCore(projectId);

  const { data: investments, refetch: refetchInvestments } =
    useAllInvestments(projectId);

  const { data: milestoneDescriptions, isLoading: milestonesLoading } =
    useMilestoneDescriptions(projectId);

  const { fund, isPending, isConfirming, isSuccess, error, hash } =
    useFundProject();

  useEffect(() => {
    if (!projectCore) return;

    const currentIndex = Number(projectCore[7]);
    const currentState = states[currentIndex];

    const prevIndex = prevState !== null ? states.indexOf(prevState) : null;

    if (prevState === "Funding" && currentState === "BuildingStage1") {
      setShowBuildingModal(true);
    }

    setPrevState(currentState);
  }, [projectCore]);

  if (!projectId) return <div>Invalid ProjectID</div>;
  if (coreLoading || !projectCore) return <div>Loading...</div>;

  const [
    creator,
    name,
    description,
    category,
    softCapWei,
    totalFunded,
    bond,
    state,
  ] = projectCore;

  const remaining =
    softCapWei > totalFunded ? softCapWei - totalFunded : BigInt(0);

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(8)
      .replace(/\.?0+$/, "");

  const handleFundClick = () => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }
    setFundAmount("");
    setShowInputModal(true);
    setShowTxModal(false);
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      refetchCore?.();
      refetchInvestments?.();
    }
  };

  const handleFund = async () => {
    if (!fundAmount || !projectId) return;
    try {
      const amount = parseEther(fundAmount);
      if (amount <= 0) {
        alert("Value should be greater than 0");
        return;
      }
      setShowInputModal(false);
      setShowTxModal(true);

      await fund(projectId, amount);
      await refetchCore?.();
    } catch (err: any) {
      alert(err?.message || "ERROR");
    }
  };

  const categoryLabel = CATEGORY_LABELS[category] ?? `Category ${category}`;

  const baseButtonClass =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover:scale-105 cursor-pointer";

  const categoryStyle =
    CATEGORY_STYLES[category] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Input Modal */}
      {showInputModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
          onClick={() => setShowInputModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl transform transition-all duration-300 scale-90 opacity-0 animate-fadeIn relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Invest (ETH)</h3>

            <div className="relative mb-6">
              <input
                type="number"
                min={0}
                step="0.0001"
                max={formatEth(remaining)}
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder={`MAX: ${formatEth(remaining)} ETH`}
                className="w-full px-4 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setFundAmount(formatEth(remaining))}
                disabled={remaining === BigInt(0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
              >
                Max
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleFund}
                className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700 text-white w-full`}
              >
                Fund
              </button>
              <button
                onClick={() => setShowInputModal(false)}
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
        errorMessage={error ? "Please try again" : undefined}
        buttonClass={baseButtonClass}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center flex-1">
            {name}
          </h1>
          <button
            onClick={handleFundClick}
            className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            Fund
          </button>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-4 rounded-full transition-all"
              style={{
                width: `${
                  softCapWei > BigInt(0)
                    ? Number((totalFunded * BigInt(100)) / softCapWei)
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Funded</span>
            <span>
              {formatEth(totalFunded)} / {formatEth(softCapWei)} ETH
            </span>
          </div>
        </div>

        {/* About + Milestones */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* About */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 break-words relative">
            {/* Category */}
            <span
              className={`absolute top-4 right-4 rounded-full px-2 py-1 text-xs font-semibold ${categoryStyle}`}
            >
              {categoryLabel}
            </span>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              About this project
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
              {description}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Creator
            </h2>
            <p className="text-gray-700 dark:text-gray-300 font-mono break-all">
              {creator}
            </p>
          </div>

          {/* Milestones */}
          <div className="flex-1 flex gap-4">
            {milestonesLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Loading milestones...
              </div>
            ) : (
              milestoneDescriptions?.map((desc, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex flex-col justify-start items-center text-center"
                  style={{ minHeight: "100%" }}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Milestone {idx + 1}
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {desc}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Investors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    Address
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {investments && investments[0]?.length > 0 ? (
                  investments[0].map((investor, index) => (
                    <tr
                      key={investor}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                        {investor}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold">
                        {formatEth(investments[1][index])} ETH
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center"
                    >
                      No investor yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showBuildingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center max-w-sm w-full shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                🎉 Project Started
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This project start building.
              </p>
              <button
                onClick={() => {
                  setShowBuildingModal(false);
                  router.push("/my-investments");
                }}
                className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700 text-white w-full`}
              >
                Go to My Investments
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
