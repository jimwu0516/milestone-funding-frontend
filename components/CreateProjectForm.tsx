//components/CreateProjectForm.tsx
"use client";

import { useState } from "react";
import { parseEther, formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import TxModal from "./TxModal";
import { useCreateProject } from "@/hooks/useContract";

interface CreateProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectForm({ onClose, onSuccess }: CreateProjectFormProps) {
  const { create, isPending, isConfirming, isSuccess, error, hash } = useCreateProject();
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
    if (!name || !description || !softCapEther) return alert("Please fill in all fields.");
    if (isNaN(Number(softCapEther)) || Number(softCapEther) <= 0) return alert("Please input valid value");

    try {
      const softCapWei = parseEther(softCapEther);
      const bond = softCapWei / BigInt(10); // 10% bond
      setShowInputModal(false);
      setShowTxModal(true);
      await create(name, description, softCapWei, bond);
    } catch {
      alert("Error");
      setShowInputModal(true);
      setShowTxModal(false);
    }
  };

  const handleCloseTxModal = () => {
    setShowTxModal(false);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      onSuccess();
    } else onClose();
  };

  const baseButtonClass =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow transform hover:scale-105 cursor-pointer";

  return (
    <>
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
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min={0}
                step={0.0001}
                placeholder="Target (ETH)"
                value={formData.softCapEther}
                onChange={(e) => setFormData({ ...formData, softCapEther: e.target.value })}
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <TxModal
        isOpen={showTxModal}
        onClose={handleCloseTxModal}
        status={error ? "error" : isSuccess ? "success" : isConfirming ? "confirming" : "pending"}
        hash={hash || null}
        errorMessage={error ? "Try again" : undefined}
      />
    </>
  );
}
