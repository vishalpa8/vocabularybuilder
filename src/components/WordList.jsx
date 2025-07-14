import React from "react";
import { useWords } from "../hooks/useWords";
import WordCard from "./WordCard";
import { Grid, Typography, Box, CircularProgress } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const WordList = ({
  searchTerm = "",
  showFavourites = false,
  selectedTag = "",
}) => {
  const { words } = useWords();

  if (typeof words === "undefined") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  let filteredWords = words;

  if (showFavourites) {
    filteredWords = filteredWords.filter((word) => !!word.isFavorite);
  }

  if (selectedTag) {
    filteredWords = filteredWords.filter(
      (word) => Array.isArray(word.tags) && word.tags.includes(selectedTag)
    );
  }

  const search = searchTerm.trim().toLowerCase();
  if (search) {
    filteredWords = filteredWords.filter((word) =>
      (word.word || "").toLowerCase().includes(search)
    );
  }

  let emptyMsg = "No Words Found";
  if (showFavourites && selectedTag) {
    emptyMsg = `No Favourites with tag "${selectedTag}"`;
  } else if (showFavourites) {
    emptyMsg = "No Favourites Yet!";
  } else if (selectedTag) {
    emptyMsg = `No Words Found for tag "${selectedTag}"`;
  }

  if (filteredWords.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          my: 4,
          p: 4,
          border: "2px dashed grey",
          borderRadius: "12px",
        }}
      >
        <AddCircleOutlineIcon sx={{ fontSize: 48, color: "grey.500", mb: 2 }} />
        <Typography variant="h6">{emptyMsg}</Typography>
        <Typography color="text.secondary">
          {search
            ? "Try a different search term"
            : showFavourites
            ? "Mark words as favourite to see them here."
            : selectedTag
            ? "Try another tag or add words with this tag."
            : 'Click "Add Word" to start your collection!'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr",
        },
        gap: 3,
      }}
    >
      {filteredWords.map((word) => (
        <Box key={word.id}>
          <WordCard word={word} />
        </Box>
      ))}
    </Box>
  );
};

export default WordList;
