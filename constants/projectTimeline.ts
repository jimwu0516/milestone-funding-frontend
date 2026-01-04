// constants/projectTimeline.ts
export const PROJECT_TIMELINE = [
  "Funding",
  "BuildingStage1",
  "VotingRound1",
  "FailureRound1",
  "BuildingStage2",
  "VotingRound2",
  "FailureRound2",
  "BuildingStage3",
  "VotingRound3",
  "FailureRound3",
  "Completed",
] as const;

export type ProjectState = (typeof PROJECT_TIMELINE)[number] | "Cancelled";
