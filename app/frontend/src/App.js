import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Globe, LayoutDashboard, Luggage, StickyNote, PlusCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import VacationList from './pages/VacationList';
import VacationDetail from './pages/VacationDetail';
import NewVacation from './pages/NewVacation';

function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Vacay
        <span>Trip Planner</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/vacations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Globe size={16} /> My Trips
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => navigate('/vacations/new')}>
          <PlusCircle size={15} /> New Trip
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"                    element={<Dashboard />} />
            <Route path="/vacations"           element={<VacationList />} />
            <Route path="/vacations/new"       element={<NewVacation />} />
            <Route path="/vacations/:id"       element={<VacationDetail />} />
            <Route path="/vacations/:id/edit"  element={<NewVacation />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
