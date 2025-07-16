import React, { useState, useMemo } from "react";
import WordList from "../components/WordList";
import VirtualWordList from "../components/VirtualWordList";
import {
  TextField,
  Box,
  Typography,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ListIcon from "@mui/icons-material/List";
import { useWords } from "../hooks/useWords";
import { useDebounce } from "../hooks/usePerformanceMonitor";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const { words } = useWords();

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize unique tags calculation
  const allTags = useMemo(() => {
    if (!words) return [];
    return Array.from(
      new Set(
        words
          .flatMap((w) => w.tags || [])
          .filter((tag) => tag && tag.trim() !== "")
      )
    );
  }, [words]);

  // Determine if we should use virtual scrolling (for lists > 50 items)
  const shouldUseVirtualScrolling = useMemo(() => {
    return words && words.length > 50;
  }, [words]);

  // Quick stats calculation
  const quickStats = useMemo(() => {
    if (!words || words.length === 0) {
      return {
        totalWords: 0,
        wordsLearned: 0,
        favoriteWords: 0,
      };
    }

    const totalWords = words.length;
    const wordsLearned = words.filter(word => word.isLearned).length;
    const favoriteWords = words.filter(word => word.isFavorite).length;

    return {
      totalWords,
      wordsLearned,
      favoriteWords,
    };
  }, [words]);

  return (
    <Box sx={{ position: "relative" }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Your Personal Vocabulary
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Search, review, and master words you&apos;ve collected.
        </Typography>
        
        {/* Integrated Stats in Hero */}
        {words && words.length > 0 && (
          <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {quickStats.totalWords}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Words
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {quickStats.wordsLearned}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mastered
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {quickStats.favoriteWords}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Favorites
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

      {/* Controls: Toggle and Tag Filter in a Row */}
      <Box sx={{ my: 4, display: "flex", justifyContent: "center" }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            width: "auto",
            maxWidth: 600,
            bgcolor: "background.default",
          }}
        >
          <ToggleButtonGroup
            value={showFavourites ? "favourites" : "all"}
            exclusive
            onChange={(_, value) => {
              if (value !== null) setShowFavourites(value === "favourites");
            }}
            size="small"
          >
            <ToggleButton value="all">
              <ListIcon sx={{ mr: 1 }} />
              All
            </ToggleButton>
            <ToggleButton value="favourites">
              <FavoriteIcon
                color={showFavourites ? "error" : "action"}
                sx={{ mr: 1 }}
              />
              Favourites
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel id="tag-select-label">Filter by Tag</InputLabel>
            <Select
              labelId="tag-select-label"
              value={selectedTag}
              label="Filter by Tag"
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <MenuItem value="">All Tags</MenuItem>
              {allTags.length === 0 ? (
                <MenuItem value="" disabled>
                  No tags available
                </MenuItem>
              ) : (
                allTags.map((tag) => (
                  <MenuItem value={tag} key={tag}>
                    {tag}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <TextField
          label="Search for a word..."
          variant="outlined"
          sx={{ maxWidth: "600px", width: "100%" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {shouldUseVirtualScrolling ? (
        <VirtualWordList
          words={words}
          searchTerm={debouncedSearchTerm}
          showFavourites={showFavourites}
          selectedTag={selectedTag}
        />
      ) : (
        <WordList
          searchTerm={debouncedSearchTerm}
          showFavourites={showFavourites}
          selectedTag={selectedTag}
        />
      )}
    </Box>
  );
};

export default HomePage;
