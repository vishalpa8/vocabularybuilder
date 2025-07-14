import React, { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CheckCircle, Cancel, ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const QuizResultDetails = ({ results }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button onClick={() => setOpen(!open)} endIcon={open ? <ArrowDropUp /> : <ArrowDropDown />}>
        Details
      </Button>
      <Collapse in={open} sx={{ width: '100%' }}>
        <List dense>
          {results.map((result, index) => (
            <ListItem key={index}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {result.isCorrect ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                primary={result.word.word}
                secondary={`Your answer: ${result.selectedAnswer} | Correct: ${result.word.meaning}`}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

export default QuizResultDetails;
