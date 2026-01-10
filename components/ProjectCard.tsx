// components/ProjectCard.tsx
"use client";

import { formatEther } from "viem";
import Link from "next/link";

interface ProjectCardProps {
  projectId: bigint;
  name: string;
  description: string;
  creator: string;
  softCapWei: bigint;
  totalFunded: bigint;
  bond: bigint;
  state: string;
  category: number;
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

export default function ProjectCard({
  projectId,
  name,
  description,
  creator,
  softCapWei,
  totalFunded,
  bond,
  state,
  category,
}: ProjectCardProps) {
  const formatEth = (amount: bigint) => {
    const eth = parseFloat(formatEther(amount));
    return eth.toFixed(8).replace(/\.?0+$/, "");
  };

  const categoryLabel = CATEGORY_LABELS[category] ?? `Category ${category}`;

  const softCap = formatEth(softCapWei);
  const funded = formatEth(totalFunded);
  const progress =
    softCapWei > BigInt(0)
      ? Number((totalFunded * BigInt(100)) / softCapWei)
      : 0;

  return (
    <Link href={`/project/${projectId.toString()}`}>
      <div
        className="
          bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6
          transform transition-transform duration-200 ease-out
          hover:-translate-y-1 hover:shadow-lg cursor-pointer
        "
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {categoryLabel}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Target</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {softCap} ETH
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              TotalFunded
            </span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {funded} ETH
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>ID: {projectId.toString()}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>
    </Link>
  );
}
