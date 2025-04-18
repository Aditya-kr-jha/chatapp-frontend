import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/Auth/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import ChannelDashboard from './components/Channels/ChannelDashboard';
import ChatView from './components/Chat/ChatView';
import './App.css'; // Import the CSS file

function ProtectedRoute() {
  const { isAuthenticated, authInitialized } = useAuth();
  // Wait until auth state is initialized before rendering/redirecting
  if (!authInitialized) {
    return <div className="loading-container">Loading application...</div>; // Or a spinner component
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/landing" replace />;
}

function PublicRoute() {
    const { isAuthenticated, authInitialized } = useAuth();
    if (!authInitialized) {
        return <div className="loading-container">Loading application...</div>;
    }
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Remove the h1 title from here, manage titles within pages */}
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
            <Route path="/channel/:channelId" element={<ChatView />} />
          </Route>

          {/* Fallback Route: Redirect based on initial auth check */}
          <Route
            path="*"
            element={
              <AuthRedirector /> // Use a helper component for initial redirect logic
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper component to handle initial redirection after auth state is known
function AuthRedirector() {
    const { isAuthenticated, authInitialized } = useAuth();

    if (!authInitialized) {
        // Can show a global loading indicator or just null
        return <div className="loading-container">Initializing...</div>;
    }

    return <Navigate to={isAuthenticated ? "/" : "/landing"} replace />;
}


export default App;