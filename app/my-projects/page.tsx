// app/my-projects/page.tsx
"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { parseEther, formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { useMyProjects } from "@/hooks/useMyProjects";
import {
  useProjectCore,
  useCreateProject,
  useCancelProject,
} from "@/hooks/useContract";

export default function MyProjectsPage() {
  const { address, isConnected } = useAccount();
  const { projectIds, isLoading: idsLoading, refetch } = useMyProjects();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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

        <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors cursor-pointer ${
              filter === "active"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors cursor-pointer ${
              filter === "inactive"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Inactive
          </button>
        </div>

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
          <div className="flex justify-center items-center py-12 text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        ) : projectIds && projectIds.length > 0 ? (
          <ProjectsTable
            projectIds={projectIds}
            userAddress={address!}
            filter={filter}
          />
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No projects have been created yet.
          </div>
        )}
      </main>
    </div>
  );
}

// ======================
// 創建專案表單（InputModal + TxModal）
// ======================
function CreateProjectForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { create, isPending, isConfirming, isSuccess, error, hash } =
    useCreateProject();
  const queryClient = useQueryClient();
  const [showInputModal, setShowInputModal] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    softCapEther: "",
  });

  const handleCreate = async () => {
    const { name, description, softCapEther } = formData;
    if (!name || !description || !softCapEther) {
      alert("Please fill in all fields.");
      return;
    }
    if (isNaN(Number(softCapEther)) || Number(softCapEther) <= 0) {
      alert("Please input valid value");
      return;
    }

    try {
      const softCapWei = parseEther(softCapEther);
      const bond = softCapWei / BigInt(10);
      setShowInputModal(false);
      setShowTxModal(true);
      await create(name, description, softCapWei, bond);
    } catch (err: any) {
      alert("Error");
      setShowInputModal(true);
      setShowTxModal(false);
    }
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);

    if (isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["readContract"],
      });

      onSuccess();
    } else {
      onClose();
    }
  };

  const baseButtonClass =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover:scale-105 cursor-pointer";

  return (
    <>
      {/* Input Modal */}
      {showInputModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
          onClick={onClose}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Create new project</h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="describe"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min={0}
                step={0.0001}
                placeholder="Target (ETH)"
                value={formData.softCapEther}
                onChange={(e) =>
                  setFormData({ ...formData, softCapEther: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleCreate}
                className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700 text-white w-full`}
              >
                Submit
              </button>
              <button
                onClick={onClose}
                className={`${baseButtonClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white w-full`}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tx Modal */}
      {showTxModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            {isPending && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Submitting...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please confirm
                </p>
              </div>
            )}

            {isConfirming && !isPending && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Pending...
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Submitted
                </p>
                {hash && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </p>
                )}
              </div>
            )}

            {isSuccess && (
              <div className="text-center">
                <div className="inline-block w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                  Success！
                </h3>
                <button
                  onClick={handleCloseTxModal}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
                >
                  Ok
                </button>
              </div>
            )}

            {error && (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {"try again"}
                </p>
                <button
                  onClick={handleCloseTxModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                >
                  Ok
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ======================
// Projects Table & Row（保留原本功能）
// ======================
function ProjectsTable({
  projectIds,
  userAddress,
  filter,
}: {
  projectIds: bigint[];
  userAddress: string;
  filter: "active" | "inactive";
}) {
  const activeStates = [
    "Funding",
    "BuildingStage1",
    "VotingRound1",
    "BuildingStage2",
    "VotingRound2",
    "BuildingStage3",
    "VotingRound3",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <th className="px-4 py-2 text-gray-900 dark:text-white">Title</th>
            <th className="px-4 py-2 text-gray-900 dark:text-white">Target</th>
            <th className="px-4 py-2 text-gray-900 dark:text-white">Total Funded</th>
            {filter === "active" ? (
              <>
                <th className="px-4 py-2 text-gray-900 dark:text-white">
                  Milestone
                </th>
                <th className="px-4 py-2 text-gray-900 dark:text-white">
                  Action
                </th>
              </>
            ) : (
              <th className="px-4 py-2 text-gray-900 dark:text-white">state</th>
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
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const queryClient = useQueryClient();

  if (isLoading)
    return (
      <tr>
        <td colSpan={filter === "active" ? 5 : 4} className="px-4 py-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </td>
      </tr>
    );
  if (error || !data) return null;

  const [creator, name, description, softCapWei, totalFunded, bond, state] =
    data;
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

  const progressIndex = activeStates.indexOf(state);
  const progressPercent = ((progressIndex + 1) / activeStates.length) * 100;

  const handleCancel = async () => {
    setShowTxModal(true);
    try {
      await cancel(projectId);
    } catch (err) {
      console.error(err);
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

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(8)
      .replace(/\.?0+$/, "");

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
          {formatEth(totalFunded)}ETH
        </td>

        {filter === "active" ? (
          <>
            <td className="px-4 py-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {state}
              </div>
            </td>
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
                  提交 Milestone
                </button>
              )}
            </td>
          </>
        ) : (
          <td className="px-4 py-3 text-gray-900 dark:text-white">{state}</td>
        )}
      </tr>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">提交 Milestone</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              這裡可以放里程碑提交表單
            </p>
            <button
              onClick={() => setShowMilestoneModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Cancel Tx Modal */}
      {showTxModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl text-center">
            {isPending && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Canceling...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please confirm
                </p>
              </>
            )}
            {isConfirming && !isPending && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Pending...
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Submitted
                </p>
                {hash && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </p>
                )}
              </>
            )}
            {isSuccess && (
              <>
                <div className="inline-block w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                  Success！
                </h3>
                <button
                  onClick={handleCloseTxModal}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
                >
                  Ok
                </button>
              </>
            )}
            {cancelError && (
              <>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {"Try again"}
                </p>
                <button
                  onClick={handleCloseTxModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                >
                  Ok
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
