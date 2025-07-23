import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: [Current Date]
        </Typography>
        <Typography variant="body1" paragraph>
          This Privacy Policy describes how Vocabulary Builder ("we," "us," or "our") collects, uses, and shares your personal information when you use our website.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information that you provide directly to us, including:
          - Words and definitions you add
          - Your learning progress
          - Performance statistics
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
          - Provide and improve our vocabulary learning service
          - Track your progress
          - Personalize your learning experience
          - Show relevant advertisements
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Google AdSense
        </Typography>
        <Typography variant="body1" paragraph>
          We use Google AdSense to display advertisements. Google AdSense may use cookies and web beacons to collect data. This information is used to provide personalized advertisements based on your interests.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
