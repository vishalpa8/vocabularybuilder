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
              <Tooltip title={`${badge.name}: ${badge.description}`}>
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
