import { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  TextFields as TextFieldsIcon,
  SpeakerNotes as SpeakerNotesIcon,
  FormatQuote as FormatQuoteIcon,
  Lightbulb as LightbulbIcon,
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
  ContentPaste as ContentPasteIcon,
} from "@mui/icons-material";
import InfoModal from "./InfoModal";
import { db } from "../db/db";
import {
  areWordContentsEqual,
  normalizeWordKey,
  parsePastedJson,
} from "../utils/wordUtils";
import { uploadJson } from "../utils/fileUtils";

const processTags = (tagsInput) =>
  typeof tagsInput === "string"
    ? tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : Array.isArray(tagsInput)
    ? tagsInput
    : [];

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
  const { addWord, updateWord, words } = useWords();
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
    importOptions: null,
    maxWidth: null,
  });
  const [errors, setErrors] = useState({});

  // Paste JSON dialog states
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteJsonText, setPasteJsonText] = useState("");

  // Save state for import dialog actions (optional for advanced flows)
  const [pendingImport, setPendingImport] = useState(null);

  // --------------------------
  // Robust Import Handler!
  // --------------------------
  const handleImportInitiation = async (input) => {
    let importedWordsRaw;

    // PASTE: Directly-supplied JSON (from dialog)
    if (input?.importedWordsOverride) {
      importedWordsRaw = input.importedWordsOverride;
    } else if (input?.target?.files?.[0]) {
      // FILE: From file input
      const file = input.target.files[0];
      const fileName = file.name || "";
      const isJsonFile =
        fileName.toLowerCase().endsWith(".json") &&
        (file.type === "" || file.type.includes("json"));
      if (!isJsonFile) {
        setModalState({
          open: true,
          title: "Import Failed",
          message: "Please select a valid .json file.",
          type: "error",
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setModalState({
          open: true,
          title: "Import Failed",
          message: "File is too large. Maximum allowed size is 2MB.",
          type: "error",
        });
        return;
      }
      try {
        importedWordsRaw = await uploadJson(file);
      } catch (err) {
        console.error(err);
        setModalState({
          open: true,
          title: "Import Failed",
          message: "Could not read or parse the JSON file.",
          type: "error",
        });
        return;
      }
    } else {
      setModalState({
        open: true,
        title: "Import Failed",
        message: "No input provided for import.",
        type: "error",
      });
      return;
    }

    // Defensive: clone
    const importedWords = JSON.parse(JSON.stringify(importedWordsRaw));

    // --- Validation Logic (identical for both paste/file) ---
    if (!Array.isArray(importedWords) || importedWords.length === 0) {
      setModalState({
        open: true,
        title: "Import Failed",
        message: "The selected data is empty or not in the correct format.",
        type: "error",
      });
      return;
    }

    // File-level duplicate detection
    const seen = new Set();
    const dupWords = [];
    importedWords.forEach((w) => {
      const key = w.word?.trim().toLowerCase();
      if (key) {
        if (seen.has(key)) dupWords.push(w.word);
        seen.add(key);
      }
    });
    if (dupWords.length > 0) {
      setModalState({
        open: true,
        title: "Import Failed",
        message: (
          <Box>
            <Typography>
              The imported data contains duplicate words:{}{" "}
              <b>{dupWords.join(", ")}</b>.<br />
              Remove duplicates and try again.
            </Typography>
          </Box>
        ),
        type: "error",
        maxWidth: 600,
      });
      return;
    }

    // Field-level validation
    const validationErrors = [];
    importedWords.forEach((word, index) => {
      const missingFields = [];
      if (!word.word || typeof word.word !== "string" || !word.word.trim())
        missingFields.push("&quot;word&quot; (string, required)");
      if (
        !word.meaning ||
        typeof word.meaning !== "string" ||
        !word.meaning.trim()
      )
        missingFields.push("&quot;meaning&quot; (string, required)");
      if (
        word.tags &&
        !Array.isArray(word.tags) &&
        typeof word.tags !== "string"
      )
        missingFields.push(
          "&apos;tags&apos; (should be array or comma-separated string)"
        );
      if (missingFields.length > 0) {
        validationErrors.push(
          `Entry ${index + 1} (word: ${
            word.word || "N/A"
          }): Missing or invalid ${missingFields.join(" and ")}.`
        );
      }
    });

    if (validationErrors.length > 0) {
      setModalState({
        open: true,
        title: "Import Failed",
        message: (
          <Box sx={{ textAlign: "left" }}>
            <Typography>
              The following issues were found in your JSON data:
            </Typography>
            <ul>
              {validationErrors.map((error, idx) => (
                <li key={idx}>
                  <Typography>{error}</Typography>
                </li>
              ))}
            </ul>
            <Typography>
              Please ensure each word has valid &quot;word&quot; and
              &quot;meaning&quot; properties.
            </Typography>
          </Box>
        ),
        type: "error",
        maxWidth: 600,
      });
      return;
    }

    // Warn on huge batch (optional)
    if (importedWords.length > 500) {
      setModalState({
        open: true,
        title: "Import Warning",
        message: (
          <Typography>
            You&apos;re trying to import {importedWords.length} words at once.
            For best performance, consider importing smaller batches.
          </Typography>
        ),
        type: "info",
        maxWidth: 500,
      });
      // continue (let the user proceed)
    }

    // Existing words detection
    const existingWordMap = new Map(words.map((w) => [normalizeWordKey(w), w]));
    const newWords = [];
    const identical = [];
    const conflicting = [];

    for (const iw of importedWords) {
      const key = normalizeWordKey(iw);
      const ew = existingWordMap.get(key);
      if (ew) {
        if (areWordContentsEqual(ew, iw)) {
          identical.push(iw);
        } else {
          conflicting.push(iw);
        }
      } else {
        newWords.push(iw);
      }
    }

    // --- Show modal with options ---
    if (
      newWords.length === 0 &&
      conflicting.length === 0 &&
      identical.length > 0
    ) {
      setModalState({
        open: true,
        title: "Nothing to Import",
        message:
          "All words in the imported data already exist and are identical. No changes needed.",
        type: "info",
      });
      return;
    }

    // All new words: Add directly
    if (newWords.length === importedWords.length) {
      let addedCount = 0;
      for (const w of newWords) {
        await addWord(w);
        addedCount++;
      }
      setModalState({
        open: true,
        title: "Import Success",
        message: `${addedCount} new word(s) added successfully!`,
        type: "success",
        maxWidth: 500,
      });
      return;
    }

    // All conflicting: ask for overwrite
    if (conflicting.length === importedWords.length) {
      setPendingImport({ newWords: [], conflicting });
      setModalState({
        open: true,
        title: "Import Conflicts",
        message: (
          <Box sx={{ textAlign: "left" }}>
            <Typography>
              All words in the imported data already exist, but their content is
              different.
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Do you want to overwrite the existing words with the imported
              data?
            </Typography>
          </Box>
        ),
        type: "confirm",
        maxWidth: 600,
        importOptions: ["overwrite", "cancel"],
      });
      return;
    }

    // Mix of new/identical/conflicting
    setPendingImport({ newWords, conflicting });
    setModalState({
      open: true,
      title: "Confirm Import Actions",
      message: (
        <Box sx={{ textAlign: "left" }}>
          {newWords.length > 0 && (
            <Typography>
              The following new word(s) will be added:{" "}
              {newWords.map((w) => w.word).join(", ")}
            </Typography>
          )}
          {conflicting.length > 0 && (
            <Typography>
              The following word(s) exist but have different content and can be
              overwritten: {conflicting.map((w) => w.word).join(", ")}
            </Typography>
          )}
          {identical.length > 0 && (
            <Typography>
              The following word(s) already exist and are identical (will be
              skipped): {identical.map((w) => w.word).join(", ")}
            </Typography>
          )}
          <Typography sx={{ mt: 2 }}>
            <b>What would you like to do?</b>
            <br />- <b>Overwrite:</b> Add new words and update existing words
            with different content.
            <br />- <b>Add Only New:</b> Add only new words, skip all existing
            words (identical or different).
            <br />- <b>Cancel:</b> Do nothing.
          </Typography>
        </Box>
      ),
      type: "confirm",
      maxWidth: 600,
      importOptions: ["overwrite", "addOnlyNew", "cancel"],
    });
  };

  // Handle modal actions (overwrite/addOnlyNew/cancel)
  const handleImportModalAction = async (action) => {
    if (!pendingImport) {
      setModalState({ ...modalState, open: false });
      return;
    }
    if (action === "overwrite") {
      // Add new and update conflicting
      let count = 0;
      for (const w of pendingImport.newWords) {
        await addWord(w);
        count++;
      }
      for (const w of pendingImport.conflicting) {
        // Try to find ID to update
        const existing = words.find(
          (ew) => normalizeWordKey(ew) === normalizeWordKey(w)
        );
        if (existing) {
          await updateWord(existing.id, {
            ...w,
            tags: processTags(w.tags),
          });
          count++;
        }
      }
      setModalState({
        open: true,
        title: "Import Success",
        message: `${count} word(s) imported and/or updated!`,
        type: "success",
      });
      setPendingImport(null);
    } else if (action === "addOnlyNew") {
      // Only add new words
      let count = 0;
      for (const w of pendingImport.newWords) {
        await addWord(w);
        count++;
      }
      setModalState({
        open: true,
        title: "Import Success",
        message: `${count} new word(s) added! (Existing words skipped.)`,
        type: "success",
      });
      setPendingImport(null);
    } else {
      // Cancel
      setModalState({ ...modalState, open: false });
      setPendingImport(null);
    }
  };

  // Handle input changes for the Add Word form
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
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Overwrite handler for single word updates (not import)
  const handleConfirmOverwrite = async () => {
    const { existingWordId, newWordData } = modalState.data || {};
    if (!existingWordId || !newWordData) {
      setModalState({ ...modalState, open: false });
      return;
    }
    try {
      await updateWord(existingWordId, {
        ...newWordData,
        tags: processTags(newWordData.tags),
      });
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

  // Add Word submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formState.word.trim()) newErrors.word = "Word is required";
    if (!formState.meaning.trim()) newErrors.meaning = "Meaning is required";

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
            `The word &quot;${formState.word}&quot; is already present in your vocabulary.`,
            "info"
          );
        } else {
          setModalState({
            open: true,
            title: "Word Already Exists",
            message: `The word &quot;${formState.word}&quot; already exists in your vocabulary with different details. Do you want to update its details?`,
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
          {/* Part of Speech */}
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
          Context &amp; Memory Aids
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
        {/* Button row with Add + Paste JSON */}
        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
          >
            Add Word
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentPasteIcon />}
            onClick={() => setPasteDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            Paste JSON
          </Button>
        </Box>
      </Box>
      {/* Paste JSON dialog */}
      <Dialog
        open={pasteDialogOpen}
        onClose={() => setPasteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Paste Words as JSON</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }} color="text.secondary">
            Paste your JSON array of words here.
          </Typography>
          <TextField
            value={pasteJsonText}
            onChange={(e) => setPasteJsonText(e.target.value)}
            placeholder='[{"word": "...", "meaning": "..."}]'
            minRows={8}
            fullWidth
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const result = parsePastedJson(pasteJsonText);
                if (!result.success) {
                  setModalState({
                    open: true,
                    title: "Invalid JSON",
                    message: result.error,
                    type: "error",
                  });
                } else {
                  await handleImportInitiation({
                    importedWordsOverride: result.data,
                  });
                }
              } catch (err) {
                console.error(err);
                setModalState({
                  open: true,
                  title: "Error",
                  message: "Could not process pasted JSON.",
                  type: "error",
                });
              }
              setPasteDialogOpen(false);
              setPasteJsonText("");
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar and modal feedback */}
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
        onClose={() => setModalState({ ...modalState, open: false })}
        onConfirm={
          modalState.importOptions
            ? () => handleImportModalAction("overwrite")
            : handleConfirmOverwrite
        }
        onAddOnlyNew={
          modalState.importOptions
            ? () => handleImportModalAction("addOnlyNew")
            : undefined
        }
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        maxWidth={modalState.maxWidth}
        importOptions={modalState.importOptions}
      />
    </>
  );
};

export default AddWordForm;
