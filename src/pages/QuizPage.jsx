import React, { useState } from "react";
import Quiz from "../components/Quiz";
import { Typography, Box } from "@mui/material";

const QuizPage = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);

  return (
    <Box sx={{ maxWidth: "700px", mx: "auto" }}>
      <Quiz onSessionStateChange={setIsSessionActive} />
    </Box>
  );
};

export default QuizPage;
