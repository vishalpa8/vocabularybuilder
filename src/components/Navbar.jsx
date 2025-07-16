import React, { useState, useMemo, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  Divider,
} from "@mui/material";
import {
  Home,
  AddCircle,
  School,
  Dashboard,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useThemeContext } from "../contexts/ThemeContext.jsx";
import { useTheme } from "@mui/material/styles";

const navItems = [
  { text: "Home", to: "/", icon: <Home /> },
  { text: "Add Word", to: "/add", icon: <AddCircle /> },
  { text: "Quiz", to: "/quiz", icon: <School /> },
  { text: "Dashboard", to: "/dashboard", icon: <Dashboard /> },
];

const Navbar = () => {
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Ultra-tight icon-text spacing!
  const navLinkStyles = (to) => ({
    textDecoration: "none",
    color:
      location.pathname === to
        ? theme.palette.primary.main
        : theme.palette.text.primary,
    backgroundColor:
      location.pathname === to ? theme.palette.action.selected : "transparent",
    fontWeight: location.pathname === to ? 700 : 500,
    padding: "6px 12px", // Reduced horizontal padding
    borderRadius: theme.shape.borderRadius,
    transition: "background-color 0.2s, color 0.2s",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 0, // No extra gap!
    minWidth: 0,
    "& .MuiButton-startIcon": {
      marginRight: 2, // Only 2px gap between icon and text
      marginLeft: 0,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.primary.main,
    },
  });

  const handleDrawerToggle = useCallback(() => setDrawerOpen(!drawerOpen), [drawerOpen]);

  // Memoize drawer content for mobile
  const drawerContent = useMemo(() => (
    <Box
      sx={{ width: 250, p: 2 }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Vocabuild
      </Typography>
      <List>
        {navItems.map((item, i) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  color:
                    location.pathname === item.to
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  backgroundColor:
                    location.pathname === item.to
                      ? theme.palette.action.selected
                      : "transparent",
                  borderRadius: 1,
                  fontWeight: location.pathname === item.to ? 700 : 500,
                  mb: 0.5,
                  gap: 0,
                  padding: "6px 12px", // Reduce horizontal padding
                  minWidth: 0,
                  "& .MuiListItemIcon-root": {
                    minWidth: 0,
                    marginRight: 4, // Only 4px gap
                  },
                  "& .MuiListItemText-root": {
                    margin: 0,
                  },
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.to
                        ? theme.palette.primary.main
                        : "inherit",
                    minWidth: 0, // Remove default 36px
                    marginRight: 4, // Only 4px gap
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ margin: 0 }} />
              </ListItemButton>
            </ListItem>
            {i < navItems.length - 1 && <Divider sx={{ my: 0.5 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  ), [location.pathname, theme, handleDrawerToggle]);

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            Vocabuild
          </Typography>
          {isMobile ? (
            <>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
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
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={NavLink}
                  to={item.to}
                  sx={navLinkStyles(item.to)}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
              <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
