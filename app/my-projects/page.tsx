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
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function MyProjectsPage() {
  const { address, isConnected } = useAccount();
  const { activeIds, inactiveIds, isLoading: idsLoading } = useMyProjects();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewProject, setPreviewProject] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentIds = filter === "active" ? activeIds : inactiveIds;

  const sortedProjectIds = [...currentIds].sort((a: bigint, b: bigint) => {
    const idA = Number(a);
    const idB = Number(b);
    return sortOrder === "desc" ? idB - idA : idA - idB;
  });

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
              Please connect your wallet to view your created projects.
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
                    className="h-10 px-6 rounded-lg bg-gray-800 text-purple-300 border border-purple-500/30 hover:bg-gray-700 transition-all font-medium"
                  >
                    {account.displayName}
                  </button>
                ) : (
                  <button
                    onClick={openConnectModal}
                    className="h-10 px-6 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors shadow-sm"
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
              queryClient.invalidateQueries({ queryKey: ["readContract"] });
              setFilter("active");
              setShowCreateForm(false);
            }}
          />
        )}

        {idsLoading ? (
          <LoadingState />
        ) : sortedProjectIds.length > 0 ? (
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
function Header({ setShowCreateForm, sortOrder, setSortOrder }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-3xl font-bold">My Projects</h1>
      <div className="flex gap-3">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          Create new project
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
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Fetching your projects...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-400  rounded-2xl border border-dashed border-gray-700">
      No projects found in this category.
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
    isConfirming,
    isSuccess,
    error: cancelError,
    hash,
  } = useCancelProject();

  if (isLoading)
    return (
      <tr>
        <td colSpan={filter === "active" ? 5 : 4} className="px-4 py-6">
          <div className="h-6 bg-gray-700 rounded w-full animate-pulse" />
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
  ] = data as any;

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(5)
      .replace(/\.?0+$/, "");

  const { percent: progressPercent, color: progressColor } =
    getProjectProgress(state);

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  };

  return (
    <>
      <tr
        className="group hover:bg-gray-800 transition-all cursor-pointer"
        onClick={() => {
          if (showMilestoneModal) return;
          setPreviewProject({
            projectId,
            creator,
            name,
            description,
            category,
            softCapWei,
            totalFunded,
            state,
          });
        }}
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
              ) : [2, 5, 8].includes(state) ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMilestoneModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-all"
                >
                  Submit
                </button>
              ) : (
                <span className="text-gray-600">-</span>
              )}
            </div>

            {showMilestoneModal && (
              <SubmitMilestoneModal
                projectId={projectId}
                state={state}
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
