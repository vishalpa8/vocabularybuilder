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
      <Card 
        className="front"
        elevation={0}
        sx={{
          background: '#fefefe',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            borderRadius: 1,
            pointerEvents: 'none'
          }
        }}
      >
        <CardContent sx={{ 
          p: { xs: 3, sm: 4 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              color: '#2c3e50', 
              wordBreak: 'break-word',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {word.word}
          </Typography>
          <IconButton 
            onClick={handlePronunciation} 
            sx={{ 
              mt: 3, 
              color: '#3498db',
              background: 'rgba(52, 152, 219, 0.1)',
              '&:hover': {
                background: 'rgba(52, 152, 219, 0.2)'
              }
            }}
          >
            <VolumeUp sx={{ fontSize: 40 }} />
          </IconButton>
        </CardContent>
      </Card>
      <Card 
        className="back"
        elevation={0}
        sx={{
          background: '#fefefe',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            borderRadius: 1,
            pointerEvents: 'none'
          }
        }}
      >
        <CardContent sx={{ 
          p: { xs: 3, sm: 4 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 500, 
              color: '#34495e', 
              wordBreak: 'break-word',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {word.meaning}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flashcard;
