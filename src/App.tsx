import { Dumbbell, GraduationCap, MessageCircle, Sun } from 'lucide-react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Alphabet, { LetterScreen } from './screens/Alphabet';
import LessonScreen from './screens/LessonScreen';
import Lessons from './screens/Lessons';
import LettersUnit from './screens/LettersUnit';
import MarksUnit from './screens/MarksUnit';
import Practice from './screens/Practice';
import Review from './screens/Review';
import Settings from './screens/Settings';
import Speak from './screens/Speak';
import Today from './screens/Today';

function Tabs() {
  const location = useLocation();
  return (
    <>
      <Outlet />
      <div className="tabbar">
        <nav>
          <NavLink to="/" end><Sun size={22} /><span>Today</span></NavLink>
          <NavLink to="/lessons"><GraduationCap size={22} /><span>Lessons</span></NavLink>
          <NavLink to="/practice" className={({ isActive }) => (isActive || location.pathname.startsWith('/alphabet') ? 'active' : '')}><Dumbbell size={22} /><span>Practice</span></NavLink>
          <NavLink to="/speak"><MessageCircle size={22} /><span>Speak</span></NavLink>
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
          <Route path="/" element={<Today />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/speak" element={<Speak />} />
          <Route path="/alphabet" element={<Alphabet />} />
          <Route path="/alphabet/:id" element={<LetterScreen />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/letters/:id" element={<LettersUnit />} />
        <Route path="/marks" element={<MarksUnit />} />
        <Route path="/review" element={<Review />} />
        <Route path="/lesson/:id" element={<LessonScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
