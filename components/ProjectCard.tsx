// components/ProjectCard.tsx
"use client";

import { formatEther } from "viem";
import Link from "next/link";
import { ProjectCore } from "@/hooks/useContract";

interface ProjectCardProps {
  projectId: bigint;
  core: ProjectCore;
  meta: {
    name: string;
    description: string;
  };
}

const CATEGORY_LABELS = [
  "Technology",
  "Hardware",
  "Creative",
  "Education",
  "SocialImpact",
  "Research",
  "Business",
  "Community",
];

const CATEGORY_STYLES: Record<number, string> = {
  0: "bg-indigo-800 text-indigo-200",
  1: "bg-orange-800 text-orange-200",
  2: "bg-pink-800 text-pink-200",
  3: "bg-emerald-800 text-emerald-200",
  4: "bg-teal-800 text-teal-200",
  5: "bg-purple-800 text-purple-200",
  6: "bg-yellow-800 text-yellow-900",
  7: "bg-rose-800 text-rose-200",
};

export default function ProjectCard({ projectId, core, meta }: ProjectCardProps) {
  const formatEth = (amount: bigint) => parseFloat(formatEther(amount)).toFixed(5).replace(/\.?0+$/, "");
  const softCap = formatEth(core.softCapWei);
  const funded = formatEth(core.totalFunded);
  const progress = core.softCapWei > BigInt(0)
    ? Number((core.totalFunded * BigInt(100)) / core.softCapWei)
    : 0;

  const categoryLabel = CATEGORY_LABELS[core.category] ?? `Category ${core.category}`;
  const categoryStyle = CATEGORY_STYLES[core.category] ?? "bg-gray-800 text-gray-200";

  return (
    <Link href={`/project/${projectId.toString()}`}>
      <div className="bg-gray-850 backdrop-blur-md rounded-xl border border-gray-700 p-6 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transform transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-white">{meta.name}</h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryStyle}`}>{categoryLabel}</span>
        </div>

        <p className="text-gray-400 text-sm mb-4">{meta.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-gray-500">Target</span>
            <span className="text-white font-semibold">{softCap} ETH</span>
          </div>

          <div className="flex justify-between text-sm font-mono">
            <span className="text-gray-500">Funded</span>
            <span className="text-white font-semibold">{funded} ETH</span>
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>ID: {projectId.toString()}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>
    </Link>
  );
}
