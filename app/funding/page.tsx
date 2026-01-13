//app/funding/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import ProjectList from "@/components/ProjectList";
import { useState } from "react";

export default function Funding() {
  const [sortBy, setSortBy] = useState<"id" | "remaining">("id");
  const [category, setCategory] = useState<number | "all">("all");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 flex flex-col gap-6 h-[calc(100vh-3rem)]">
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
                All Funding Projects
              </h1>
              <p className="text-gray-300">
                Browse and invest in projects that interest you
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm hover:border-blue-500 transition"
              >
                <option value="id">Sort by ID ↑</option>
                <option value="remaining">Progress (high → low)</option>
              </select>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm hover:border-blue-500 transition"
              >
                <option value="all">All Categories</option>
                <option value="0">Technology</option>
                <option value="1">Hardware</option>
                <option value="2">Creative</option>
                <option value="3">Education</option>
                <option value="4">SocialImpact</option>
                <option value="5">Research</option>
                <option value="6">Business</option>
                <option value="7">Community</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-visible">
          <ProjectList sortBy={sortBy} category={category} />
        </div>
      </main>
    </div>
  );
}
