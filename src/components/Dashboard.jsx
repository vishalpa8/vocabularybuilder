import React, { useState } from "react";
import { useWords } from "../hooks/useWords";
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { downloadJson, uploadJson } from "../utils/fileUtils";
import {
  Book,
  School,
  Schedule,
  Upload,
  Download,
  Info,
  ExpandMore,
} from "@mui/icons-material";
import InfoModal from "./InfoModal";
import { areWordContentsEqual, normalizeWordKey } from "../utils/wordUtils";

const Dashboard = () => {
  const { words, addWord, updateWord } = useWords();
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    maxWidth: 400,
  });
  const [fileToImport, setFileToImport] = useState(null);
  const [wordsToOverwrite, setWordsToOverwrite] = useState([]);
  const [identicalWords, setIdenticalWords] = useState([]);

  // Export words to JSON
  const handleExport = () => {
    if (words && words.length > 0) {
      downloadJson(words, "vocabulary.json");
    } else {
      setModalState({
        open: true,
        title: "Export Failed",
        message: "There are no words to export.",
        type: "info",
      });
    }
  };

  // Show JSON format info
  const handleShowInfo = () => {
    setModalState({
      open: true,
      title: "JSON Format Information",
      message: (
        <Box sx={{ textAlign: "left" }}>
          <Typography>
            The JSON file should be an array of objects, where each object
            represents a word. The following fields are supported:
          </Typography>
          <ul>
            <li>word (string, required)</li>
            <li>meaning (string, required)</li>
            <li>partOfSpeech (string)</li>
            <li>sampleSentence (string)</li>
            <li>tags (array of strings)</li>
            <li>mnemonic (string)</li>
          </ul>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Example</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                <code>
                  {`[
  {
    "word": "Ephemeral",
    "meaning": "Lasting for a very short time.",
    "partOfSpeech": "Adjective",
    "sampleSentence": "The beauty of the cherry blossoms is ephemeral.",
    "tags": ["transience", "nature"],
    "mnemonic": "Sounds like 'a funeral' - life is short."
  }
]`}
                </code>
              </pre>
            </AccordionDetails>
          </Accordion>
        </Box>
      ),
      type: "info",
      maxWidth: 600,
    });
  };

  // Main import logic
  const handleImportInitiation = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedWords = await uploadJson(file);
      if (!Array.isArray(importedWords) || importedWords.length === 0) {
        setModalState({
          open: true,
          title: "Import Failed",
          message: "The selected file is empty or not in the correct format.",
          type: "error",
        });
        return;
      }

      // Validate imported words (required fields)
      const validationErrors = [];
      importedWords.forEach((word, index) => {
        const missingFields = [];
        if (!word.word) missingFields.push('"word"');
        if (!word.meaning) missingFields.push('"meaning"');
        if (missingFields.length > 0) {
          validationErrors.push(
            `Entry ${index + 1} (word: ${
              word.word || "N/A"
            }): Missing ${missingFields.join(" and ")} property.`
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
                The following issues were found in your JSON file:
              </Typography>
              <ul>
                {validationErrors.map((error, idx) => (
                  <li key={idx}>
                    <Typography>{error}</Typography>
                  </li>
                ))}
              </ul>
              <Typography>
                Please ensure each word has a "word" and "meaning" property.
              </Typography>
            </Box>
          ),
          type: "error",
          maxWidth: 600,
        });
        return;
      }

      // Build normalized word map for existing words
      const existingWordMap = new Map(
        words.map((w) => [normalizeWordKey(w), w])
      );

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

      // All identical (nothing to do)
      if (
        newWords.length === 0 &&
        conflicting.length === 0 &&
        identical.length > 0
      ) {
        setModalState({
          open: true,
          title: "Nothing to Import",
          message:
            "All words in the imported file already exist and are identical. No changes needed.",
          type: "info",
        });
        return;
      }

      // All new words
      if (newWords.length === importedWords.length) {
        // Add all new words immediately, no confirmation needed
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
      // All conflicting (same word, different data)
      if (conflicting.length === importedWords.length) {
        setFileToImport([]);
        setWordsToOverwrite(conflicting);
        setIdenticalWords([]);
        setModalState({
          open: true,
          title: "Import Conflicts",
          message: (
            <Box sx={{ textAlign: "left" }}>
              <Typography>
                All words in the imported file already exist, but their content
                is different.
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Do you want to overwrite the existing words with the imported
                data?
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 120,
                  overflow: "auto",
                  my: 1,
                  p: 1,
                  background: (theme) => theme.palette.grey[100],
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {conflicting.map((w) => (
                    <Chip key={w.word} label={w.word} />
                  ))}
                </Box>
              </Paper>
            </Box>
          ),
          type: "confirm",
          maxWidth: 600,
          importOptions: ["overwrite", "cancel"],
        });
        return;
      }

      // Mix of new, identical, and conflicting
      setFileToImport(newWords); // will be added
      setWordsToOverwrite(conflicting); // will be overwritten
      setIdenticalWords(identical);

      let messageContent = (
        <Box sx={{ textAlign: "left" }}>
          {newWords.length > 0 && (
            <>
              <Typography>The following new word(s) will be added:</Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 100,
                  overflow: "auto",
                  my: 1,
                  p: 1,
                  background: (theme) => theme.palette.grey[100],
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {newWords.map((w) => (
                    <Chip key={w.word} label={w.word} />
                  ))}
                </Box>
              </Paper>
            </>
          )}
          {conflicting.length > 0 && (
            <>
              <Typography sx={{ mt: newWords.length > 0 ? 2 : 0 }}>
                The following word(s) exist but have different content and can
                be overwritten:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 100,
                  overflow: "auto",
                  my: 1,
                  p: 1,
                  background: (theme) => theme.palette.grey[100],
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {conflicting.map((w) => (
                    <Chip key={w.word} label={w.word} />
                  ))}
                </Box>
              </Paper>
            </>
          )}
          {identical.length > 0 && (
            <>
              <Typography
                sx={{
                  mt: newWords.length > 0 || conflicting.length > 0 ? 2 : 0,
                }}
              >
                The following word(s) already exist and are identical (will be
                skipped):
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 100,
                  overflow: "auto",
                  my: 1,
                  p: 1,
                  background: (theme) => theme.palette.grey[100],
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {identical.map((w) => (
                    <Chip key={w.word} label={w.word} />
                  ))}
                </Box>
              </Paper>
            </>
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
      );

      setModalState({
        open: true,
        title: "Confirm Import Actions",
        message: messageContent,
        type: "confirm",
        maxWidth: 600,
        importOptions: ["overwrite", "addOnlyNew", "cancel"],
      });
    } catch (error) {
      setModalState({
        open: true,
        title: "Error",
        message: `Error reading file: ${error.message}`,
        type: "error",
      });
    }
  };

  // Overwrite + add new
  const handleImportConfirmation = async () => {
    const existingWordMap = new Map(words.map((w) => [normalizeWordKey(w), w]));
    const wordsToAdd = fileToImport || [];
    const wordsToUpdate = wordsToOverwrite || [];
    try {
      let addedCount = 0;
      let updatedCount = 0;
      for (const word of wordsToAdd) {
        await addWord(word);
        addedCount++;
      }
      for (const word of wordsToUpdate) {
        const key = normalizeWordKey(word);
        const existingWord = existingWordMap.get(key);
        if (existingWord) {
          // Clean the update to avoid blanking out data
          await updateWord(existingWord.id, cleanUpdateObject(word));
          updatedCount++;
        }
      }
      let successMessage = "";
      if (addedCount > 0 && updatedCount > 0) {
        successMessage = `${addedCount} new word(s) added and ${updatedCount} word(s) updated successfully!`;
      } else if (addedCount > 0) {
        successMessage = `${addedCount} new word(s) added successfully!`;
      } else if (updatedCount > 0) {
        successMessage = `${updatedCount} word(s) updated successfully!`;
      } else {
        successMessage = "No changes were made to your vocabulary.";
      }
      setModalState({
        open: true,
        title: "Import Summary",
        message: successMessage,
        type: "success",
      });
    } catch (error) {
      setModalState({
        open: true,
        title: "Import Error",
        message: `An error occurred during import: ${error.message}`,
        type: "error",
      });
    } finally {
      setFileToImport(null);
      setWordsToOverwrite([]);
      setIdenticalWords([]);
    }
  };

  // Add Only New Words
  const handleAddOnlyNewWords = async () => {
    const wordsToAdd = fileToImport || [];
    try {
      let addedCount = 0;
      for (const word of wordsToAdd) {
        await addWord(word);
        addedCount++;
      }
      setModalState({
        open: true,
        title: "Import Summary",
        message: `${addedCount} new word(s) added successfully! Existing words were unchanged.`,
        type: "success",
      });
    } catch (error) {
      setModalState({
        open: true,
        title: "Import Error",
        message: `An error occurred during import: ${error.message}`,
        type: "error",
      });
    } finally {
      setFileToImport(null);
      setWordsToOverwrite([]);
      setIdenticalWords([]);
    }
  };

  const closeModal = () => {
    setModalState({
      open: false,
      title: "",
      message: "",
      type: "info",
      maxWidth: 400,
      importOptions: [],
    });
    setFileToImport(null);
    setWordsToOverwrite([]);
    setIdenticalWords([]);
  };

  if (!words) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalWords = words.length;
  const wordsLearned = words.filter((word) => word.isLearned).length;
  const wordsDueForReview = words.filter(
    (word) => new Date(word.nextReview) <= new Date() && !word.isLearned
  ).length;

  const StatCard = ({ title, value, icon }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 2,
          height: "100%",
          minHeight: 120,
        }}
        elevation={2}
      >
        {icon}
        <Box>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          <Typography color="text.secondary">{title}</Typography>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Box>
      {/* --- Stats Cards Row --- */}
      <Grid
        container
        spacing={3}
        sx={{
          mb: 3,
          mt: 1,
          maxWidth: 1100,
          mx: "auto",
          justifyContent: "center",
        }}
      >
        <StatCard
          title="Total Words"
          value={totalWords}
          icon={<Book sx={{ fontSize: 40 }} color="primary" />}
        />
        <StatCard
          title="Words Mastered"
          value={wordsLearned}
          icon={<School sx={{ fontSize: 40 }} color="success" />}
        />
        <StatCard
          title="Due for Review"
          value={wordsDueForReview}
          icon={<Schedule sx={{ fontSize: 40 }} color="error" />}
        />
      </Grid>

      {/* --- Manage Data Section --- */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mt: 2,
          borderRadius: 2,
          maxWidth: 600,
          mx: "auto",
          textAlign: "center",
        }}
        elevation={1}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Manage Your Data
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleExport}
            startIcon={<Download />}
          >
            Export to JSON
          </Button>
          <Button variant="outlined" component="label" startIcon={<Upload />}>
            Import from JSON
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleImportInitiation}
            />
          </Button>
          <Button
            variant="outlined"
            onClick={handleShowInfo}
            startIcon={<Info />}
          >
            Format Info
          </Button>
        </Box>
      </Paper>
      {/* --- Modal (no changes) --- */}
      <InfoModal
        open={modalState.open}
        onClose={closeModal}
        onConfirm={
          modalState.type === "confirm" &&
          modalState.importOptions &&
          modalState.importOptions.includes("overwrite")
            ? handleImportConfirmation
            : closeModal
        }
        onAddOnlyNew={
          modalState.type === "confirm" &&
          modalState.importOptions &&
          modalState.importOptions.includes("addOnlyNew")
            ? handleAddOnlyNewWords
            : undefined
        }
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        maxWidth={modalState.maxWidth}
        importOptions={modalState.importOptions}
      />
    </Box>
  );
};

export default Dashboard;
