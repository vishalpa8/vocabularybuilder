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
  Snackbar,
  Alert,
  Typography,
  Divider,
} from "@mui/material";
import {
  TextFields as TextFieldsIcon,
  SpeakerNotes as SpeakerNotesIcon,
  FormatQuote as FormatQuoteIcon,
  Lightbulb as LightbulbIcon,
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import InfoModal from "./InfoModal";
import { db } from "../db/db";
import { areWordContentsEqual } from "../utils/wordUtils";

const processTags = (tagsInput) => {
  return typeof tagsInput === "string"
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : Array.isArray(tagsInput)
    ? tagsInput
    : [];
};

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

const AddWordForm = () => {
  const { addWord, updateWord } = useWords();
  const [formState, setFormState] = useState({
    word: "",
    meaning: "",
    partOfSpeech: "",
    sampleSentence: "",
    tags: "",
    mnemonic: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    data: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value.trimStart() }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleConfirmOverwrite = async () => {
    const { existingWordId, newWordData } = modalState.data;
    try {
      const processedTags = processTags(newWordData.tags);
      await updateWord(existingWordId, { ...newWordData, tags: processedTags });
      showSnackbar("Word updated successfully!", "success");
      setFormState({
        word: "",
        meaning: "",
        partOfSpeech: "",
        sampleSentence: "",
        tags: "",
        mnemonic: "",
      });
    } catch (error) {
      showSnackbar("Failed to update word.", "error");
      console.error("Error updating word:", error);
    } finally {
      setModalState({
        open: false,
        title: "",
        message: "",
        type: "info",
        data: null,
      });
    }
  };

  const handleCancelOverwrite = () => {
    setModalState({
      open: false,
      title: "",
      message: "",
      type: "info",
      data: null,
    });
    showSnackbar("Word addition cancelled.", "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formState.word.trim()) {
      newErrors.word = "Word is required";
    }
    if (!formState.meaning.trim()) {
      newErrors.meaning = "Meaning is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showSnackbar("Please fill in all required fields.", "error");
      return;
    }

    try {
      const existingWord = await db.words
        .where("word")
        .equalsIgnoreCase(formState.word.trim())
        .first();

      const currentFormData = {
        ...formState,
        tags: processTags(formState.tags),
      };
      if (existingWord) {
        const equal = areWordContentsEqual(existingWord, currentFormData);
        if (equal) {
          showSnackbar(
            `The word "${formState.word}" is already present in your vocabulary.`,
            "info"
          );
        } else {
          setModalState({
            open: true,
            title: "Word Already Exists",
            message: `The word "${formState.word}" already exists in your vocabulary with different details. Do you want to update its details?`,
            type: "confirm",
            data: { existingWordId: existingWord.id, newWordData: formState },
          });
        }
      } else {
        await addWord({
          ...formState,
          tags: processTags(formState.tags),
          lastReviewed: new Date(),
          nextReview: new Date(),
          streak: 0,
          isLearned: false,
          isFavorite: false,
          isDifficult: false,
        });
        showSnackbar("Word added successfully!", "success");
        setFormState({
          word: "",
          meaning: "",
          partOfSpeech: "",
          sampleSentence: "",
          tags: "",
          mnemonic: "",
        });
      }
    } catch (error) {
      showSnackbar("Failed to add word.", "error");
      console.error("Error adding word:", error);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" gutterBottom>
          Core Details
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {/* Word (required, icon, custom red star) */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="word"
              label={
                <span>
                  <TextFieldsIcon
                    fontSize="small"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Word
                  <span
                    style={{
                      color: "#d32f2f",
                      marginLeft: 6,
                      fontWeight: 700,
                      fontSize: "1.1em",
                    }}
                  >
                    *
                  </span>
                </span>
              }
              value={formState.word}
              onChange={handleChange}
              fullWidth
              error={!!errors.word}
              helperText={errors.word}
            />
          </Grid>

          {/* Part of Speech (unchanged) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 160 }}>
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

          {/* Meaning (required, icon, custom red star) */}
          <Grid item xs={12}>
            <TextField
              name="meaning"
              label={
                <span>
                  <SpeakerNotesIcon
                    fontSize="small"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Meaning
                  <span
                    style={{
                      color: "#d32f2f",
                      marginLeft: 6,
                      fontWeight: 700,
                      fontSize: "1.1em",
                    }}
                  >
                    *
                  </span>
                </span>
              }
              value={formState.meaning}
              onChange={handleChange}
              fullWidth
              error={!!errors.meaning}
              helperText={errors.meaning}
            />
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Context & Memory Aids
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Sample Sentence (icon, no star) */}
          <Grid item xs={12}>
            <TextField
              name="sampleSentence"
              label={
                <span>
                  <FormatQuoteIcon
                    fontSize="small"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Sample Sentence
                </span>
              }
              value={formState.sampleSentence}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              helperText="Use the word in a sentence to provide context."
            />
          </Grid>

          {/* Mnemonic (icon, no star) */}
          <Grid item xs={12}>
            <TextField
              name="mnemonic"
              label={
                <span>
                  <LightbulbIcon
                    fontSize="small"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Mnemonic (optional)
                </span>
              }
              value={formState.mnemonic}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              helperText="A short rhyme, phrase, or association to help remember the word."
            />
          </Grid>

          {/* Tags (icon, no star) */}
          <Grid item xs={12}>
            <TextField
              name="tags"
              label={
                <span>
                  <LocalOfferIcon
                    fontSize="small"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Tags (comma-separated)
                </span>
              }
              value={formState.tags}
              onChange={handleChange}
              fullWidth
              helperText="e.g., 'work', 'science', 'literature'"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
          >
            Add Word
          </Button>
        </Box>
      </Box>

      {/* Snackbar, InfoModal etc. */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <InfoModal
        open={modalState.open}
        onClose={handleCancelOverwrite}
        onConfirm={handleConfirmOverwrite}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </>
  );
};
export default AddWordForm;
