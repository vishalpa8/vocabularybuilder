import React from "react";
import Quiz from "../components/Quiz";
import { Box } from "@mui/material";

const QuizPage = () => {
  return (
    <Box sx={{ maxWidth: "700px", mx: "auto" }}>
      <Quiz />
    </Box>
  );
};

export default QuizPage;
