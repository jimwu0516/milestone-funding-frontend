// app/my-projects/page.tsx
"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";

import Navbar from "@/components/Navbar";
import TxModal from "@/components/TxModal";
import { CancelProjectButton } from "@/components/CancelProjectButton";
import SubmitMilestoneModal from "@/components/SubmitMilestoneModal";
import CreateProjectForm from "@/components/CreateProjectForm";
import { useMyProjects } from "@/hooks/useMyProjects";
import { useProjectCore, useCancelProject } from "@/hooks/useContract";
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
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const sortedProjectIds =
    projectIds && projectIds.length > 0
      ? [...projectIds].sort((a: bigint, b: bigint) => {
          const idA = Number(a);
          const idB = Number(b);
          return sortOrder === "desc" ? idB - idA : idA - idB;
        })
      : [];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-400">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 text-center">
          Please connect your wallet
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 overflow-hidden">
        <Header
          setShowCreateForm={setShowCreateForm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
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
            projectIds={sortedProjectIds}
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

/* ---------------- Header ---------------- */
function Header({
  setShowCreateForm,
  sortOrder,
  setSortOrder,
}: {
  setShowCreateForm: (v: boolean) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: "asc" | "desc") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-3xl font-bold">My Projects</h1>

      <div className="flex gap-3">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm hover:border-blue-500 transition"
        >
          <option value="desc">Project ID ↓</option>
          <option value="asc">Project ID ↑</option>
        </select>

        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          Create
        </button>
      </div>
    </div>
  );
}

/* ---------------- Filter Tabs ---------------- */
function FilterTabs({ filter, setFilter }: any) {
  const tabs: ("active" | "inactive")[] = ["active", "inactive"];
  return (
    <div className="flex border-b border-gray-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setFilter(tab)}
          className={`px-4 py-2 -mb-px font-medium border-b-2 transition-all ${
            filter === tab
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
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
    <div className="flex justify-center items-center py-12 text-gray-400">
      Loading...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-400">
      No projects have been created yet.
    </div>
  );
}

/* ---------------- Projects Table ---------------- */
function ProjectsTable({
  projectIds,
  userAddress,
  filter,
  setPreviewProject,
}: any) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-700 bg-gray-850">
      <div className="overflow-y-auto max-h-[60vh] overscroll-contain">
        <table className="min-w-full table-auto border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold uppercase text-gray-400 w-[30%]">
                Project
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold uppercase text-gray-400 w-[15%]">
                Target
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold uppercase text-gray-400 w-[15%]">
                Funded
              </th>
              <th className="px-5 py-4 text-sm font-semibold uppercase text-gray-400 w-[15%]">
                {filter === "active" ? "Progress" : "Result"}
              </th>
              {filter === "active" && (
                <th className="px-5 py-4 text-center text-sm font-semibold uppercase text-gray-400 w-[15%]">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {projectIds.map((id: bigint) => (
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

/* ---------------- Project Row ---------------- */
function ProjectRow({
  projectId,
  userAddress,
  filter,
  setPreviewProject,
}: any) {
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
          <div className="h-6 bg-gray-700 rounded w-full animate-pulse"></div>
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
        className="group hover:bg-gray-800 transition-all cursor-pointer"
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
        <td className="px-5 py-4">
          <div className="flex flex-col">
            <span className="font-semibold">{name}</span>
            <span className="text-xs text-gray-400">
              #{projectId.toString()}
            </span>
          </div>
        </td>

        <td className="px-5 py-4">
          <span className="font-medium">{formatEth(softCapWei)} ETH</span>
        </td>

        <td className="px-5 py-4">
          <span className="font-medium text-blue-400">
            {formatEth(totalFunded)} ETH
          </span>
        </td>

        <td className="px-5 py-4">
          <div className="flex flex-col gap-2">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`${progressColor} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 truncate">
              {PROJECT_TIMELINE[state]}
            </span>
          </div>
        </td>

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
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-all cursor-pointer"
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
