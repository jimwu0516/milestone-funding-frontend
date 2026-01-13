// app/my-projects/page.tsx
"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { parseEther, formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";

import Navbar from "@/components/Navbar";
import TxModal from "@/components/TxModal";
import { CancelProjectButton } from "@/components/CancelProjectButton";
import SubmitMilestoneModal from "@/components/SubmitMilestoneModal";
import CreateProjectForm from "@/components/CreateProjectForm";
import { useMyProjects } from "@/hooks/useMyProjects";
import {
  useProjectCore,
  useCreateProject,
  useCancelProject,
  useProjectMeta,
} from "@/hooks/useContract";
import { getProjectProgress } from "@/utils/projectProgress";
import { PROJECT_TIMELINE } from "@/constants/projectTimeline";
import ProjectPreviewModal from "@/components/ProjectPreviewModal";

export default function MyProjectsPage() {
  const { address, isConnected } = useAccount();
  const { projectIds, isLoading: idsLoading } = useMyProjects();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewProject, setPreviewProject] = useState<any | null>(null);

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
      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 overflow-hidden">
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
            setPreviewProject={setPreviewProject}
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
  setPreviewProject,
}: {
  projectIds: bigint[];
  userAddress: string;
  filter: "active" | "inactive";
  setPreviewProject: (p: any) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="overflow-y-auto max-h-[60vh] overscroll-contain">
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 w-[30%]">
                Project
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 w-[15%]">
                Target
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 w-[15%]">
                Funded
              </th>

              {filter === "active" ? (
                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 w-[15%]">
                  Progress
                </th>
              ) : (
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 w-[15%]">
                  Result
                </th>
              )}

              {filter === "active" && (
                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 w-[15%]">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {projectIds.map((id) => (
              <ProjectRow
                key={id.toString()}
                projectId={id}
                userAddress={userAddress}
                filter={filter}
                setPreviewProject={setPreviewProject}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectRow({
  projectId,
  userAddress,
  filter,
  setPreviewProject,
}: {
  projectId: bigint;
  userAddress: string;
  filter: "active" | "inactive";
  setPreviewProject: (p: any) => void;
}) {
  const { data, isLoading, error } = useProjectCore(projectId);
  const queryClient = useQueryClient();
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const {
    cancel,
    isPending,
    isConfirming,
    isSuccess,
    error: cancelError,
    hash,
  } = useCancelProject();

  if (isLoading)
    return (
      <tr>
        <td colSpan={filter === "active" ? 5 : 4} className="px-4 py-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        </td>
      </tr>
    );
  if (error || !data) return null;

  const [
    creator,
    name,
    description,
    category,
    softCapWei,
    totalFunded,
    bond,
    state,
  ] = data as [string, string, string, number, bigint, bigint, bigint, number];

  if (creator.toLowerCase() !== userAddress.toLowerCase()) return null;

  const activeStates = [1, 2, 3, 5, 6, 8, 9];
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
      <tr
        className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        onClick={() =>
          setPreviewProject({
            projectId,
            creator,
            name,
            description,
            category,
            softCapWei,
            totalFunded,
            state,
          })
        }
      >
        {/* Project */}
        <td className="px-5 py-4">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              #{projectId.toString()}
            </span>
          </div>
        </td>

        {/* Target */}
        <td className="px-5 py-4">
          <span className="font-medium text-gray-900 dark:text-white">
            {formatEth(softCapWei)} ETH
          </span>
        </td>

        {/* Funded */}
        <td className="px-5 py-4">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {formatEth(totalFunded)} ETH
          </span>
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
              {PROJECT_TIMELINE[state]}
            </span>
          </div>
        </td>

        {/* Action */}
        {filter === "active" && (
          <td className="px-5 py-4 text-center">
            <div className="flex items-center justify-center gap-2">
              {state === 1 ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <CancelProjectButton projectId={projectId} />
                </div>
              ) : state === 2 || state === 5 || state === 8 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMilestoneModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:scale-105 transition-all cursor-pointer"
                >
                  Submit
                </button>
              ) : (
                <span>-</span>
              )}
            </div>

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
