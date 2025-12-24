import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Templates from './pages/Templates';
import Photos from './pages/Photos';
import Calendar from './pages/Calendar';
import Exercises from './pages/Exercises';
import PersonalRecords from './pages/PersonalRecords';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-content">
            <NavLink to="/" className="logo">
              <span className="logo-icon">💪</span>
              FitnessTracker
            </NavLink>
            <div className="nav-links">
              <NavLink
                to="/"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
                end
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/workouts"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
              >
                Workouts
              </NavLink>
              <NavLink
                to="/templates"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
              >
                Templates
              </NavLink>
              <NavLink
                to="/exercises"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
              >
                Exercises
              </NavLink>
              <NavLink
                to="/records"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
              >
                Records
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
              >
                Calendar
              </NavLink>
              <NavLink
                to="/photos"
                className={({ isActive }) => `nav - link ${isActive ? 'active' : ''} `}
              >
                Progress Photos
              </NavLink>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/records" element={<PersonalRecords />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/photos" element={<Photos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
