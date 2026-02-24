// File: client/src/router.jsx

import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AIStudyTools from './pages/AIStudyTools.jsx';
import Timetable from "./pages/Timetable";
import Login from './pages/Login';
import Pomodoro from './pages/Pomodoro';
import StudyRoom from './pages/StudyRoom';

const router = createBrowserRouter([
  {path: '/', element: <App />,

    children: [
      {path: '/', element: <Home />},
      {path: '/profile', element: <Profile />},
      {path: '/dashboard', element: <Dashboard />},
      {path: '/ai-tools', element: <AIStudyTools />},
      { path: '/timetable', element: <Timetable /> },
      { path: '/login', element: <Login /> },
      { path: "pomodoro", element: <Pomodoro /> },
      { path: "study-room", element: <StudyRoom /> }
    ]
  }
]);

export default router;