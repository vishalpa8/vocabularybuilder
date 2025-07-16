import React from "react";
import AddWordForm from "../components/AddWordForm";
import { Box, Typography, Paper, Container } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const AddWordPage = () => {
  return (
    <Container maxWidth="md" sx={{ pt: { xs: 3, sm: 4 } }}>
      <Box
        sx={{
          textAlign: "center",
          mb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, sm: 2 },
            mb: 2,
          }}
        >
          <AddCircleOutlineIcon
            color="primary"
            sx={{ fontSize: { xs: 32, sm: 40 } }}
          />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: 600,
            }}
          >
            Add a New Word
          </Typography>
        </Box>
        <Typography 
          color="text.secondary" 
          sx={{
            fontSize: { xs: 14, sm: 16 },
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Expand your personal dictionary with a new entry.
        </Typography>
      </Box>
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          width: "100%",
          background: (theme) => 
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
              : "linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0.02) 100%)",
          boxShadow: (theme) => 
            theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.3)"
              : "0 8px 32px rgba(0,0,0,0.1)",
          border: (theme) => 
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(25,118,210,0.1)",
        }}
      >
        <AddWordForm />
      </Paper>
    </Container>
  );
};

export default AddWordPage;
