import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import SignInPage from './pages/auth/login/SignInPage';
import Dashboard from './pages/dashboard/Dashboard';
import ProfilePage from './pages/profile/ProfilePage';
import PeoplePage from './pages/people/PeoplePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import MessagesPage from './pages/messages/MessagesPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
}

export default App
