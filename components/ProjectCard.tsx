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

const CATEGORY_STYLES: Record<number, string> = {
  0: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200", 
  1: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", 
  2: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  3: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", 
  4: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  5: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", 
  6: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
  7: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200", 
};

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

  const categoryStyle =
    CATEGORY_STYLES[category] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

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
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${categoryStyle}`}
          >
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

        <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2 mb-2">
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
