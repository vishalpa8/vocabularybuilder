import React, { useState } from "react";
import { useWords } from "../hooks/useWords";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Favorite,
  Delete,
  School,
  Report,
  Lightbulb,
  FormatQuote,
  Edit,
} from "@mui/icons-material";
import InfoModal from "./InfoModal";
import EditWordForm from "./EditWordForm";

const WordCard = ({ word }) => {
  const { updateWord, deleteWord } = useWords();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);
  const handleOpenEdit = () => setEditOpen(true);
  const handleCloseEdit = () => setEditOpen(false);

  const handleDelete = () => {
    deleteWord(word.id);
    handleCloseConfirm();
  };

  const handleToggleFavorite = () => {
    updateWord(word.id, { isFavorite: !word.isFavorite });
  };

  const getStatusChip = () => {
    if (word.isLearned) {
      return (
        <Chip label="Mastered" color="success" size="small" icon={<School />} />
      );
    }
    if (word.isDifficult) {
      return (
        <Chip label="Difficult" color="error" size="small" icon={<Report />} />
      );
    }
    return null;
  };

  return (
    <>
      <Card sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 300 }}>
        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {word.word}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                {word.partOfSpeech}
              </Typography>
            </Box>
            {getStatusChip()}
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body1" sx={{ mb: 2, overflowWrap: "break-word" }}>
            {word.meaning}
          </Typography>

          {word.sampleSentence && (
            <Box
              sx={{ display: "flex", gap: 1.5, color: "text.secondary", mb: 2 }}
            >
              <FormatQuote sx={{ transform: "scaleX(-1)" }} fontSize="small" />
              <Typography variant="body2" sx={{ fontStyle: "italic", overflowWrap: "break-word" }}>
                {word.sampleSentence}
              </Typography>
            </Box>
          )}

          {word.mnemonic && (
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                color: "primary.main",
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              <Lightbulb fontSize="small" />
              <Typography variant="body2" sx={{ overflowWrap: "break-word" }}>{word.mnemonic}</Typography>
            </Box>
          )}
        </CardContent>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />
        <CardActions sx={{ justifyContent: "space-between", p: 1 }}>
          <Box
            sx={{
              overflow: "hidden",
              flexGrow: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              mr: 1,
            }}
          >
            {Array.isArray(word.tags) &&
              word.tags
                .slice(0, 3)
                .map(
                  (tag) =>
                    tag && (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                      />
                    )
                )}
          </Box>
          <Box sx={{ display: "flex" }}>
            <Tooltip title="Edit">
              <IconButton onClick={handleOpenEdit} size="small">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                word.isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <IconButton onClick={handleToggleFavorite} size="small">
                <Favorite color={word.isFavorite ? "error" : "action"} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton onClick={handleOpenConfirm} size="small">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>

      <InfoModal
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete the word "${word.word}"? This action cannot be undone.`}
        type="confirm"
      />
      <InfoModal
        open={editOpen}
        onClose={handleCloseEdit}
        title={`Edit "${word.word}"`}
        message={<EditWordForm word={word} onSave={handleCloseEdit} />}
        maxWidth={650}
      />
    </>
  );
};

export default WordCard;
