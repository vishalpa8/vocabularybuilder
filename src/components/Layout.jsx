import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import Navbar from './Navbar';
import { Container, Box, Link, Typography } from '@mui/material';
import AdSense from './AdSense';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 }
        }}>
        <Outlet />
      </Container>
      <Box sx={{ 
        py: { xs: 2, sm: 3 }, 
        px: { xs: 2, sm: 0 },
        bgcolor: 'background.paper',
        mt: 'auto' 
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/privacy-policy" color="textSecondary">
              <Typography variant="body2">Privacy Policy</Typography>
            </Link>
          </Box>
          <AdSense adSlot="footer-ad" style={{ display: 'block', textAlign: 'center' }} />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
