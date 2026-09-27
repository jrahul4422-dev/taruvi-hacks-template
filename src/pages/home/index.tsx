import { useState, type FormEvent } from "react";
import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export const Home = () => {
  const navigate = useNavigate();
  const [scenarioContext, setScenarioContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scenarioContext.trim()) return;

    navigate("/follow-up", { state: { scenarioContext, selectedFile } });
  };

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
                Confidence Builder
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Practice real-world situations before they happen.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleContinue}>
              <Stack spacing={3}>
                <TextField
                  label="What situation are you preparing for?"
                  placeholder="Example: I have an AI Engineer interview tomorrow and I want to improve how I explain my project experience confidently."
                  slotProps={{ inputLabel: { shrink: true } }}
                  multiline
                  minRows={5}
                  fullWidth
                  value={scenarioContext}
                  onChange={(event) => setScenarioContext(event.target.value)}
                />
                <Stack spacing={1.5} alignItems="flex-start">
                  <Typography variant="body1" fontWeight={600}>
                    Upload supporting material (optional)
                  </Typography>
                  <Button component="label" variant="outlined">
                    Upload Resume / CV
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={(event) => {
                        setSelectedFile(event.target.files?.[0] ?? null);
                        event.target.value = "";
                      }}
                    />
                  </Button>
                  {selectedFile && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ maxWidth: "100%" }}>
                      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                        {selectedFile.name}
                      </Typography>
                      <Button type="button" size="small" onClick={() => setSelectedFile(null)}>
                        Remove
                      </Button>
                    </Stack>
                  )}
                </Stack>
                <Button type="submit" variant="contained" size="large" disabled={!scenarioContext.trim()}>
                  Continue
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
