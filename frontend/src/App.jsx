import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { CreditCard, Users, PlusCircle } from 'lucide-react';
import CreateStudent from './pages/CreateStudent';
import StudentsList from './pages/StudentsList';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <NavLink to="/" className="nav-brand">
            <CreditCard size={28} color="#818CF8" />
            NexusID
          </NavLink>
          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              Generate ID
            </NavLink>
            <NavLink
              to="/students"
              className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              All IDs
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CreateStudent />} />
            <Route path="/students" element={<StudentsList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
