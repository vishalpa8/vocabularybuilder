import React from "react";
import { useBadges } from "../hooks/useBadges";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";

const Badges = () => {
  const { badges } = useBadges();

  if (!badges) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
        sx={{
          p: { xs: 3, sm: 5 }, // Increased padding
          mt: 4, // Increased top margin
          borderRadius: 3, // More rounded corners
          maxWidth: 600,
          mx: "auto",
          textAlign: "center",
          boxShadow: 6, // More prominent shadow
          bgcolor: "background.paper", // Ensure consistent background
        }}
        elevation={3}
      >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Your Badges
      </Typography>
      {badges.length === 0 ? (
        <Typography color="text.secondary">
          You haven&apos;t earned any badges yet. Keep learning to unlock them!
        </Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {badges.map((badge) => (
            <Grid item key={badge.id}>
              <Tooltip 
                title={(
                  <Box 
                    sx={{
                      p: 1.5,
                      minWidth: 200,
                      maxWidth: 300,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : '#e3f2fd',
                      borderRadius: 2,
                      border: (theme) => theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255,215,0,0.4)' 
                        : '1px solid rgba(255,215,0,0.3)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(255,215,0,0.2)'
                        : '0 4px 20px rgba(255,215,0,0.15)',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? 'gold' : '#ed6c02' }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700' }}>
                      {badge.description}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: (theme) => theme.palette.mode === 'dark' ? 'grey.500' : 'grey.500' }}>
                      Earned: {new Date(badge.dateEarned).toLocaleDateString('en-GB')}
                    </Typography>
                  </Box>
                )}
                arrow
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'transparent',
                      maxWidth: 'none',
                      p: 0,
                      '& .MuiTooltip-arrow': {
                        color: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : '#e3f2fd',
                      },
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1 }}>
                  <EmojiEvents sx={{ fontSize: 60, color: "gold", mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{badge.name}</Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default Badges;
