// utils/projectProgress.ts
import { PROJECT_TIMELINE, ProjectState } from "@/constants/projectTimeline";

export function getProjectProgress(state: ProjectState | number) {
  let stateName: ProjectState;
  if (typeof state === "number") {
    stateName = PROJECT_TIMELINE[state] ?? "Cancelled";
  } else {
    stateName = state;
  }

  if (stateName === "Cancelled") {
    return { percent: 100, color: "bg-gray-700" };
  }

  const index = PROJECT_TIMELINE.indexOf(stateName as any);
  const percent = index >= 0 ? ((index + 1) / PROJECT_TIMELINE.length) * 100 : 0;

  if (stateName.startsWith("Failure")) return { percent, color: "bg-red-600" };
  if (stateName === "Completed") return { percent: 100, color: "bg-green-600" };
  return { percent, color: "bg-blue-600" };
};
