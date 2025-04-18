import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/Auth/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import ChannelDashboard from './components/Channels/ChannelDashboard'; // Main view after login
import ChatView from './components/Chat/ChatView';
import './App.css';

// Component to protect routes
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/landing" replace />;
  // Outlet renders the nested child route (e.g., ChannelDashboard or ChatView)
}

// Component for public routes (redirect if already logged in)
function PublicRoute() {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <h1>Chat Application</h1>
          <Routes>
             {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ChannelDashboard />} />
              {/* Dynamic route for specific chat channels */}
              <Route path="/channel/:channelId" element={<ChatView />} />
            </Route>

            {/* Redirect base path based on auth state */}
             <Route path="*" element={<Navigate to={localStorage.getItem('authToken') ? "/" : "/landing"} replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;