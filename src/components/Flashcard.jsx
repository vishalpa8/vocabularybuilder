import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { VolumeUp } from "@mui/icons-material";
import "./Flashcard.css";

const Flashcard = ({ word }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!word) {
    return null;
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePronunciation = (e) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.word);
    speechSynthesis.speak(utterance);
  };

  return (
    <Box className={`flashcard ${isFlipped ? "flipped" : ""}`} onClick={handleFlip}>
      <Card className="front">
        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="h3" component="div" sx={{ textAlign: 'center', fontWeight: 700, color: 'primary.main', wordBreak: 'break-word' }}>
            {word.word}
          </Typography>
          <IconButton onClick={handlePronunciation} sx={{ mt: 3, color: 'primary.main' }}>
            <VolumeUp sx={{ fontSize: 40 }} />
          </IconButton>
        </CardContent>
      </Card>
      <Card className="back">
        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="h4" component="div" sx={{ textAlign: 'center', fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}>
            {word.meaning}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flashcard;
