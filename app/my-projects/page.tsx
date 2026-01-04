// app/my-projects/page.tsx
"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { parseEther, formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";

import Navbar from "@/components/Navbar";
import TxModal from "@/components/TxModal";
import SubmitMilestoneModal from "@/components/SubmitMilestoneModal";
import CreateProjectForm from "@/components/CreateProjectForm";
import { useMyProjects } from "@/hooks/useMyProjects";
import {
  useProjectCore,
  useCreateProject,
  useCancelProject,
} from "@/hooks/useContract";
import { getProjectProgress } from "@/utils/projectProgress";

export default function MyProjectsPage() {
  const { address, isConnected } = useAccount();
  const { projectIds, isLoading: idsLoading } = useMyProjects();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Please connect your wallet
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Header setShowCreateForm={setShowCreateForm} />
        <FilterTabs filter={filter} setFilter={setFilter} />

        {showCreateForm && (
          <CreateProjectForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["myProjects"] });
              setShowCreateForm(false);
            }}
          />
        )}

        {idsLoading ? (
          <LoadingState />
        ) : projectIds && projectIds.length > 0 ? (
          <ProjectsTable
            projectIds={projectIds}
            userAddress={address!}
            filter={filter}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

/* -------------------- Components -------------------- */

function Header({
  setShowCreateForm,
}: {
  setShowCreateForm: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        My Projects
      </h1>
      <button
        onClick={() => setShowCreateForm(true)}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
      >
        Create
      </button>
    </div>
  );
}

function FilterTabs({
  filter,
  setFilter,
}: {
  filter: "active" | "inactive";
  setFilter: (v: "active" | "inactive") => void;
}) {
  const tabs: ("active" | "inactive")[] = ["active", "inactive"];
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

function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12 text-gray-600 dark:text-gray-400">
      Loading...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-600 dark:text-gray-400">
      No projects have been created yet.
    </div>
  );
}

/* -------------------- Projects Table -------------------- */

function ProjectsTable({
  projectIds,
  userAddress,
  filter,
}: {
  projectIds: bigint[];
  userAddress: string;
  filter: "active" | "inactive";
}) {
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
            {filter === "active" ? (
              <>
                <th className="px-4 py-2 text-gray-900 dark:text-white">
                  State
                </th>
                <th className="px-4 py-2 text-gray-900 dark:text-white">
                  Action
                </th>
              </>
            ) : (
              <th className="px-4 py-2 text-gray-900 dark:text-white">State</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {projectIds.map((id) => (
            <ProjectRow
              key={id.toString()}
              projectId={id}
              userAddress={userAddress}
              filter={filter}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectRow({
  projectId,
  userAddress,
  filter,
}: {
  projectId: bigint;
  userAddress: string;
  filter: "active" | "inactive";
}) {
  const { data, isLoading, error } = useProjectCore(projectId);
  const {
    cancel,
    isPending,
    isConfirming,
    isSuccess,
    error: cancelError,
    hash,
  } = useCancelProject();
  const queryClient = useQueryClient();
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  if (isLoading)
    return (
      <tr>
        <td colSpan={filter === "active" ? 5 : 4} className="px-4 py-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </td>
      </tr>
    );
  if (error || !data) return null;

  const [creator, name, , softCapWei, totalFunded, , state] = data;
  if (creator.toLowerCase() !== userAddress.toLowerCase()) return null;

  const activeStates = [
    "Funding",
    "BuildingStage1",
    "VotingRound1",
    "BuildingStage2",
    "VotingRound2",
    "BuildingStage3",
    "VotingRound3",
  ];

  const isActive = activeStates.includes(state);
  if ((filter === "active" && !isActive) || (filter === "inactive" && isActive))
    return null;

  const { percent: progressPercent, color: progressColor } =
    getProjectProgress(state);

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(8)
      .replace(/\.?0+$/, "");

  const handleCancel = async () => {
    setShowTxModal(true);
    try {
      await cancel(projectId);
    } catch {
      alert("Error");
      setShowTxModal(false);
    }
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["myProjects"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
          {name}
        </td>
        <td className="px-4 py-3 text-gray-900 dark:text-white">
          {formatEth(softCapWei)} ETH
        </td>
        <td className="px-4 py-3 text-gray-900 dark:text-white">
          {formatEth(totalFunded)} ETH
        </td>

        <td className="px-4 py-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className={`${progressColor} h-4 rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {state}
          </div>
        </td>

        {filter === "active" && (
          <td className="px-4 py-3 flex gap-2">
            {state === "Funding" && (
              <button
                onClick={handleCancel}
                disabled={isPending || isConfirming}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm cursor-pointer disabled:opacity-50"
              >
                {isPending || isConfirming ? "Canceling..." : "Cancel"}
              </button>
            )}
            {state.includes("Building") && (
              <button
                onClick={() => setShowMilestoneModal(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm cursor-pointer"
              >
                Submit Milestone
              </button>
            )}
            {showMilestoneModal && (
              <SubmitMilestoneModal
                projectId={projectId}
                onClose={() => setShowMilestoneModal(false)}
              />
            )}
          </td>
        )}
      </tr>

      <TxModal
        isOpen={showTxModal}
        onClose={handleCloseTxModal}
        status={
          cancelError
            ? "error"
            : isSuccess
            ? "success"
            : isConfirming
            ? "confirming"
            : "pending"
        }
        hash={hash || null}
        errorMessage={cancelError ? "Try again" : undefined}
      />
    </>
  );
}
