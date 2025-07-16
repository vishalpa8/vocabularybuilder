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
  Paper,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  TextFields as TextFieldsIcon,
  SpeakerNotes as SpeakerNotesIcon,
  FormatQuote as FormatQuoteIcon,
  Lightbulb as LightbulbIcon,
  LocalOffer as LocalOfferIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  VolumeUp as VolumeUpIcon,
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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
    setSnackbarMessage(`"${formState.word}" has been updated successfully!`);
    setSnackbarOpen(true);
    
    // Close modal after a short delay to show the snackbar
    setTimeout(() => {
      onSave();
    }, 1500);
  };

  // Pronunciation handler with improved female voice selection
  const handlePronunciation = () => {
    if (formState.word) {
      const utterance = new SpeechSynthesisUtterance(formState.word);
      
      // Configure for female voice with expanded options
      const voices = speechSynthesis.getVoices();
      
      // Prioritize specific female voices by name
      const femaleVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        return (
          name.includes('female') ||
          name.includes('woman') ||
          name.includes('zira') ||
          name.includes('helen') ||
          name.includes('susan') ||
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('catherine') ||
          name.includes('hazel') ||
          name.includes('fiona') ||
          name.includes('jenny') ||
          name.includes('melissa') ||
          name.includes('allison') ||
          name.includes('nicole') ||
          name.includes('lucy') ||
          name.includes('ava') ||
          name.includes('emma') ||
          name.includes('tessa') ||
          name.includes('moira') ||
          name.includes('sara') ||
          name.includes('anna') ||
          name.includes('alice') ||
          (name.includes('english') && name.includes('female'))
        );
      });
      
      // Secondary option: any English voice that doesn't contain 'male'
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.toLowerCase().includes('male')
      );
      
      // Third option: any voice with higher pitch characteristics
      const anyVoice = voices.find(voice => voice.lang.startsWith('en'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else if (englishVoice) {
        utterance.voice = englishVoice;
      } else if (anyVoice) {
        utterance.voice = anyVoice;
      }
      
      // Enhanced voice characteristics for feminine sound
      utterance.pitch = 1.3; // Higher pitch
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.volume = 0.8; // Comfortable volume
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        height: '100%',
        maxHeight: 'calc(95vh - 80px)',
        overflow: 'auto',
        px: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <EditIcon color="primary" sx={{ fontSize: 26 }} />
        <Typography variant="h6" fontWeight="bold" color="primary">
          Edit Word
        </Typography>
      </Box>
      
      {/* Word Preview Card */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <Typography variant="h6" fontWeight="bold">
            {formState.word || 'Word Preview'}
          </Typography>
          {formState.word && (
            <Tooltip title="Listen to pronunciation">
              <IconButton 
                onClick={handlePronunciation}
                size="small"
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  width: 32,
                  height: 32,
                }}
              >
                <VolumeUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {formState.partOfSpeech && (
            <Chip
              label={formState.partOfSpeech}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
        {formState.meaning && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: '0.9rem' }}>
            {formState.meaning}
          </Typography>
        )}
      </Paper>

      {/* Form Fields */}
      <Grid container spacing={3}>
        {/* Word and Part of Speech */}
        <Grid item xs={12} sm={8}>
          <TextField
            name="word"
            label="Word"
            variant="outlined"
            value={formState.word}
            onChange={handleChange}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: '2px' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextFieldsIcon color="primary" />
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
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' },
              }}
            >
              {partsOfSpeech.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Meaning */}
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
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: '2px' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SpeakerNotesIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {/* Sample Sentence */}
        <Grid item xs={12}>
          <TextField
            name="sampleSentence"
            label="Sample Sentence (Optional)"
            variant="outlined"
            multiline
            minRows={2}
            maxRows={4}
            value={formState.sampleSentence}
            onChange={handleChange}
            fullWidth
            placeholder="Enter an example sentence using this word..."
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'secondary.main' },
                '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: 'secondary.main' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FormatQuoteIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {/* Mnemonic */}
        <Grid item xs={12}>
          <TextField
            name="mnemonic"
            label="Memory Aid (Optional)"
            variant="outlined"
            multiline
            minRows={2}
            maxRows={4}
            value={formState.mnemonic}
            onChange={handleChange}
            fullWidth
            placeholder="Enter a memory aid or mnemonic device..."
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'warning.main' },
                '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: 'warning.main' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LightbulbIcon color="warning" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {/* Tags */}
        <Grid item xs={12}>
          <TextField
            name="tags"
            label="Tags (Optional)"
            variant="outlined"
            value={formState.tags}
            onChange={handleChange}
            fullWidth
            placeholder="Enter tags separated by commas (e.g., academic, important, difficult)"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: 'info.main' },
                '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: 'info.main' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferIcon color="info" />
                </InputAdornment>
              ),
            }}
          />
          {formState.tags && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formState.tags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                return trimmedTag ? (
                  <Chip
                    key={index}
                    label={trimmedTag}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                ) : null;
              })}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box 
        sx={{ 
          mt: 4, 
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 2,
        }}
      >
        <Button 
          onClick={onSave} 
          variant="outlined"
          size="large"
          startIcon={<CloseIcon />}
          sx={{ minWidth: 120 }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          startIcon={<SaveIcon />}
          sx={{ 
            minWidth: 140,
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)'
              : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 3px 5px 2px rgba(25, 118, 210, .3)'
              : '0 3px 5px 2px rgba(33, 203, 243, .3)',
            '&:hover': {
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #1565C0 30%, #0D47A1 90%)'
                : 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
            },
          }}
        >
          Save Changes
        </Button>
      </Box>

      {/* Snackbar for user feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{
            minWidth: 300,
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditWordForm;
