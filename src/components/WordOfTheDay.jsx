import React, { useState, useEffect } from "react";
import { useWords } from "../hooks/useWords";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import { WbSunny } from "@mui/icons-material";

const WordOfTheDay = () => {
  const { words } = useWords();
  const [wordOfTheDay, setWordOfTheDay] = useState(null);

  useEffect(() => {
    if (words && words.length > 0) {
      const today = new Date().toDateString();
      const storedWordData = JSON.parse(localStorage.getItem("wordOfTheDay"));

      if (storedWordData && storedWordData.date === today) {
        setWordOfTheDay(storedWordData.word);
      } else {
        const newWord = words[Math.floor(Math.random() * words.length)];
        localStorage.setItem(
          "wordOfTheDay",
          JSON.stringify({ word: newWord, date: today })
        );
        setWordOfTheDay(newWord);
      }
    }
  }, [words]);

  if (!words) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!wordOfTheDay) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4 },
        mt: 4,
        borderRadius: 3,
        maxWidth: 600,
        width: "100%",
        mx: "auto",
        boxShadow: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      elevation={3}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 800,
          letterSpacing: 1,
          color: "primary.main",
        }}
      >
        Word of the Day
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          mb: 2,
        }}
      >
        <WbSunny sx={{ fontSize: 46, color: "orange" }} />
        <Typography
          variant="h3"
          component="div"
          fontWeight="bold"
          sx={{
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          {wordOfTheDay.word}
        </Typography>
      </Box>

      <Typography
        color="text.secondary"
        sx={{
          textAlign: "center",
          fontSize: "1.25rem",
          maxWidth: 480,
          mt: 1,
        }}
      >
        {wordOfTheDay.meaning}
      </Typography>
    </Paper>
  );
};

export default WordOfTheDay;
