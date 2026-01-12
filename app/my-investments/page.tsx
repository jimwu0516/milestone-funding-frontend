"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import Navbar from "@/components/Navbar";
import VoteModal from "@/components/VoteModal";
import {
  useMyInvestments,
  useProjectVoting,
  useMyVotes,
} from "@/hooks/useContract";
import { getProjectProgress } from "@/utils/projectProgress";
import { PROJECT_TIMELINE, ProjectState } from "@/constants/projectTimeline";
import ProjectPreviewModal from "@/components/ProjectPreviewModal";

export default function MyInvestmentsPage() {
  const { isConnected, address: userAddress } = useAccount();
  const {
    investments,
    isLoading,
    refetch: refetchInvestments,
  } = useMyInvestments();
  const [filter, setFilter] = useState<"ongoing" | "voting" | "history">(
    "ongoing"
  );
  const [mounted, setMounted] = useState(false);

  const prevStatesRef = useRef<Record<bigint, number>>({});
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageMessage, setStageMessage] = useState("");

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<bigint | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);
  const [previewProject, setPreviewProject] = useState<any | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!investments || investments.length === 0) return;

    const VOTING_STATES = [3, 6, 9];

    investments.forEach((inv) => {
      const prev = prevStatesRef.current[inv.projectId] ?? inv.state;
      const current = inv.state;

      if (prev !== current) {
        if (VOTING_STATES.includes(prev) && current === 11) {
          setStageMessage("This project Completed");
          setFilter("history");
          setShowStageModal(true);
        } else if (VOTING_STATES.includes(prev) && [5, 8].includes(current)) {
          setStageMessage("This project has been moved to next stage");
          setFilter("ongoing");
          setShowStageModal(true);
        } else if (
          VOTING_STATES.includes(prev) &&
          [4, 7, 10].includes(current)
        ) {
          setStageMessage("This round did not pass, please claim your refund");
          setFilter("history");
          setShowStageModal(true);
        }
      }

      prevStatesRef.current[inv.projectId] = current;
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

  // --- Filter states ---
  const FILTER_STATES = {
    ongoing: [1, 2, 5, 8],
    voting: [3, 6, 9],
    history: [0, 11, 4, 7, 10],
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 h-screen flex flex-col overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          My Investments
        </h1>
        <FilterTabs filter={filter} setFilter={setFilter} />
        {isLoading ? (
          <div className="text-gray-600 dark:text-gray-400 py-12">
            Loading...
          </div>
        ) : filteredInvestments.length > 0 ? (
          <div className="flex-1 min-h-0">
            <ProjectsTable
              investments={filteredInvestments}
              formatEth={formatEth}
              setSelectedProject={setSelectedProject}
              setSelectedMilestone={setSelectedMilestone}
              setShowVoteModal={setShowVoteModal}
              setPreviewProject={setPreviewProject}
              isVoting={filter === "voting"}
              isOngoing={filter === "ongoing"}
              userAddress={userAddress!}
            />
          </div>
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
            onSuccess={() => refetchInvestments()}
          />
        )}

        {previewProject && (
          <ProjectPreviewModal
            project={previewProject}
            onClose={() => setPreviewProject(null)}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------- Filter Tabs ---------------- */
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

/* ---------------- Projects Table ---------------- */
function ProjectsTable({
  investments,
  formatEth,
  setSelectedProject,
  setSelectedMilestone,
  setShowVoteModal,
  setPreviewProject,
  isVoting,
  isOngoing,
  userAddress,
}: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="min-w-full border-collapse table-auto">
            <thead className="sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[30%]">
                  Project/Creator
                </th>

                {isOngoing && (
                  <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                    Target
                  </th>
                )}

                <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                  Total Funded
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                  My Investment
                </th>

                {isOngoing || isVoting ? (
                  <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                    Progress
                  </th>
                ) : (
                  <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                    Result
                  </th>
                )}

                {isVoting && (
                  <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                    Voting
                  </th>
                )}

                {isVoting && (
                  <th className="px-5 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[10%]">
                    Vote
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {investments.map((inv: any) => (
                <InvestmentRow
                  key={inv.projectId.toString()}
                  inv={inv}
                  formatEth={formatEth}
                  setSelectedProject={setSelectedProject}
                  setSelectedMilestone={setSelectedMilestone}
                  setShowVoteModal={setShowVoteModal}
                  setPreviewProject={setPreviewProject}
                  isVoting={isVoting}
                  isOngoing={isOngoing}
                  userAddress={userAddress}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Investment Row ---------------- */
function InvestmentRow({
  inv,
  formatEth,
  setSelectedProject,
  setSelectedMilestone,
  setShowVoteModal,
  setPreviewProject,
  isVoting,
  isOngoing,
  userAddress,
}: any) {
  const { data: myVotes, isLoading: myVotesLoading } = useMyVotes(
    inv.projectId,
    userAddress
  );
  const { data: votingData } = useProjectVoting(inv.projectId);

  const { percent: progressPercent, color: progressColor } = getProjectProgress(
    inv.state
  );

  const milestoneIndex =
    inv.state === 3 ? 0 : inv.state === 6 ? 1 : inv.state === 9 ? 2 : null;

  const hasVoted =
    !myVotesLoading &&
    milestoneIndex !== null &&
    Array.isArray(myVotes) &&
    BigInt(myVotes[milestoneIndex] ?? 0n) !== 0n;

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
    <tr
      className="group hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors "
      onClick={() => setPreviewProject(inv)}
    >
      {/* Project */}
      <td className="px-5 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {inv.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {inv.creator}
          </span>
        </div>
      </td>

      {/* Target */}
      {isOngoing && (
        <td className="px-5 py-4">
          <span className="font-medium text-gray-900 dark:text-white">
            {formatEth(inv.softCapWei)} ETH
          </span>
        </td>
      )}

      {/* Total Funded */}
      <td className="px-5 py-4">
        <span className="font-medium text-gray-900 dark:text-white">
          {formatEth(inv.totalFunded)} ETH
        </span>
      </td>

      {/* My Investment */}
      <td className="px-5 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {formatEth(inv.invested)} ETH
          </span>
        </div>
      </td>

      {/* Progress */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`${progressColor} h-2 rounded-full transition-all duration-700`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {PROJECT_TIMELINE[inv.state]}
          </span>
        </div>
      </td>

      {/* Voting status */}
      {isVoting && (
        <td className="px-5 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              {yesPercent > 0 && (
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${yesPercent}%` }}
                />
              )}
              {noPercent > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${noPercent}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400">
                Yes {yesPercent.toFixed(0)}%
              </span>
              <span className="text-red-600 dark:text-red-400">
                No {noPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </td>
      )}

      {/* Action */}
      {isVoting && (
        <td className="px-5 py-4 text-center">
          {myVotesLoading ? (
            <span className="text-xs text-gray-400">Loading...</span>
          ) : hasVoted ? (
            myVotes[milestoneIndex] === 1 ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                ✔ Yes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
                ✖ No
              </span>
            )
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProject(inv.projectId);
                setSelectedMilestone(milestoneIndex);
                setShowVoteModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:scale-105 transition-all hover:cursor-pointer"
            >
              Vote
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
