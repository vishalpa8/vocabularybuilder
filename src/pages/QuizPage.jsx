import React, { useState } from "react";
import Quiz from "../components/Quiz";
import { Typography, Box } from "@mui/material";

const QuizPage = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);

  return (
    <Box sx={{ maxWidth: "700px", mx: "auto" }}>
      {!isSessionActive && (
        <>
          <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
            Vocabulary Quiz
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
            Select the number of questions and start your test.
          </Typography>
        </>
      )}
      <Quiz onSessionStateChange={setIsSessionActive} />
    </Box>
  );
};

export default QuizPage;
