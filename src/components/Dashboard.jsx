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
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Book,
  School,
  Schedule,
  Upload,
  Download,
  Info,
  ExpandMore,
  ContentCopy,
  CheckCircle,
} from "@mui/icons-material";
import InfoModal from "./InfoModal";
import { downloadJson, uploadJson } from "../utils/fileUtils";
import { areWordContentsEqual, normalizeWordKey } from "../utils/wordUtils";

// Example JSON for Format Info (and copy)
const exampleJSON = `[
  {
    "word": "Ephemeral",
    "meaning": "Lasting for a very short time.",
    "partOfSpeech": "Adjective",
    "sampleSentence": "The beauty of the cherry blossoms is ephemeral.",
    "tags": ["transience", "nature"],
    "mnemonic": "Sounds like 'a funeral' - life is short."
  }
]`;

function cleanUpdateObject(obj) {
  // Remove undefined/null fields to avoid overwriting with blanks.
  const copy = { ...obj };
  Object.keys(copy).forEach(
    (key) =>
      (copy[key] === undefined || copy[key] === null || copy[key] === "") &&
      delete copy[key]
  );
  return copy;
}

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
  const [copied, setCopied] = useState(false); // for copy feedback

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

  // Show JSON format info (with Copy button)
  const handleShowInfo = () => {
    setModalState({
      open: true,
      title: "JSON Format Information",
      message: (
        <Box sx={{ textAlign: "left" }}>
          <Typography sx={{ mb: 1 }}>
            The JSON file should be an array of objects, where each object
            represents a word.
            <br />
            <b>Supported fields:</b>
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 12 }}>
            <li>
              word <i>(string, required)</i>
            </li>
            <li>
              meaning <i>(string, required)</i>
            </li>
            <li>
              partOfSpeech <i>(string)</i>
            </li>
            <li>
              sampleSentence <i>(string)</i>
            </li>
            <li>
              tags <i>(array of strings)</i>
            </li>
            <li>
              mnemonic <i>(string)</i>
            </li>
          </ul>
          <Accordion sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>Example (ready to use)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, position: "relative" }}>
              <Box sx={{ position: "relative", width: "100%" }}>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    backgroundColor: "#f7f7fa",
                    padding: "18px 12px 12px 12px",
                    borderRadius: "6px",
                    fontSize: 14,
                    border: "1px solid #e0e0e0",
                    margin: 0,
                    minHeight: 50,
                    fontFamily: "Menlo, Consolas, monospace",
                    boxShadow: "none",
                  }}
                >
                  <code>{exampleJSON}</code>
                </pre>
                <Tooltip title={copied ? "Copied!" : "Copy Example"}>
                  <IconButton
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (copied) return;
                      try {
                        await navigator.clipboard.writeText(exampleJSON);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      } catch {}
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 10,
                      background: "#f7f7fa",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      p: 0.5,
                      zIndex: 1,
                      "&:hover": {
                        background: "#ececf2",
                      },
                    }}
                    aria-label="Copy Example JSON"
                  >
                    {copied ? (
                      <CheckCircle fontSize="small" color="success" />
                    ) : (
                      <ContentCopy fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Typography fontSize={13} color="text.secondary" sx={{ mb: 0.5 }}>
            <b>Tip:</b> You can copy, edit and import this format directly.
          </Typography>
        </Box>
      ),
      type: "info",
      maxWidth: 650,
    });
  };

  // Main import logic
  const handleImportInitiation = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. File extension/type check
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

    // 2. Size limit (defensive)
    if (file.size > 2 * 1024 * 1024) {
      // 2 MB
      setModalState({
        open: true,
        title: "Import Failed",
        message: "File is too large. Maximum allowed size is 2MB.",
        type: "error",
      });
      return;
    }

    try {
      // 3. Read JSON
      const importedWordsRaw = await uploadJson(file);
      // Defensive: deep clone
      const importedWords = JSON.parse(JSON.stringify(importedWordsRaw));

      // 4. Basic array check
      if (!Array.isArray(importedWords) || importedWords.length === 0) {
        setModalState({
          open: true,
          title: "Import Failed",
          message: "The selected file is empty or not in the correct format.",
          type: "error",
        });
        return;
      }

      // 5. Detect duplicates within the file
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
                The imported file contains duplicate words:{" "}
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

      // 6. Schema/type/required validation
      const validationErrors = [];
      importedWords.forEach((word, index) => {
        const missingFields = [];
        if (!word.word || typeof word.word !== "string" || !word.word.trim())
          missingFields.push('"word" (string, required)');
        if (
          !word.meaning ||
          typeof word.meaning !== "string" ||
          !word.meaning.trim()
        )
          missingFields.push('"meaning" (string, required)');
        if (
          word.tags &&
          !Array.isArray(word.tags) &&
          typeof word.tags !== "string"
        )
          missingFields.push(
            '"tags" (should be array or comma-separated string)'
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
                Please ensure each word has valid "word" and "meaning"
                properties.
              </Typography>
            </Box>
          ),
          type: "error",
          maxWidth: 600,
        });
        return;
      }

      // 7. Warn on huge uploads (optional, can skip)
      if (importedWords.length > 500) {
        setModalState({
          open: true,
          title: "Import Warning",
          message: (
            <Typography>
              You're trying to import {importedWords.length} words at once. For
              best performance, consider importing smaller batches.
            </Typography>
          ),
          type: "info",
          maxWidth: 500,
        });
        // continue (or return) as per your policy
      }

      // 8. Continue with your existing logic for merging, duplicate/conflict detection, etc.

      // -- Build normalized word map for existing words
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

      // All identical
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

      // All conflicting
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

      // Mix of new/identical/conflicting
      setFileToImport(newWords);
      setWordsToOverwrite(conflicting);
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
    <Grid colSpan={{ xs: 12, sm: 6, md: 4 }}>
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
        columns={12}
        spacing={3}
        sx={{
          mb: 3,
          mt: 1,
          maxWidth: 1100,
          mx: "auto",
          justifyContent: "center",
        }}
      >
        <Grid colSpan={{ xs: 12, sm: 6, md: 4 }}>
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
            <Book sx={{ fontSize: 40 }} color="primary" />
            <Box>
              <Typography variant="h4" component="div">
                {totalWords}
              </Typography>
              <Typography color="text.secondary">Total Words</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid colSpan={{ xs: 12, sm: 6, md: 4 }}>
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
            <School sx={{ fontSize: 40 }} color="success" />
            <Box>
              <Typography variant="h4" component="div">
                {wordsLearned}
              </Typography>
              <Typography color="text.secondary">Words Mastered</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid colSpan={{ xs: 12, sm: 6, md: 4 }}>
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
            <Schedule sx={{ fontSize: 40 }} color="error" />
            <Box>
              <Typography variant="h4" component="div">
                {wordsDueForReview}
              </Typography>
              <Typography color="text.secondary">Due for Review</Typography>
            </Box>
          </Paper>
        </Grid>
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 1 }}
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
            variant="contained"
            color="secondary"
            onClick={handleShowInfo}
            endIcon={<Info />}
            sx={{ fontWeight: 500, px: 2.2 }}
          >
            Format Info
          </Button>
        </Stack>
      </Paper>

      {/* --- Modal --- */}
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
