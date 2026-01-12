// app/creator/[address]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { formatEther } from "viem";
import Navbar from "@/components/Navbar";
import { useProjectsByCreator } from "@/hooks/useContract";
import { getProjectProgress } from "@/utils/projectProgress";
import { PROJECT_TIMELINE } from "@/constants/projectTimeline";
import { useState } from "react";
import ProjectPreviewModal from "@/components/ProjectPreviewModal";

export default function CreatorProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as `0x${string}`;

  const { projects, isLoading } = useProjectsByCreator(address);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const formatEth = (amount: bigint) =>
    parseFloat(formatEther(amount)).toFixed(4);

  const total = projects.length;

  const successCount = projects.filter((p) => p.state === 11).length;
  const failedCount = projects.filter((p) =>
    [4, 7, 10].includes(p.state)
  ).length;

  const successRate = total > 0 ? (successCount / total) * 100 : 0;
  const failedRate = total > 0 ? (failedCount / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {selectedProject && (
        <ProjectPreviewModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 pt-24">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
        >
          ← Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects created by
            </h1>
            <p className="font-mono pt-3 text-gray-600 dark:text-gray-400 break-all">
              {address}
            </p>
          </div>

          <div className="flex gap-6">
            {/* Success */}
            <div className="w-32 bg-green-100 dark:bg-green-900/30 px-4 py-3 rounded-xl text-center">
              <div className="text-sm text-green-700 dark:text-green-400">
                Success
              </div>
              <div className="text-xl font-bold text-green-800 dark:text-green-300">
                {successRate.toFixed(0)}%
              </div>
            </div>

            {/* Failed */}
            <div className="w-32 bg-red-100 dark:bg-red-900/30 px-4 py-3 rounded-xl text-center">
              <div className="text-sm text-red-700 dark:text-red-400">
                Failed
              </div>
              <div className="text-xl font-bold text-red-800 dark:text-red-300">
                {failedRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-500">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500">No projects found</div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[60vh]">
                <table className="min-w-full border-collapse table-auto">
                  <thead className="sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[35%]">
                        Project
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[20%]">
                        Total Funded
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[15%]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {projects.map((p) => (
                      <tr
                        key={p.projectId.toString()}
                        onClick={() => setSelectedProject(p)}
                        className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {p.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              #{p.projectId.toString()}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                          {formatEth(p.totalFunded)} ETH
                        </td>

                        <td className="px-5 py-4">
                          {(() => {
                            const { percent, color } = getProjectProgress(
                              p.state
                            );

                            return (
                              <div className="flex flex-col gap-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`${color} h-2 rounded-full transition-all duration-700`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {PROJECT_TIMELINE[p.state]}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
