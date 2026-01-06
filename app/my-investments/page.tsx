// app/my-investments/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import Navbar from "@/components/Navbar";
import VoteModal from "@/components/VoteModal";
import { useMyInvestments } from "@/hooks/useMyInvestments";
import { useProjectVoting, useMyVotes } from "@/hooks/useContract";
import { getProjectProgress } from "@/utils/projectProgress";

export default function MyInvestmentsPage() {
  const { isConnected } = useAccount();
  const {
    investments,
    isLoading,
    refetch: refetchInvestments,
  } = useMyInvestments();
  const [filter, setFilter] = useState<"ongoing" | "voting" | "history">(
    "ongoing"
  );
  const [mounted, setMounted] = useState(false);

  const prevStatesRef = useRef<Record<bigint, string>>({});
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageMessage, setStageMessage] = useState("");

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<bigint | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!investments || investments.length === 0) return;

    investments.forEach((inv) => {
      const prev = prevStatesRef.current[inv.projectId] || inv.state;
      const current = inv.state;

      if (prev !== current) {
        if (prev.startsWith("VotingRound") && current === "Completed") {
          setStageMessage("This project Completed");
          setFilter("history");
          setShowStageModal(true);
        } else if (
          prev.startsWith("VotingRound") &&
          ["BuildingStage2", "BuildingStage3"].includes(current)
        ) {
          setStageMessage("This project has been moved to next stage");
          setFilter("ongoing");
          setShowStageModal(true);
        } else if (
          prev.startsWith("VotingRound") &&
          ["FailureRound1", "FailureRound2", "FailureRound3"].includes(current)
        ) {
          setStageMessage("This round did not pass, please claim your refund");
          setFilter("history");
          setShowStageModal(true);
        }
      }

      prevStatesRef.current[inv.projectId] = inv.state;
    });
  }, [investments]);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-600 dark:text-gray-400">
          Please connect your wallet
        </main>
      </div>
    );
  }

  // --- Filter definitions ---
  const FILTER_STATES = {
    ongoing: ["Funding", "BuildingStage1", "BuildingStage2", "BuildingStage3"],
    voting: ["VotingRound1", "VotingRound2", "VotingRound3"],
    history: [
      "Cancelled",
      "Completed",
      "FailureRound1",
      "FailureRound2",
      "FailureRound3",
    ],
  } as const;

  const filteredInvestments = investments.filter((inv) =>
    FILTER_STATES[filter].includes(inv.state)
  );

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(8)
      .replace(/\.?0+$/, "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      {showStageModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {stageMessage}
            </h3>
            <button
              onClick={() => setShowStageModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:scale-105 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          My Investments
        </h1>

        <FilterTabs filter={filter} setFilter={setFilter} />

        {isLoading ? (
          <div className="text-gray-600 dark:text-gray-400 py-12">
            Loading...
          </div>
        ) : filteredInvestments.length > 0 ? (
          <ProjectsTable
            investments={filteredInvestments}
            formatEth={formatEth}
            setSelectedProject={setSelectedProject}
            setSelectedMilestone={setSelectedMilestone}
            setShowVoteModal={setShowVoteModal}
            isVoting={filter === "voting"}
            isOngoing={filter === "ongoing"}
          />
        ) : (
          <div className="text-gray-600 dark:text-gray-400 py-12">
            No investments found.
          </div>
        )}

        {showVoteModal && selectedProject !== null && (
          <VoteModal
            projectId={selectedProject}
            milestoneIndex={selectedMilestone}
            onClose={() => setShowVoteModal(false)}
            onSuccess={() => {
              refetchInvestments();
            }}
          />
        )}
      </main>
    </div>
  );
}

