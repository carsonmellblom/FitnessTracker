import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Templates from './pages/Templates';
import Photos from './pages/Photos';
import Calendar from './pages/Calendar';
import Exercises from './pages/Exercises';
import PersonalRecords from './pages/PersonalRecords';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/workouts', label: 'Workouts' },
    { to: '/templates', label: 'Templates' },
    { to: '/exercises', label: 'Exercises' },
    { to: '/records', label: 'Records' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/photos', label: 'Progress Photos' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip Navigation Link for Keyboard Accessibility (WCAG 2.4.1) */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          '&:focus': {
            left: 0,
            top: 0,
          },
        }}
      >
        Skip to main content
      </Box>

      {isAuthenticated && (
        <AppBar
          position="static"
          component="nav"
          aria-label="Main navigation"
        >
          <Toolbar>
            {/* Logo and App Title */}
            <Box
              component={NavLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mr: 4,
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'secondary.main',
                  outlineOffset: '2px',
                  borderRadius: 1,
                },
              }}
              aria-label="FitnessTracker home"
            >
              <FitnessCenterIcon sx={{ mr: 1 }} aria-hidden="true" />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                FitnessTracker
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box
              component="ul"
              sx={{
                display: 'flex',
                flexGrow: 1,
                gap: 1,
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
              role="menubar"
              aria-label="Main menu"
            >
              {navItems.map((item) => (
                <Box component="li" key={item.to} role="none">
                  <Button
                    component={NavLink}
                    to={item.to}
                    end={item.end}
                    role="menuitem"
                    sx={{
                      color: 'inherit',
                      textTransform: 'none',
                      fontSize: '1rem',
                      px: 2,
                      '&.active': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        fontWeight: 'bold',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'secondary.main',
                        outlineOffset: '2px',
                      },
                    }}
                    aria-current={({ isActive }) => isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Button>
                </Box>
              ))}
            </Box>

            {/* User Info and Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: { xs: 'none', md: 'block' } }}
                aria-label={`Logged in as ${user?.userName || user?.email}`}
              >
                {user?.userName || user?.email}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleLogout}
                aria-label="Logout from your account"
                sx={{
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'secondary.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        id="main-content"
        role="main"
        aria-label="Main content"
        sx={{
          flexGrow: 1,
          backgroundColor: isAuthenticated ? 'background.default' : 'transparent',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            py: isAuthenticated ? 3 : 0,
            px: isAuthenticated ? 3 : 0,
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/workouts" element={<PrivateRoute><Workouts /></PrivateRoute>} />
            <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
            <Route path="/records" element={<PrivateRoute><PersonalRecords /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="/photos" element={<PrivateRoute><Photos /></PrivateRoute>} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
