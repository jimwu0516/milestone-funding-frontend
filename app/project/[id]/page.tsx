//app/project[id]/page.tsx
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
  0: "bg-indigo-800 text-indigo-200",
  1: "bg-orange-800 text-orange-200",
  2: "bg-pink-800 text-pink-200",
  3: "bg-emerald-800 text-emerald-200",
  4: "bg-teal-800 text-teal-200",
  5: "bg-purple-800 text-purple-200",
  6: "bg-yellow-800 text-yellow-900",
  7: "bg-rose-800 text-rose-200",
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

  type ProjectCore = [
    string, // creator
    string, // name
    string, // description
    number, // category
    bigint, // softCapWei
    bigint, // totalFunded
    bigint, // bond
    number, // state
  ];

  const { data, refetch: refetchCore } = useProjectCore(projectId);
  const projectCore = data as ProjectCore | undefined;

  const { data: investmentsData, refetch: refetchInvestments } =
    useAllInvestments(projectId);

  const investments = investmentsData as [string[], bigint[]] | undefined;

  const { data: milestoneDescriptionsData, isLoading: milestonesLoading } =
    useMilestoneDescriptions(projectId);

  const milestoneDescriptions = milestoneDescriptionsData as
    | string[]
    | undefined;

  const { fund, isPending, isConfirming, isSuccess, error, hash } =
    useFundProject();

  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const currentEmail = emailMap[address ?? ""] ?? "";

  useEffect(() => {
    if (!address || !projectId) return;

    const fetchEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/investorEmail?projectId=${projectId}&investor=${address}`,
        );
        const data = await res.json();
        if (data.email) {
          setEmailMap((prev) => ({ ...prev, [address]: data.email }));
        }
      } catch (err) {
        console.error("Failed to fetch investor email", err);
      }
    };

    fetchEmail();
  }, [address, projectId]);

  const currentIndex = projectCore ? Number(projectCore[7]) : 0;
  const currentState = states[currentIndex];

  useEffect(() => {
    if (!projectCore) return;

    const idx = Number(projectCore[7]);
    const stateNow = states[idx];

    if (prevState === "Funding" && stateNow === "BuildingStage1") {
      setShowBuildingModal(true);
    }

    setPrevState(stateNow);
  }, [projectCore, prevState]);

  if (!projectId) return <div>Invalid ProjectID</div>;
  if (!projectCore) return  
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>;

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
      .toFixed(5)
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

  const handleEmailChange = (value: string) => {
    if (!address) return;
    setEmailMap((prev) => ({ ...prev, [address]: value }));
  };

  const handleFund = async () => {
    if (!fundAmount || !projectId) return;
    if (!currentEmail || !currentEmail.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    try {
      const amount = parseEther(fundAmount);
      if (amount < parseEther("0.0001")) {
        alert("Minimum funding amount is 0.0001 ETH");
        return;
      }

      setShowInputModal(false);
      setShowTxModal(true);

      await fund(projectId, amount);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/registerInvestorEmail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: projectId.toString(),
            investor: address,
            email: currentEmail,
          }),
        },
      );

      const data = await res.json();
      if (!data.success) console.error("Failed to register email", data);

      await refetchCore?.();
      await refetchInvestments?.();
    } catch (err: any) {
      alert(err?.message || "ERROR");
    }
  };

  const categoryLabel = CATEGORY_LABELS[category] ?? `Category ${category}`;
  const baseButtonClass =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg transform hover:cursor-pointer";
  const categoryStyle =
    CATEGORY_STYLES[category] ?? "bg-gray-800 text-gray-200";

  const sortedInvestments = investments
    ? investments[0]
        .map((investor, index) => ({
          investor,
          amount: investments[1][index],
        }))
        .sort((a, b) => {
          if (a.amount === b.amount) return 0;
          return a.amount > b.amount ? -1 : 1;
        })
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      {/* Input Modal */}
      {showInputModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center px-4"
          onClick={() => setShowInputModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gray-850 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-90 animate-fadeIn"
          >
            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 className="text-2xl font-bold">Invest</h2>
              <p className="text-sm opacity-80 mt-1">
                Enter the amount of ETH you want to invest (min 0.0001)
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="relative">
                <input
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  max={formatEth(remaining)}
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder={`MAX: ${formatEth(remaining)} ETH`}
                  className="w-full px-4 py-3 pr-20 border rounded-lg bg-gray-950 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFundAmount(formatEth(remaining))}
                  disabled={remaining === BigInt(0)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 font-medium hover:underline disabled:opacity-50"
                >
                  Max
                </button>
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={currentEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Your email (for voting notifications)"
                  className="w-full px-4 py-3 border rounded-lg bg-gray-950 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFund}
                  className={`${baseButtonClass} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full`}
                >
                  Fund
                </button>
                <button
                  onClick={() => setShowInputModal(false)}
                  className={`${baseButtonClass} bg-gray-800 hover:bg-gray-700 text-white w-full`}
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
        errorMessage={error ? "Please try again" : undefined}
        buttonClass={baseButtonClass}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg font-medium hover:text-blue-400 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center flex-1 truncate">
            {name}
          </h1>

          <button
            onClick={handleFundClick}
            className={`${baseButtonClass} bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 from-blue-700 hover:to-purple-700 text-white`}
          >
            Fund
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 transition-all animate-gradient-x"
              style={{
                width: `${
                  softCapWei > BigInt(0)
                    ? Number((totalFunded * BigInt(100)) / softCapWei)
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-mono">
            <span>Total Funded</span>
            <span>
              {formatEth(totalFunded)} / {formatEth(softCapWei)} ETH
            </span>
          </div>
        </div>

        {/* About + Milestones */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* About */}
          <div className="flex-1 bg-gray-850 rounded-xl border border-gray-700 p-6 relative shadow-lg">
            <span
              className={`absolute top-4 right-4 rounded-full px-2 py-1 text-xs font-semibold ${categoryStyle}`}
            >
              {categoryLabel}
            </span>

            <h2 className="text-xl font-semibold mb-3">About this project</h2>
            <p className="text-gray-300 whitespace-pre-wrap mb-4">
              {description}
            </p>

            <h2 className="text-xl font-semibold mb-3">Creator</h2>
            <p
              onClick={() => router.push(`/creator/${creator}`)}
              className="text-blue-400 font-mono break-all cursor-pointer hover:underline"
            >
              {creator}
            </p>
          </div>

          {/* Milestones */}
          <div className="flex-1 flex gap-4 overflow-x-auto">
            {milestoneDescriptions?.map((desc, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[180px] bg-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-md"
              >
                <div className="text-sm text-gray-400 mb-4">
                  Milestone {idx + 1}
                </div>
                <div className="text-base font-semibold text-white">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Investors */}
        <div className="flex-1 overflow-auto bg-gray-850 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Investors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-white bg-gray-800 first:rounded-tl-xl last:rounded-tr-xl">
                    Address
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-white bg-gray-800 first:rounded-tl-xl last:rounded-tr-xl">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedInvestments.length > 0 ? (
                  sortedInvestments.map(({ investor, amount }, index) => {
                    const isLast = index === sortedInvestments.length - 1;
                    const percentage =
                      totalFunded > BigInt(0)
                        ? Number((amount * BigInt(100)) / totalFunded)
                        : 0;

                    return (
                      <tr
                        key={investor}
                        className="hover:bg-gray-800/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition cursor-pointer"
                      >
                        <td
                          className={`px-4 py-3 text-sm font-mono text-blue-400 cursor-pointer hover:underline ${
                            isLast ? "rounded-bl-xl" : ""
                          }`}
                          onClick={() => router.push(`/investor/${investor}`)}
                        >
                          <span className="block max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-full truncate">
                            {investor}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3 text-sm font-semibold text-white ${
                            isLast ? "rounded-br-xl" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-3 bg-blue-500 rounded-l-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono text-blue-500 whitespace-nowrap">
                              {formatEth(amount)} ETH
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm text-gray-400 text-center rounded-b-xl bg-gray-800"
                    >
                      No investor yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Building Modal */}
        {showBuildingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="bg-gray-850 rounded-xl p-6 text-center max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-semibold mb-3">🎉 Project Started</h3>
              <p className="text-gray-400 mb-6">
                This project has started building.
              </p>
              <button
                onClick={() => {
                  setShowBuildingModal(false);
                  router.push("/my-investments");
                }}
                className={`${baseButtonClass} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full`}
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