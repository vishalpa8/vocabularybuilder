import React, { useState } from 'react';
import WordList from '../components/WordList';
import { TextField, Box, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom>
          Your Personal Vocabulary
        </Typography>
        <Typography color="text.secondary">
          Search, review, and master words you&apos;ve collected.
        </Typography>
      </Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          label="Search for a word..."
          variant="outlined"
          sx={{ maxWidth: '600px', width: '100%' }}
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
      <WordList searchTerm={searchTerm} />
    </Box>
  );
};

export default HomePage;