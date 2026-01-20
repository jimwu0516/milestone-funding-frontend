"use client";

import { useAllFundingProjects, useProjectCore } from "@/hooks/useContract";
import ProjectCard from "./ProjectCard";
import { useEffect, useMemo, useState } from "react";

type Project = {
  projectId: bigint;
  creator: string;
  name: string;
  description: string;
  category: number;
  softCapWei: bigint;
  totalFunded: bigint;
  bond: bigint;
  state: string;
  progress: number;
};

export default function ProjectList({
  sortBy,
  category,
}: {
  sortBy: "id" | "remaining";
  category: number | "all";
}) {
  const { data, isLoading, error } = useAllFundingProjects();
  const projectIds = data as bigint[] | undefined;

  const [projects, setProjects] = useState<Record<string, Project>>({});

  const handleLoaded = (p: Project) => {
    setProjects((prev) => {
      const key = p.projectId.toString();
      const prevP = prev[key];
      if (
        prevP &&
        prevP.progress === p.progress &&
        prevP.totalFunded === p.totalFunded &&
        prevP.softCapWei === p.softCapWei
      ) {
        return prev;
      }
      return { ...prev, [key]: p };
    });
  };

  useEffect(() => {
    if (!projectIds) return;

    setProjects((prev) => {
      const next: Record<string, Project> = {};

      for (const id of projectIds) {
        const key = id.toString();
        if (prev[key]) {
          next[key] = prev[key];
        }
      }

      return next;
    });
  }, [projectIds]);

  const visible = useMemo(() => {
    let arr = Object.values(projects);

    if (category !== "all") {
      arr = arr.filter((p) => p.category === category);
    }

    if (sortBy === "id") {
      arr.sort((a, b) => (a.projectId < b.projectId ? -1 : 1));
    } else {
      arr.sort((a, b) => b.progress - a.progress);
    }

    return arr;
  }, [projects, sortBy, category]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      {/* Loading */}
      {isLoading && (
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="py-12 text-center text-red-600 dark:text-red-400">
          ERROR: {error.message}
        </div>
      )}

      {!isLoading && !error && projectIds?.length === 0 && (
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">
          No Funding Project
        </div>
      )}

      {/* Project loaders */}
      {projectIds?.map((id) => (
        <ProjectCardLoader
          key={id.toString()}
          projectId={id}
          onLoaded={handleLoaded}
        />
      ))}

      {/* Visible project cards */}
      {visible.map((p) => (
        <ProjectCard
          key={`card-${p.projectId.toString()}`}
          projectId={p.projectId}
          name={p.name}
          description={p.description}
          creator={p.creator}
          softCapWei={p.softCapWei}
          totalFunded={p.totalFunded}
          bond={p.bond}
          state={p.state}
          category={p.category}
        />
      ))}
    </div>
  );
}

function ProjectCardLoader({
  projectId,
  onLoaded,
}: {
  projectId: bigint;
  onLoaded: (p: Project) => void;
}) {
  const { data } = useProjectCore(projectId);

  useEffect(() => {
    if (!data) return;

    const [
      creator,
      name,
      description,
      category,
      softCapWei,
      totalFunded,
      bond,
      state,
    ] = data as [
      string,
      string,
      string,
      number,
      bigint,
      bigint,
      bigint,
      string,
    ];

    const progress =
      softCapWei > BigInt(0)
        ? Number((totalFunded * BigInt(10000)) / softCapWei) / 100
        : 0;

    onLoaded({
      projectId,
      creator,
      name,
      description,
      category,
      softCapWei,
      totalFunded,
      bond,
      state,
      progress,
    });
  }, [data, projectId, onLoaded]);

  return null;
}
