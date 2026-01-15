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

  const formatEth = (amount: bigint | string) =>
    parseFloat(typeof amount === "bigint" ? formatEther(amount) : amount)
      .toFixed(5)
      .replace(/\.?0+$/, "");

  const total = projects.filter((p) => [11, 4, 7, 10].includes(p.state)).length;
  const successCount = projects.filter((p) => p.state === 11).length;
  const failedCount = projects.filter((p) =>
    [4, 7, 10].includes(p.state)
  ).length;

  const successRate = total > 0 ? (successCount / total) * 100 : 0;
  const failedRate = total > 0 ? (failedCount / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      {selectedProject && (
        <ProjectPreviewModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 pt-24 space-y-8">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:text-blue-400 cursor-pointer"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Projects created by</h1>
            <p className="font-mono pt-2 text-gray-400 break-all">{address}</p>
          </div>

          <div className="flex gap-6">
            {/* Success */}
            <div className="w-32 px-4 py-3 rounded-xl text-center bg-gradient-to-br from-green-500 to-green-700 shadow-lg">
              <div className="text-sm text-green-100">Success</div>
              <div className="text-xl font-bold text-white">
                {successRate.toFixed(0)}%
              </div>
            </div>

            {/* Failed */}
            <div className="w-32 px-4 py-3 rounded-xl text-center bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
              <div className="text-sm text-red-100">Failed</div>
              <div className="text-xl font-bold text-white">
                {failedRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-gray-400">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-400">No projects found</div>
        ) : (
          <div className="bg-gray-850 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[60vh]">
                <table className="min-w-full border-collapse table-auto">
                  <thead className="sticky top-0 z-10 bg-gray-800/70 backdrop-blur-md border-b border-gray-700">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-300 w-[35%]">
                        Project
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-300 w-[20%]">
                        Total Funded
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-300 w-[15%]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-700">
                    {projects.map((p) => (
                      <tr
                        key={p.projectId.toString()}
                        onClick={() => setSelectedProject(p)}
                        className="group hover:bg-gray-800/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {p.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              #{p.projectId.toString()}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-white">
                          {formatEth(p.totalFunded)} ETH
                        </td>

                        <td className="px-5 py-4">
                          {(() => {
                            const { percent, color } = getProjectProgress(
                              p.state
                            );
                            return (
                              <div className="flex flex-col gap-2">
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`${color} h-2 rounded-full transition-all duration-700`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 truncate">
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
