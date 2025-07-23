import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import getTheme from './theme';
import { CustomThemeProvider, useThemeContext } from './contexts/ThemeContext.jsx';
import Layout from './components/Layout';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const AddWordPage = React.lazy(() => import('./pages/AddWordPage'));
const QuizPage = React.lazy(() => import('./pages/QuizPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

// Loading fallback component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "add",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AddWordPage />
          </Suspense>
        ),
      },
      {
        path: "quiz",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <QuizPage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "privacy-policy",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPolicy />
          </Suspense>
        ),
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