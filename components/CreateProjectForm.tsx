//components/CreateProjectForm.tsx
"use client";

import { useState } from "react";
import { parseEther, formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import TxModal from "./TxModal";
import { useCreateProject } from "@/hooks/useContract";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

interface CreateProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectForm({
  onClose,
  onSuccess,
}: CreateProjectFormProps) {
  const { create, isPending, isConfirming, isSuccess, error, hash } =
    useCreateProject();
  const queryClient = useQueryClient();
  const [showInputModal, setShowInputModal] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    softCapEther: "",
    category: 0,
    milestones: ["", "", ""] as [string, string, string],
  });

  const CATEGORIES = [
    "Technology",
    "Hardware",
    "Creative",
    "Education",
    "SocialImpact",
    "Research",
    "Business",
    "Community",
  ] as const;

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const handleCreate = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    const { name, description, softCapEther, category, milestones } = formData;

    const softCapNum = Number(formData.softCapEther);
    if (
      !name ||
      !description ||
      !softCapEther ||
      softCapNum <= 0 ||
      softCapNum < 0.0001 ||
      milestones.some((m) => !m)
    ) {
      return alert("Please fill in all fields and set a positive target.");
    }

    const softCapWei = parseEther(softCapEther);
    const bond = softCapWei / 10n;

    setShowInputModal(false);
    setShowTxModal(true);

    await create(name, description, softCapWei, category, milestones, bond);
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      router.push("/my-projects?filter=active");
      onSuccess();
    } else onClose();
  };

  const baseButtonClass =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover:scale-105 cursor-pointer";

  return (
    <>
      {showInputModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-600 to-purple-600  dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-2xl font-bold">Create New Project</h2>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Project Info */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg">1. Project Info</h3>
                <input
                  className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <textarea
                  rows={3}
                  className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  placeholder="Describe what you are building..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </section>

              {/* Category */}
              <section className="space-y-3">
                <h3 className="font-semibold text-lg">2. Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: i })}
                      className={`p-3 rounded-xl border transition-all
                      ${
                        formData.category === i
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:border-blue-400 dark:border-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* Funding */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg">3. Funding Goal</h3>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Target in ETH (min:0.0001)"
                  value={formData.softCapEther}
                  min="0.0001"
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setFormData({ ...formData, softCapEther: "" });
                      return;
                    }

                    if (/^0*\.?\d*$/.test(value)) {
                      setFormData({ ...formData, softCapEther: value });
                    }
                  }}
                  className="w-full p-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />

                {formData.softCapEther && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 flex flex-col justify-center">
                      Creator Bond (10%)
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        The bond will be returned if the project succeeds
                      </span>
                    </span>

                    <span className="font-semibold text-2xl text-right">
                      {formatEther(parseEther(formData.softCapEther) / 10n)} ETH
                    </span>
                  </div>
                )}
              </section>

              {/* Milestones */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg">4. Milestones</h3>
                {formData.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-400">#{i + 1}</span>
                    <input
                      className="flex-1 bg-transparent outline-none"
                      placeholder={`Describe what milestone ${
                        i + 1
                      } should achieve`}
                      value={m}
                      onChange={(e) => {
                        const next = [...formData.milestones] as [
                          string,
                          string,
                          string
                        ];
                        next[i] = e.target.value;
                        setFormData({ ...formData, milestones: next });
                      }}
                    />
                  </div>
                ))}
              </section>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t dark:border-gray-700 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 hover:opacity-90 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 cursor-pointer"
              >
                Deploy Project
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
        errorMessage={error ? "Try again" : undefined}
      />
    </>
  );
}
