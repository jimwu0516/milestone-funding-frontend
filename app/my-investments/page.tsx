// app/my-investments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import Navbar from "@/components/Navbar";
import VoteModal from "@/components/VoteModal";
import { useMyInvestments } from "@/hooks/useMyInvestments";
import { useProjectVoting, useMyVotes } from "@/hooks/useContract";

export default function MyInvestmentsPage() {
  const { isConnected } = useAccount();
  const { investments, isLoading } = useMyInvestments();
  const [filter, setFilter] = useState<"ongoing" | "voting" | "history">(
    "ongoing"
  );
  const [mounted, setMounted] = useState(false);

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<bigint | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);

  useEffect(() => setMounted(true), []);
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

  const ongoingStates = [
    "Funding",
    "BuildingStage1",
    "BuildingStage2",
    "BuildingStage3",
  ];
  const votingStates = ["VotingRound1", "VotingRound2", "VotingRound3"];
  const historyStates = [
    "Cancelled",
    "Completed",
    "FailureRound1",
    "FailureRound2",
    "FailureRound3",
  ];

  const filteredInvestments = investments.filter((inv) => {
    if (filter === "ongoing") return ongoingStates.includes(inv.state);
    if (filter === "voting") return votingStates.includes(inv.state);
    return historyStates.includes(inv.state);
  });

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(8)
      .replace(/\.?0+$/, "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
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
          />
        )}
      </main>
    </div>
  );
}

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

function ProjectsTable({
  investments,
  formatEth,
  setSelectedProject,
  setSelectedMilestone,
  setShowVoteModal,
  isVoting,
}: {
  investments: ReturnType<typeof useMyInvestments>["investments"];
  formatEth: (amount: bigint | string) => string;
  setSelectedProject: (id: bigint) => void;
  setSelectedMilestone: (index: number) => void;
  setShowVoteModal: (v: boolean) => void;
  isVoting: boolean;
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
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <th className="px-4 py-2 text-gray-900 dark:text-white">Title</th>
            <th className="px-4 py-2 text-gray-900 dark:text-white">Target</th>
            <th className="px-4 py-2 text-gray-900 dark:text-white">
              Total Funded
            </th>
            <th className="px-4 py-2 text-gray-900 dark:text-white">
              My Investment
            </th>
            <th className="px-4 py-2 text-gray-900 dark:text-white">State</th>

            {isVoting && (
              <th className="px-4 py-2 text-gray-900 dark:text-white">
                Voting Status
              </th>
            )}
            <th className="px-4 py-2 text-gray-900 dark:text-white">Action</th>
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvestmentRow({
  inv,
  timeline,
  formatEth,
  setSelectedProject,
  setSelectedMilestone,
  setShowVoteModal,
  isVoting,
}: any) {
  const { data: myVotes, isLoading: myVotesLoading } = useMyVotes(
    inv.projectId
  );
  const { data: votingData } = useProjectVoting(inv.projectId);

  const stageIndex = timeline.indexOf(inv.state);
  const progressPercent =
    stageIndex >= 0 ? ((stageIndex + 1) / timeline.length) * 100 : 0;

  let progressColor = "bg-blue-600";
  if (inv.state === "Cancelled") progressColor = "bg-gray-400";
  else if (inv.state === "Completed") progressColor = "bg-green-600";

  const milestoneIndex = inv.state.includes("VotingRound")
    ? Number(inv.state.replace("VotingRound", "")) - 1
    : null;

  let hasVoted = false;

  if (!myVotesLoading && milestoneIndex !== null && myVotes) {
    const voteRaw = Array.isArray(myVotes)
      ? myVotes[milestoneIndex]
      : myVotes[milestoneIndex.toString()];
    hasVoted = BigInt(voteRaw) !== 0n;
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
      <td className="px-4 py-3 text-gray-900 dark:text-white">
        {formatEth(inv.softCapWei)} ETH
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-white">
        {formatEth(inv.totalFunded)} ETH
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-white">
        {formatEth(inv.invested)} ETH
      </td>
      <td className="px-4 py-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={`${progressColor} h-4 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {inv.state}
        </div>
      </td>

      {isVoting && (
        <td className="px-4 py-3">
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
        </td>
      )}

      <td className="px-4 py-3 text-center">
        {inv.state.includes("VotingRound") ? (
          hasVoted ? (
            "-"
          ) : (
            <button
              onClick={() => {
                setSelectedProject(inv.projectId);
                setSelectedMilestone(milestoneIndex);
                setShowVoteModal(true);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Vote
            </button>
          )
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}
