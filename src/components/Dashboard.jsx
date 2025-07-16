import React, { useState, useEffect, useMemo } from "react";
import { useWords } from "../hooks/useWords";
import { useBadges } from "../hooks/useBadges";
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
  Star,
} from "@mui/icons-material";
import InfoModal from "./InfoModal";
import Badges from "./Badges";
import { downloadJson, uploadJson, exampleJSON } from "../utils/fileUtils";
import Reset from "./Reset";
import { normalizeWordKey } from "../utils/wordUtils";
import { badgeCriteria } from "../utils/badgeUtils";

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
  const { badges, addBadge } = useBadges();
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    maxWidth: 400,
  });
  const [fileToImport, setFileToImport] = useState(null);
  const [wordsToOverwrite, setWordsToOverwrite] = useState([]);
  const [copied, setCopied] = useState(false); // for copy feedback

  useEffect(() => {
    if (words && badges) {
      checkAndAwardBadges();
    }
  }, [words, badges]);

  const checkAndAwardBadges = () => {
    const earnedBadgeNames = new Set(badges.map((b) => b.name));
    badgeCriteria.forEach((badge) => {
      if (!earnedBadgeNames.has(badge.name)) {
        let conditionMet = false;
        if (badge.condition.length > 0) {
          conditionMet = badge.condition(words);
        } else {
          conditionMet = badge.condition();
        }

        if (conditionMet) {
          addBadge({
            name: badge.name,
            description: badge.description,
            dateEarned: new Date(),
          });
        }
      }
    });
  };

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
                      } catch {
                        // ignore
                      }
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
            "&quot;tags&quot; (should be array or comma-separated string)"
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

      // 7. Warn on huge uploads (optional, can skip)
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
        // continue (or return) as per your policy
      }

      // 8. Continue with your existing logic for merging, duplicate/conflict detection, etc.

      // -- Build normalized word map for existing words
      const existingWordMap = new Map(
        words.map((w) => [normalizeWordKey(w), w])
      );
      const newWords = [];
      const conflicting = [];

      for (const iw of importedWords) {
        const key = normalizeWordKey(iw);
        const ew = existingWordMap.get(key);
        if (ew) {
          conflicting.push(iw);
        } else {
          newWords.push(iw);
        }
      }

      // All identical
      if (newWords.length === 0 && conflicting.length === 0) {
        setModalState({
          open: true,
          title: "Nothing to Import",
          message:
            "All words in the imported file already exist. No changes needed.",
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
  };

  // Progressive loading for stats - memoize expensive calculations
  const dashboardStats = useMemo(() => {
    if (!words || words.length === 0) {
      return {
        totalWords: 0,
        wordsLearned: 0,
        wordsDueForReview: 0,
        totalPoints: 0,
      };
    }

    const now = new Date();
    let totalPoints = 0;
    let wordsLearned = 0;
    let wordsDueForReview = 0;

    // Single pass through words for all calculations
    words.forEach((word) => {
      totalPoints += word.points || 0;

      if (word.isLearned) {
        wordsLearned++;
      } else if (new Date(word.nextReview) <= now) {
        wordsDueForReview++;
      }
    });

    return {
      totalWords: words.length,
      wordsLearned,
      wordsDueForReview,
      totalPoints,
    };
  }, [words]);

  if (!words) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const { totalWords, wordsLearned, wordsDueForReview, totalPoints } =
    dashboardStats;

  const StatCard = ({ title, value, icon, tooltip, color = "primary" }) => {
    const getTooltipContent = () => {
      const iconColor = icon.props.color || color;
      const themeColors = {
        primary: { main: "#1976d2", light: "#42a5f5", bg: "#e3f2fd" },
        success: { main: "#2e7d32", light: "#66bb6a", bg: "#e8f5e8" },
        error: { main: "#d32f2f", light: "#ef5350", bg: "#ffebee" },
        warning: { main: "#ed6c02", light: "#ffb74d", bg: "#fff3e0" },
      };

      const colorScheme = themeColors[iconColor] || themeColors.primary;

      return (
        <Box
          sx={{
            p: 2,
            minWidth: 200,
            maxWidth: 240,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.9)"
                : colorScheme.bg,
            borderRadius: 2,
            border: (theme) =>
              theme.palette.mode === "dark"
                ? `1px solid ${colorScheme.main}40`
                : `1px solid ${colorScheme.main}30`,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? `0 4px 20px ${colorScheme.main}20`
                : `0 4px 20px ${colorScheme.main}15`,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? `${colorScheme.main}20`
                    : `${colorScheme.main}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(icon, {
                sx: { fontSize: 20, color: colorScheme.main },
              })}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#fff" : colorScheme.main,
                fontSize: "1.1rem",
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip
              label={value}
              size="small"
              sx={{
                bgcolor: colorScheme.main,
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                minWidth: 40,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? "grey.300" : "grey.700",
                fontWeight: 500,
              }}
            >
              {title === "Total Words"
                ? "words in your vocabulary"
                : title === "Words Mastered"
                ? "words you've learned"
                : title === "Due for Review"
                ? "words need review"
                : title === "Total Points"
                ? "points earned"
                : ""}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "grey.400" : "grey.600",
              lineHeight: 1.4,
              fontSize: "0.8rem",
            }}
          >
            {tooltip}
          </Typography>
        </Box>
      );
    };

    return (
      <Grid item xs={12} sm={6} md={3}>
        <Tooltip
          title={getTooltipContent()}
          arrow
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: "transparent",
                maxWidth: "none",
                p: 0,
                "& .MuiTooltip-arrow": {
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(0,0,0,0.9)" : "#fff",
                },
              },
            },
          }}
        >
          <Paper
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: 3,
              height: "100%",
              minHeight: 120,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-6px) scale(1.02)",
                boxShadow: (theme) =>
                  `0 8px 25px -5px ${
                    theme.palette.mode === "dark"
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(0,0,0,0.15)"
                  }`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, ${
                  icon.props.color === "primary"
                    ? "#1976d2"
                    : icon.props.color === "success"
                    ? "#2e7d32"
                    : icon.props.color === "error"
                    ? "#d32f2f"
                    : "#ed6c02"
                }, ${
                  icon.props.color === "primary"
                    ? "#42a5f5"
                    : icon.props.color === "success"
                    ? "#66bb6a"
                    : icon.props.color === "error"
                    ? "#ef5350"
                    : "#ffb74d"
                })`,
                opacity: 0.8,
              },
            }}
            elevation={3}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="div"
                fontWeight="700"
                sx={{
                  mb: 0.5,
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)"
                      : "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {value}
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  letterSpacing: "0.5px",
                }}
              >
                {title}
              </Typography>
            </Box>
          </Paper>
        </Tooltip>
      </Grid>
    );
  };

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
          tooltip="The total number of words you have added to your vocabulary."
        />
        <StatCard
          title="Words Mastered"
          value={wordsLearned}
          icon={<School sx={{ fontSize: 40 }} color="success" />}
          tooltip="Words you have marked as 'learned' after successful quizzes."
        />
        <StatCard
          title="Due for Review"
          value={wordsDueForReview}
          icon={<Schedule sx={{ fontSize: 40 }} color="error" />}
          tooltip="Words that are scheduled for you to review again based on spaced repetition."
        />
        <StatCard
          title="Total Points"
          value={totalPoints}
          icon={<Star sx={{ fontSize: 40 }} color="warning" />}
          tooltip="Your total score from quizzes. Earn points for correct answers!"
        />
      </Grid>

      {/* --- Badges Section --- */}
      <Badges />

      {/* --- Manage Data Section --- */}
      <Paper
        sx={{
          p: { xs: 3, sm: 5 }, // Increased padding
          mt: 4, // Increased top margin
          borderRadius: 3, // More rounded corners
          maxWidth: 800,
          mx: "auto",
          textAlign: "center",
          boxShadow: 6, // More prominent shadow
          bgcolor: "background.paper", // Ensure consistent background
        }}
        elevation={3}
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
            variant="contained"
            onClick={handleExport}
            startIcon={<Download />}
            sx={{
              minWidth: 160,
              height: 48,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              bgcolor: "primary.main",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 25px -5px rgba(25, 118, 210, 0.4)"
                    : "0 8px 25px -5px rgba(25, 118, 210, 0.35)",
              },
            }}
          >
            Export JSON
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<Upload />}
            sx={{
              minWidth: 160,
              height: 48,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              bgcolor: "success.main",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "success.dark",
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 25px -5px rgba(46, 125, 50, 0.4)"
                    : "0 8px 25px -5px rgba(46, 125, 50, 0.35)",
              },
            }}
          >
            Import JSON
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleImportInitiation}
            />
          </Button>
          <Button
            variant="contained"
            onClick={handleShowInfo}
            endIcon={<Info />}
            sx={{
              minWidth: 160,
              height: 48,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              bgcolor: "warning.main",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "warning.dark",
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 25px -5px rgba(237, 108, 2, 0.4)"
                    : "0 8px 25px -5px rgba(237, 108, 2, 0.35)",
              },
            }}
          >
            Format Info
          </Button>
          <Reset />
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
