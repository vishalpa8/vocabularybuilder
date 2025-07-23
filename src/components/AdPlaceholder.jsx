import React from 'react';
import { Box, Skeleton } from '@mui/material';

const AdPlaceholder = ({ height = 100 }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
      />
    </Box>
  );
};

export default AdPlaceholder;
