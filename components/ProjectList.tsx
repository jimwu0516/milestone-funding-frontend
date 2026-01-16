//components/ProjectList.tsx
// components/ProjectList.tsx
"use client";

import {
  useAllFundingProjects,
  useProjectCore,
  useProjectMeta,
} from "@/hooks/useContract";
import ProjectCard from "./ProjectCard";
import { useEffect, useMemo, useState } from "react";

type ProjectCoreData = {
  creator: string;
  category: number;
  softCapWei: bigint;
  totalFunded: bigint;
  bond: bigint;
  state: number;
};

type ProjectMetaData = {
  name: string;
  description: string;
};

type Project = {
  projectId: bigint;
  core: ProjectCoreData;
  meta: ProjectMetaData;
  progress: number;
};

export default function ProjectList({
  sortBy,
  category,
}: {
  sortBy: "id" | "remaining";
  category: number | "all";
}) {
  const { data: projectIdsData } = useAllFundingProjects(); // ✅ 注意取 data
  const [projects, setProjects] = useState<Record<string, Project>>({});

  const handleLoaded = (p: Project) => {
    setProjects((prev) => {
      const key = p.projectId.toString();
      const prevP = prev[key];
      if (
        prevP &&
        prevP.progress === p.progress &&
        prevP.core.totalFunded === p.core.totalFunded
      )
        return prev;
      return { ...prev, [key]: p };
    });
  };

  const visible = useMemo(() => {
    let arr = Object.values(projects);
    if (category !== "all")
      arr = arr.filter((p) => p.core.category === category);
    if (sortBy === "id")
      arr.sort((a, b) => (a.projectId < b.projectId ? -1 : 1));
    else arr.sort((a, b) => b.progress - a.progress);
    return arr;
  }, [projects, sortBy, category]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      {!projectIdsData && (
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      )}
      {projectIdsData && projectIdsData.length === 0 && (
        <div className="py-12 text-center text-gray-600 dark:text-gray-400">
          No Funding Project
        </div>
      )}

      {projectIdsData?.map((id) => (
        <ProjectCardLoader
          key={id.toString()}
          projectId={id}
          onLoaded={handleLoaded}
        />
      ))}

      {visible.map((p) => (
        <ProjectCard
          key={`card-${p.projectId.toString()}`}
          projectId={p.projectId}
          core={p.core}
          meta={p.meta}
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
  const core = useProjectCore(Number(projectId));
  const meta = useProjectMeta(Number(projectId));

  useEffect(() => {
    if (!core?.projectCore || !meta?.projectMeta) return;

    const c = core.projectCore;
    const m = meta.projectMeta;

    const progress =
      c.softCapWei > BigInt(0)
        ? Number((c.totalFunded * BigInt(10000)) / c.softCapWei) / 100
        : 0;

    onLoaded({
      projectId,
      core: c,
      meta: { name: m.name, description: m.description },
      progress,
    });
  }, [core, meta, projectId, onLoaded]);

  return null;
}
