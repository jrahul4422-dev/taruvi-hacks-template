import { executeFunction } from "../utils/functionHelpers";

export interface ScenarioClarificationInput {
  scenarioContext: string;
  followUpRole: string;
  confidenceChallenge: string;
  difficulty: string;
}

export type ScenarioPillar =
  | "Scenario / Context"
  | "Target Audience"
  | "Specific Focus Areas"
  | "Desired Outcome";

export interface ScenarioClarificationResult {
  promptReady: boolean;
  missingPillars: ScenarioPillar[];
  questions: string[];
  analysisFramework: string | null;
}

const isClarificationResult = (value: unknown): value is ScenarioClarificationResult => {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;

  return (
    typeof result.promptReady === "boolean" &&
    Array.isArray(result.missingPillars) &&
    result.missingPillars.every((pillar) =>
      ["Scenario / Context", "Target Audience", "Specific Focus Areas", "Desired Outcome"].includes(pillar),
    ) &&
    Array.isArray(result.questions) &&
    result.questions.every((question) => typeof question === "string") &&
    (typeof result.analysisFramework === "string" || result.analysisFramework === null)
  );
};

/** Evaluate the current text answers through the authenticated Taruvi function. */
export const clarifyScenario = async (
  input: ScenarioClarificationInput,
): Promise<ScenarioClarificationResult> => {
  const result = await executeFunction<unknown>("clarify-scenario", { ...input });
  if (!isClarificationResult(result)) {
    throw new Error("The clarification service returned an unexpected response.");
  }
  return result;
};
