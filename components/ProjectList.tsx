//components/ProjectList.tsx

"use client";

import { useAllFundingProjects, useProjectCore } from "@/hooks/useContract";
import ProjectCard from "./ProjectCard";

export default function ProjectList() {
  const { data: projectIds, isLoading, error } = useAllFundingProjects();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-600 dark:text-red-400">
          ERROR: {error.message}
        </div>
      </div>
    );
  }

  if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600 dark:text-gray-400">
          NO Funding Porject
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projectIds.map((projectId: bigint) => (
        <ProjectCardLoader key={projectId.toString()} projectId={projectId} />
      ))}
    </div>
  );
}

function ProjectCardLoader({ projectId }: { projectId: bigint }) {
  const { data, isLoading, error } = useProjectCore(projectId);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-red-600 dark:text-red-400 text-sm">
          ERROR : When loading project {projectId.toString()}
        </div>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length < 7) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-red-600 dark:text-red-400 text-sm">
          Format error
        </div>
      </div>
    );
  }

  const [creator, name, description, category, softCapWei, totalFunded, bond, state] = data;

  return (
    <ProjectCard
      projectId={projectId}
      name={name}
      description={description}
      creator={creator}
      softCapWei={softCapWei}
      totalFunded={totalFunded}
      bond={bond}
      state={state}
      category={category}
    />
  );
}

