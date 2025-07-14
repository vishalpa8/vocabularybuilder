import React from "react";
import AddWordForm from "../components/AddWordForm";
import { Box, Typography, Paper, Container } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const AddWordPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <AddCircleOutlineIcon
          color="primary"
          sx={{ fontSize: { xs: 32, sm: 40 } }}
        />
        <Box>
          <Typography variant="h4" component="h1">
            Add a New Word
          </Typography>
          <Typography color="text.secondary">
            Expand your personal dictionary with a new entry.
          </Typography>
        </Box>
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <AddWordForm />
      </Paper>
    </Container>
  );
};

export default AddWordPage;
