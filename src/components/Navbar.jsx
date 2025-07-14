import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home,
  AddCircle,
  School,
  Dashboard,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../hooks/useThemeContext';
import { useTheme } from '@mui/material/styles';

const navItems = [
  { text: 'Home', to: '/', icon: <Home /> },
  { text: 'Add Word', to: '/add', icon: <AddCircle /> },
  { text: 'Quiz', to: '/quiz', icon: <School /> },
  { text: 'Dashboard', to: '/dashboard', icon: <Dashboard /> },
];

const Navbar = () => {
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinkStyles = ({ isActive }) => ({
    width: '100%',
    textDecoration: 'none',
    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
    transition: 'background-color 0.3s, color 0.3s',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.primary.main,
    },
  });

  const drawerContent = (
    <Box
      sx={{ width: 250, p: 2 }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Vocabuild
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={NavLink} to={item.to} sx={navLinkStyles}>
              <ListItemIcon sx={{color: 'inherit'}}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Vocabuild
          </Typography>
          {isMobile ? (
            <>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={NavLink}
                  to={item.to}
                  sx={navLinkStyles}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
              <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;