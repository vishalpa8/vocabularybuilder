import React, { useState, useEffect } from "react";
import { useWords } from "../hooks/useWords";
import { 
  Typography, 
  Box, 
  Modal, 
  IconButton,
  Fade,
  Backdrop,
  Button
} from "@mui/material";
import { WbSunny, Close } from "@mui/icons-material";

const WordOfTheDay = ({ open, onClose }) => {
  const { words } = useWords();
  const [wordOfTheDay, setWordOfTheDay] = useState(null);

  useEffect(() => {
    if (words && words.length > 0 && open) {
      const today = new Date().toDateString();
      const storedWordData = JSON.parse(localStorage.getItem("wordOfTheDay"));

      let currentWord;
      
      // Get or generate word of the day
      if (storedWordData && storedWordData.date === today) {
        currentWord = storedWordData.word;
      } else {
        currentWord = words[Math.floor(Math.random() * words.length)];
        localStorage.setItem(
          "wordOfTheDay",
          JSON.stringify({ word: currentWord, date: today })
        );
      }
      
      setWordOfTheDay(currentWord);
    }
  }, [words, open]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!words || words.length === 0) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '400px' },
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              outline: 'none',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              No Words Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please add some words to your vocabulary to get a Word of the Day!
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ mt: 3 }}
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>
    );
  }

  if (!wordOfTheDay) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '600px' },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 0,
            outline: 'none',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Close button */}
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary',
                zIndex: 1,
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
          {/* Content */}
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                mb: 2,
              }}
            >
              <WbSunny sx={{ fontSize: 46, color: "primary.main" }} />
              <Typography
                variant="h3"
                component="div"
                fontWeight="bold"
                sx={{
                  textAlign: "center",
                  wordBreak: "break-word",
                  color: "primary.main",
                }}
              >
                {wordOfTheDay.word}
              </Typography>
            </Box>

            <Typography
              color="text.secondary"
              sx={{
                textAlign: "center",
                fontSize: "1.25rem",
                maxWidth: 480,
                mt: 1,
              }}
            >
              {wordOfTheDay.meaning}
            </Typography>
            
            {/* Optional: Show additional info */}
            {wordOfTheDay.sampleSentence && (
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  fontStyle: "italic",
                  color: "text.secondary",
                  maxWidth: 480,
                }}
              >
                &quot;{wordOfTheDay.sampleSentence}&quot;
              </Typography>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default WordOfTheDay;
