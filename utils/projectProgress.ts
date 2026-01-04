// utils/projectProgress.ts
import { PROJECT_TIMELINE, ProjectState } from "@/constants/projectTimeline";

export function getProjectProgress(state: ProjectState) {
  if (state === "Cancelled") {
    return {
      percent: 100,
      color: "bg-gray-400",
    };
  }

  const index = PROJECT_TIMELINE.indexOf(state as any);

  const percent =
    index >= 0
      ? ((index + 1) / PROJECT_TIMELINE.length) * 100
      : 0;

  if (state.startsWith("Failure")) {
    return {
      percent,
      color: "bg-red-600",
    };
  }

  if (state === "Completed") {
    return {
      percent: 100,
      color: "bg-green-600",
    };
  }

  return {
    percent,
    color: "bg-blue-600",
  };
}