// --- Filter tabs component ---
function FilterTabs({
  filter,
  setFilter,
}: {
  filter: "ongoing" | "voting" | "history";
  setFilter: (v: "ongoing" | "voting" | "history") => void;
}) {
  const tabs: ("ongoing" | "voting" | "history")[] = [
    "ongoing",
    "voting",
    "history",
  ];
  return (
    <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setFilter(tab)}
          className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors cursor-pointer ${
            filter === tab
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}

// --- Projects Table ---
function ProjectsTable({
  investments,
  formatEth,
  setSelectedProject,
  setSelectedMilestone,
  setShowVoteModal,
  isVoting,
  isOngoing,
}: {
  investments: ReturnType<typeof useMyInvestments>["investments"];
  formatEth: (amount: bigint | string) => string;
  setSelectedProject: (id: bigint) => void;
  setSelectedMilestone: (index: number) => void;
  setShowVoteModal: (v: boolean) => void;
  isVoting: boolean;
  isOngoing: boolean;
}) {
  const timeline = [
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
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <th className="px-4 py-3 text-left text-gray-900 dark:text-white w-[30%]">
              Title
            </th>
            {isOngoing && (
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white w-[15%]">
                Target
              </th>
            )}
            <th className="px-4 py-3 text-left text-gray-900 dark:text-white w-[15%]">
              Total Funded
            </th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-white w-[15%]">
              My Investment
            </th>
            <th className="px-4 py-3 text-left text-gray-900 dark:text-white w-[15%]">
              State
            </th>
            {isVoting && (
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white w-[15%]">
                Voting Status
              </th>
            )}
            {isVoting && (
              <th className="px-4 py-3 text-center text-gray-900 dark:text-white w-[10%]">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {investments.map((inv) => (
            <InvestmentRow
              key={inv.projectId.toString()}
              inv={inv}
              timeline={timeline}
              formatEth={formatEth}
              setSelectedProject={setSelectedProject}
              setSelectedMilestone={setSelectedMilestone}
              setShowVoteModal={setShowVoteModal}
              isVoting={isVoting}
              isOngoing={isOngoing}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Investment Row ---
function InvestmentRow({
  inv,
  timeline,
  formatEth,
  setSelectedProject,
  setSelectedMilestone,
  setShowVoteModal,
  isVoting,
  isOngoing,
}: any) {
  const { address: userAddress } = useAccount();

  const { data: myVotes, isLoading: myVotesLoading } = useMyVotes(
    inv.projectId,
    userAddress
  );
  const { data: votingData } = useProjectVoting(inv.projectId);

  const { percent: progressPercent, color: progressColor } = getProjectProgress(
    inv.state
  );

  const milestoneIndex = inv.state.includes("VotingRound")
    ? Number(inv.state.replace("VotingRound", "")) - 1
    : null;

  let hasVoted = false;
  if (!myVotesLoading && milestoneIndex !== null && Array.isArray(myVotes)) {
    const voteValue = myVotes[milestoneIndex];
    if (voteValue !== undefined && voteValue !== null) {
      let voteBigInt: bigint;
      if (typeof voteValue === "bigint") voteBigInt = voteValue;
      else if (typeof voteValue === "object" && "_hex" in voteValue)
        voteBigInt = BigInt(voteValue._hex);
      else voteBigInt = BigInt(voteValue);
      hasVoted = voteBigInt !== 0n;
    }
  }

  const yesWeight =
    votingData && milestoneIndex !== null ? votingData[2][milestoneIndex] : 0n;
  const noWeight =
    votingData && milestoneIndex !== null ? votingData[3][milestoneIndex] : 0n;

  const yes = Number(yesWeight);
  const no = Number(noWeight);
  const sum = yes + no;
  const yesPercent = sum > 0 ? (yes / sum) * 100 : 0;
  const noPercent = sum > 0 ? (no / sum) * 100 : 0;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
        {inv.name}
      </td>
      {isOngoing && (
        <th className="px-4 py-2 text-gray-900 dark:text-white">
          {formatEth(inv.softCapWei)} ETH
        </th>
      )}
      <td className="px-4 py-3 text-gray-900 dark:text-white">
        {formatEth(inv.totalFunded)} ETH
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-white">
        {formatEth(inv.invested)} ETH
      </td>
      <td className="px-4 py-3">
        <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className={`${progressColor} h-4 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
          {inv.state}
        </div>
      </td>

      {isVoting && (
        <td className="px-4 py-3 text-center">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-900 shadow-inner">
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
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-green-600 dark:text-green-400">Yes</span>
            <span className="text-red-600 dark:text-red-400">No</span>
          </div>
        </td>
      )}

      {isVoting && (
        <td className="px-4 py-3 text-center">
          {myVotesLoading ? (
            "Loading..."
          ) : hasVoted ? (
            myVotes[milestoneIndex] === 1 ? (
              <span className="text-green-600 font-semibold">Yes</span>
            ) : (
              <span className="text-red-600 font-semibold">No</span>
            )
          ) : (
            <button
              onClick={() => {
                setSelectedProject(inv.projectId);
                setSelectedMilestone(milestoneIndex);
                setShowVoteModal(true);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm cursor-pointer"
            >
              Vote
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
