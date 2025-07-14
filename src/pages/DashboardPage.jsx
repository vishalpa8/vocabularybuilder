import React from 'react';
import Dashboard from '../components/Dashboard';
import { Box, Typography } from '@mui/material';

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Your Progress Dashboard
      </Typography>
      <Dashboard />
    </Box>
  );
};

export default DashboardPage;
