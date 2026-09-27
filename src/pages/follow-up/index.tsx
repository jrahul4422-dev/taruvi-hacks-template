import { useState, type FormEvent } from "react";
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { Navigate, useLocation } from "react-router";
import { clarifyScenario, type ScenarioClarificationResult, type ScenarioPillar } from "../../services/scenarioClarification";

const difficultyOptions = ["Easy", "Realistic", "Difficult"] as const;
type Difficulty = (typeof difficultyOptions)[number];

const formatClarificationAnswers = (result: ScenarioClarificationResult, answers: string[]) => {
  const pillarsByQuestion: ScenarioPillar[][] = result.missingPillars.length === 4
    ? [
        ["Scenario / Context", "Target Audience"],
        ["Specific Focus Areas"],
        ["Desired Outcome"],
      ]
    : result.missingPillars.map((pillar) => [pillar]);

  return answers.map((answer, index) =>
    (pillarsByQuestion[index] ?? []).map((pillar) => {
      if (pillar === "Target Audience") return `The target audience is ${answer.trim()}.`;
      if (pillar === "Desired Outcome") return `My goal is to ${answer.trim()}.`;
      if (pillar === "Specific Focus Areas") return `Specific focus area: ${answer.trim()}.`;
      return `Scenario context: ${answer.trim()}.`;
    }).join(" "),
  ).join("\n");
};

export const FollowUp = () => {
  const location = useLocation();
  const previousAnswers = location.state as { scenarioContext?: unknown; selectedFile?: File | null } | null;
  const scenarioContext = previousAnswers?.scenarioContext;
  const [followUpRole, setFollowUpRole] = useState("");
  const [confidenceChallenge, setConfidenceChallenge] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [clarifiedContext, setClarifiedContext] = useState(
    typeof scenarioContext === "string" ? scenarioContext : "",
  );
  const [clarification, setClarification] = useState<ScenarioClarificationResult | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContext = async (context: string) => {
    if (
      typeof scenarioContext !== "string" ||
      !scenarioContext.trim() ||
      !followUpRole.trim() ||
      !confidenceChallenge.trim() ||
      !difficulty ||
      isChecking
    ) return;

    setIsChecking(true);
    setError(null);
    try {
      const result = await clarifyScenario({
        scenarioContext: context,
        followUpRole,
        confidenceChallenge,
        difficulty,
      });
      setClarifiedContext(context);
      setClarification(result);
      setClarificationAnswers(result.questions.slice(0, 3).map(() => ""));
    } catch {
      setError("We couldn't check your context. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void checkContext(clarifiedContext);
  };

  const handleSubmitAnswers = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clarification || clarification.promptReady || clarificationAnswers.some((answer) => !answer.trim())) return;

    const addedContext = formatClarificationAnswers(clarification, clarificationAnswers);
    void checkContext(`${clarifiedContext}\n${addedContext}`);
  };

  const visibleQuestions = clarification?.promptReady === false ? clarification.questions.slice(0, 3) : [];

  if (typeof scenarioContext !== "string" || !scenarioContext.trim()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - var(--nav-height, 60px))",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        py: { xs: 4, sm: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: 1, borderColor: "divider" }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography component="h1" variant="h3" gutterBottom>
                Help us understand your situation better
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We'll use this to personalize your practice.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleContinue}>
              <Stack spacing={3}>
                <TextField
                  label="What role, event, or situation are you preparing for?"
                  fullWidth
                  value={followUpRole}
                  onChange={(event) => {
                    setFollowUpRole(event.target.value);
                    setClarification(null);
                    setError(null);
                  }}
                />
                <TextField
                  label="What part of this situation makes you feel least confident?"
                  multiline
                  minRows={3}
                  fullWidth
                  value={confidenceChallenge}
                  onChange={(event) => {
                    setConfidenceChallenge(event.target.value);
                    setClarification(null);
                    setError(null);
                  }}
                />
                <Box role="group" aria-labelledby="difficulty-label">
                  <Typography id="difficulty-label" variant="body1" sx={{ mb: 1 }}>
                    How challenging should the practice be?
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {difficultyOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={difficulty === option ? "contained" : "outlined"}
                        aria-pressed={difficulty === option}
                        onClick={() => {
                          setDifficulty(option);
                          setClarification(null);
                          setError(null);
                        }}
                        fullWidth
                      >
                        {option}
                      </Button>
                    ))}
                  </Stack>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isChecking || !followUpRole.trim() || !confidenceChallenge.trim() || !difficulty}
                  startIcon={isChecking ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {isChecking ? "Checking Context..." : "Continue"}
                </Button>
              </Stack>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {clarification?.promptReady === false && (
              <Box component="form" onSubmit={handleSubmitAnswers}>
                <Stack spacing={3}>
                  <Typography variant="h5">A few more details</Typography>
                  {visibleQuestions.map((question, index) => (
                    <TextField
                      key={question}
                      label={question}
                      multiline
                      minRows={2}
                      fullWidth
                      required
                      value={clarificationAnswers[index] ?? ""}
                      onChange={(event) => setClarificationAnswers((answers) =>
                        answers.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer),
                      )}
                    />
                  ))}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isChecking || visibleQuestions.length === 0 || clarificationAnswers.some((answer) => !answer.trim())}
                  >
                    Submit Answers
                  </Button>
                </Stack>
              </Box>
            )}

            {clarification?.promptReady === true && (
              <Stack spacing={2}>
                <Alert severity="success">Context Ready</Alert>
                <Typography variant="body1">{clarification.analysisFramework}</Typography>
                <Button variant="contained" disabled>Continue to Practice</Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
