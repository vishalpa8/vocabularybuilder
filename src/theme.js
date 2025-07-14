import { createTheme } from '@mui/material/styles';

const commonSettings = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 8,
  },
};

const getTheme = (mode) => createTheme({
  ...commonSettings,
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#007aff',
          },
          secondary: {
            main: '#ff3b30',
          },
          success: {
            main: '#4CAF50',
            contrastText: '#fff',
          },
          error: {
            main: '#F44336',
            contrastText: '#fff',
          },
          background: {
            default: '#f0f2f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#000000',
            secondary: '#6e6e73',
          },
        }
      : {
          primary: {
            main: '#0a84ff',
          },
          secondary: {
            main: '#ff453a',
          },
          success: {
            main: '#66BB6A',
            contrastText: '#fff',
          },
          error: {
            main: '#EF5350',
            contrastText: '#fff',
          },
          background: {
            default: '#000000',
            paper: '#1c1c1e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#8e8e93',
          },
        }),
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '9999px',
            }
        }
    }
  },
});

export default getTheme;