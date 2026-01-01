//app/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import ProjectList from "@/components/ProjectList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Funding Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and invest in projects that interest you
          </p>
        </div>
        <ProjectList />
      </main>
    </div>
  );
}
