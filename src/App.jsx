import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';
import { CustomThemeProvider } from './contexts/ThemeContext.jsx';
import { useThemeContext } from './hooks/useThemeContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AddWordPage from './pages/AddWordPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "add",
        element: <AddWordPage />,
      },
      {
        path: "quiz",
        element: <QuizPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
]);

const ThemedApp = () => {
  const { mode } = useThemeContext();
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <ThemedApp />
    </CustomThemeProvider>
  );
}

export default App;