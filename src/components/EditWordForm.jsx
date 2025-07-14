import React, { useState } from "react";
import { useWords } from "../hooks/useWords";
import {
  TextField,
  Button,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Typography,
  Divider,
} from "@mui/material";
import {
  TextFields as TextFieldsIcon,
  SpeakerNotes as SpeakerNotesIcon,
  FormatQuote as FormatQuoteIcon,
  Lightbulb as LightbulbIcon,
  LocalOffer as LocalOfferIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const partsOfSpeech = [
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Pronoun",
  "Preposition",
  "Conjunction",
  "Interjection",
  "Other",
];

const EditWordForm = ({ word, onSave }) => {
  const { updateWord } = useWords();
  const [formState, setFormState] = useState({
    ...word,
    tags: Array.isArray(word.tags) ? word.tags.join(", ") : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateWord(word.id, {
      ...formState,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    });
    onSave();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Edit Word
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            name="word"
            label="Word"
            variant="outlined"
            value={formState.word}
            onChange={handleChange}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextFieldsIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="part-of-speech-label">Part of Speech</InputLabel>
            <Select
              labelId="part-of-speech-label"
              name="partOfSpeech"
              value={formState.partOfSpeech}
              onChange={handleChange}
              label="Part of Speech"
            >
              {partsOfSpeech.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="meaning"
            label="Meaning"
            variant="outlined"
            value={formState.meaning}
            onChange={handleChange}
            required
            fullWidth
            multiline
            minRows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SpeakerNotesIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="sampleSentence"
            label="Sample Sentence"
            variant="outlined"
            multiline
            minRows={3}
            value={formState.sampleSentence}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FormatQuoteIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="mnemonic"
            label="Mnemonic"
            variant="outlined"
            multiline
            minRows={3}
            value={formState.mnemonic}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LightbulbIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="tags"
            label="Tags (comma-separated)"
            variant="outlined"
            value={formState.tags}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onSave} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default EditWordForm;
