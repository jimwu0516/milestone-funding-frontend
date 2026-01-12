//components/ProjecPreviewModal.tsx
"use client";

import { useMilestoneDescriptions, useProjectMeta } from "@/hooks/useContract";
import { useState } from "react";

interface ProjectPreviewModalProps {
  project: any;
  onClose: () => void;
}

const CATEGORIES = [
  "Technology",
  "Hardware",
  "Creative",
  "Education",
  "SocialImpact",
  "Research",
  "Business",
  "Community",
];

const CATEGORY_STYLES = [
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
];

export default function ProjectPreviewModal({
  project,
  onClose,
}: ProjectPreviewModalProps) {
  const { data: milestoneDescriptions, isLoading: descLoading } =
    useMilestoneDescriptions(project.projectId);

  const { data: projectMeta, isLoading: metaLoading } = useProjectMeta(
    project.projectId
  );
  const milestoneHashes = projectMeta ? projectMeta[0] : [];

  const categoryIndex = Number(project.category);
  const categoryLabel = CATEGORIES[categoryIndex] ?? "Unknown";
  const categoryStyle =
    CATEGORY_STYLES[categoryIndex] ?? "bg-blue-100 text-blue-800";

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-2xl font-bold">{project.name}</h2>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          <section className="space-y-2">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {project.description || "—"}
            </p>
          </section>

          {/* Category */}
          <section className="space-y-2">
            <h3 className="font-semibold text-lg">Category</h3>
            <div
              className={`inline-block px-4 py-2 rounded-xl font-medium ${categoryStyle}`}
            >
              {categoryLabel}
            </div>
          </section>

          {/* Milestones */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg">Milestones</h3>

            {[0, 1, 2].map((i) => {
              const desc = descLoading
                ? "Loading…"
                : milestoneDescriptions?.[i]?.trim() || "—";

              const hash = metaLoading
                ? "Loading…"
                : milestoneHashes?.[i]?.trim() || null;

              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border dark:border-gray-700 space-y-2"
                >
                  <div className="text-sm text-gray-400">
                    Milestone #{i + 1}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white min-h-[1.5rem]">
                    {desc}
                  </div>
                  <div className="text-xs text-gray-500 break-all min-h-[1.25rem]">
                    Hash:{" "}
                    {hash ? (
                      <button
                        onClick={() => {
                          setLoadingImage(true);
                          setPreviewImage(
                            `https://gateway.pinata.cloud/ipfs/${hash}`
                          );
                        }}
                        className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 cursor-pointer dark:hover:text-blue-200"
                      >
                        {hash}
                      </button>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="max-w-xl w-full p-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Loading 狀態 */}
              {loadingImage && (
                <div className="text-gray-700 dark:text-gray-300 font-medium py-20">
                  Loading...
                </div>
              )}

              <img
                src={previewImage}
                alt="Milestone Preview"
                className={`w-full h-auto rounded-lg transition-opacity duration-300 ${
                  loadingImage ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setLoadingImage(false)}
                onError={() => setLoadingImage(false)}
              />

              <button
                onClick={() => setPreviewImage(null)}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-6 border-t dark:border-gray-700 flex">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
