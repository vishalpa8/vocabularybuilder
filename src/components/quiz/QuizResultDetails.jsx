import React, { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  ArrowDropDown,
  ArrowDropUp,
} from "@mui/icons-material";

const QuizResultDetails = ({ results }) => {
  const [open, setOpen] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        mb: 1,
        p: 0,
        background: "transparent",
        boxShadow: "none",
      }}
    >
      <Box>
        <Button
          onClick={() => setOpen((prev) => !prev)}
          endIcon={open ? <ArrowDropUp /> : <ArrowDropDown />}
          aria-expanded={open}
          sx={{ mb: 1, ml: 0 }}
        >
          Details
        </Button>
        <Collapse in={open} sx={{ width: "100%" }}>
          <List dense sx={{ width: "100%" }}>
            {results.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {result.isCorrect ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <Cancel color="error" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={result.word.word}
                  secondary={
                    <>
                      <span>
                        Your answer: <b>{result.selectedAnswer}</b>
                        {" | "}
                        Correct: <b>{result.word.meaning}</b>
                      </span>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default QuizResultDetails;
