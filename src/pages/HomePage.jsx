import React, { useState } from "react";
import WordList from "../components/WordList";
import WordOfTheDay from "../components/WordOfTheDay";
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

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const { words } = useWords();

  // Gather unique tags
  const allTags = words
    ? Array.from(
        new Set(
          words
            .flatMap((w) => w.tags || [])
            .filter((tag) => tag && tag.trim() !== "")
        )
      )
    : [];

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h2" gutterBottom>
          Your Personal Vocabulary
        </Typography>
        <Typography color="text.secondary">
          Search, review, and master words you&apos;ve collected.
        </Typography>
      </Box>

      <WordOfTheDay />

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
      <WordList
        searchTerm={searchTerm}
        showFavourites={showFavourites}
        selectedTag={selectedTag}
      />
    </Box>
  );
};

export default HomePage;
