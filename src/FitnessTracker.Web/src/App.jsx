import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
import './App.css';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="navbar">
          <div className="navbar-content">
            <NavLink to="/" className="logo">
              <span className="logo-icon">💪</span>
              FitnessTracker
            </NavLink>
            <div className="nav-links">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/workouts"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Workouts
              </NavLink>
              <NavLink
                to="/templates"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Templates
              </NavLink>
              <NavLink
                to="/exercises"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Exercises
              </NavLink>
              <NavLink
                to="/records"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Records
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Calendar
              </NavLink>
              <NavLink
                to="/photos"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Progress Photos
              </NavLink>
            </div>
            <div className="nav-user">
              <span className="user-name">{user?.userName || user?.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className={isAuthenticated ? "main-content" : ""}>
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
      </main>
    </div>
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
