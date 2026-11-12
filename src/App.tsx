import { GraduationCap, Languages, Settings as SettingsIcon } from 'lucide-react';
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Alphabet, { LetterScreen } from './screens/Alphabet';
import Learn from './screens/Learn';
import LessonScreen from './screens/LessonScreen';
import LettersUnit from './screens/LettersUnit';
import MarksUnit from './screens/MarksUnit';
import Settings from './screens/Settings';

function Tabs() {
  return (
    <>
      <Outlet />
      <div className="tabbar">
        <nav>
          <NavLink to="/" end><GraduationCap size={22} /><span>Learn</span></NavLink>
          <NavLink to="/alphabet"><Languages size={22} /><span>Alphabet</span></NavLink>
          <NavLink to="/settings"><SettingsIcon size={22} /><span>Settings</span></NavLink>
        </nav>
      </div>
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route element={<Tabs />}>
          <Route path="/" element={<Learn />} />
          <Route path="/alphabet" element={<Alphabet />} />
          <Route path="/alphabet/:id" element={<LetterScreen />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/letters/:id" element={<LettersUnit />} />
        <Route path="/marks" element={<MarksUnit />} />
        <Route path="/lesson/:id" element={<LessonScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
