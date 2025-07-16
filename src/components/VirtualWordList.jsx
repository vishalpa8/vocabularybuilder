import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import WordCard from './WordCard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const ITEM_HEIGHT = 200; // Approximate height of each WordCard
const BUFFER_SIZE = 5; // Number of items to render outside visible area

const VirtualWordList = ({
  words,
  searchTerm = '',
  showFavourites = false,
  selectedTag = '',
  emptyMsg = 'No Words Found',
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Filter words based on props
  const filteredWords = useMemo(() => {
    let filtered = words || [];

    if (showFavourites) {
      filtered = filtered.filter((word) => !!word.isFavorite);
    }

    if (selectedTag) {
      filtered = filtered.filter(
        (word) => Array.isArray(word.tags) && word.tags.includes(selectedTag)
      );
    }

    const search = searchTerm.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter((word) =>
        (word.word || '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [words, searchTerm, showFavourites, selectedTag]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      filteredWords.length,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );

    return {
      startIndex,
      endIndex,
      visibleWords: filteredWords.slice(startIndex, endIndex),
    };
  }, [filteredWords, scrollTop, containerHeight]);

  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Early return for empty state
  if (filteredWords.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          my: 4,
          p: 4,
          border: '2px dashed grey',
          borderRadius: '12px',
        }}
      >
        <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
        <Typography variant="h6">{emptyMsg}</Typography>
        <Typography color="text.secondary">
          {searchTerm.trim()
            ? 'Try a different search term'
            : showFavourites
            ? 'Mark words as favourite to see them here.'
            : selectedTag
            ? 'Try another tag or add words with this tag.'
            : 'Click "Add Word" to start your collection!'}
        </Typography>
      </Box>
    );
  }

  const totalHeight = filteredWords.length * ITEM_HEIGHT;

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '60vh',
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* Virtual container */}
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        {/* Rendered items */}
        <Box
          sx={{
            position: 'absolute',
            top: visibleItems.startIndex * ITEM_HEIGHT,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 3,
          }}
        >
          {visibleItems.visibleWords.map((word) => (
            <Box
              key={word.id}
              sx={{
                height: ITEM_HEIGHT,
                minHeight: ITEM_HEIGHT,
              }}
            >
              <WordCard word={word} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualWordList;
