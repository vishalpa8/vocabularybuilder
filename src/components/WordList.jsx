import React from 'react';
import { useWords } from '../hooks/useWords';
import WordCard from './WordCard';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const WordList = ({ searchTerm }) => {
  const { words } = useWords();

  if (typeof words === 'undefined') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredWords = words.filter((word) =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredWords.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4, p: 4, border: '2px dashed grey', borderRadius: '12px' }}>
        <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
        <Typography variant="h6">No Words Found</Typography>
        <Typography color="text.secondary">
          {searchTerm ? 'Try a different search term' : 'Click "Add Word" to start your collection!'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredWords.map((word) => (
        <Grid item xs={12} sm={12} md={12} key={word.id}>
          <WordCard word={word} />
        </Grid>
      ))}
    </Grid>
  );
};

export default WordList;