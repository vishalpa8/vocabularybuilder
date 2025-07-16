import React, { useMemo } from "react";
import { useWords } from "../hooks/useWords";
import WordCard from "./WordCard";
import { Typography, Box, CircularProgress } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const WordList = ({
  searchTerm = "",
  showFavourites = false,
  selectedTag = "",
}) => {
  const { words } = useWords();

  // Memoize filtered words for performance
  const { filteredWords, emptyMsg } = useMemo(() => {
    if (!words) return { filteredWords: [], emptyMsg: "No Words Found" };

    let filtered = words;

    if (showFavourites) {
      filtered = filtered.filter((word) => !!word.isFavorite);
    }

    if (selectedTag) {
      filtered = filtered.filter(
        (word) => Array.isArray(word.tags) && word.tags.includes(selectedTag)
      );
    }

    const search = searchTerm.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter((word) =>
        (word.word || "").toLowerCase().includes(search)
      );
    }

    let message = "No Words Found";
    if (showFavourites && selectedTag) {
      message = `No Favourites with tag "${selectedTag}"`;
    } else if (showFavourites) {
      message = "No Favourites Yet!";
    } else if (selectedTag) {
      message = `No Words Found for tag "${selectedTag}"`;
    }

    return { filteredWords: filtered, emptyMsg: message };
  }, [words, searchTerm, showFavourites, selectedTag]);

  if (typeof words === "undefined") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
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
          {searchTerm.trim()
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
