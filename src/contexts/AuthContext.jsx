import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// Import API functions including the corrected getCurrentUser
import { loginUser, signupUser, getCurrentUser } from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  // State for the authentication token (initialized from localStorage)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  // State to store the authenticated user's details (object from /users/me)
  const [user, setUser] = useState(null);
  // State to track if authentication state is being loaded/checked
  const [loading, setLoading] = useState(false);
  // State to track if the initial authentication check has completed
  const [authInitialized, setAuthInitialized] = useState(false);
  // State to store any authentication-related errors
  const [error, setError] = useState(null);

  // --- Function to Fetch Current User Details ---
  // Uses the stored authToken to call the /users/me endpoint
  const fetchAndSetUser = useCallback(async () => {
    // Don't attempt fetch if there's no token
    if (!authToken) {
        setUser(null); // Ensure user state is clear if no token
        if (!authInitialized) setAuthInitialized(true); // Mark init done if starting without token
        return;
    }

    console.log("AuthContext: Attempting to fetch current user...");
    setLoading(true); // Indicate loading user data
    try {
        const response = await getCurrentUser(); // Call GET /users/me
        setUser(response.data); // Store the full user object (UserRead schema)
        console.log("AuthContext: User details fetched and set:", response.data);
        setError(null); // Clear any previous errors on success
    } catch (err) {
        console.error("AuthContext: Failed to fetch user details:", err.response?.data || err.message);
        // This likely means the token is invalid or expired
        setUser(null); // Clear user state
        setAuthToken(null); // Clear the invalid token from state
        localStorage.removeItem('authToken'); // Remove invalid token from storage
        setError('Your session may have expired. Please log in again.'); // Set user-friendly error
    } finally {
        setLoading(false); // Stop loading indicator
        // Ensure initialization is marked complete even if fetch fails
        if (!authInitialized) setAuthInitialized(true);
    }
  }, [authToken, authInitialized]); // Dependencies: re-run if token changes or if needed for init

  // --- Effect for Initial Authentication Check ---
  // Runs once on component mount to check existing token and fetch user
  useEffect(() => {
    console.log("AuthContext: Initializing authentication state...");
    fetchAndSetUser(); // Attempt to fetch user based on token in localStorage (if any)
    // Note: setAuthInitialized(true) is now handled within fetchAndSetUser's finally block
  }, [fetchAndSetUser]); // Dependency: only needs the fetch function reference


  // --- Login Function ---
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // Call the API endpoint for login (/token)
      const response = await loginUser(username, password);
      const token = response.data.access_token; // Extract token from response

      localStorage.setItem('authToken', token); // Store token in localStorage
      setAuthToken(token); // Update token state (this will trigger fetchAndSetUser via useEffect)

      // No need to call fetchAndSetUser directly here, the useEffect handles it
      console.log("AuthContext: Login successful, token set.");
      return true; // Indicate login success

    } catch (err) {
      console.error("AuthContext: Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
      // Clear any potentially invalid token/user state
      localStorage.removeItem('authToken');
      setAuthToken(null);
      setUser(null);
      setLoading(false); // Ensure loading stops on error
      return false; // Indicate login failure
    }
    // Loading state is managed by fetchAndSetUser after token is set
  };

  // --- Signup Function ---
  const signup = async (username, email, password) => {
     setLoading(true);
     setError(null);
     try {
        // Call the API endpoint for user creation (/users/)
        await signupUser(username, email, password);
        // Optionally: Automatically log the user in after successful signup
        // await login(username, password);
        console.log("AuthContext: Signup successful.");
        setLoading(false);
        return true; // Indicate signup success
     } catch (err) {
        console.error("AuthContext: Signup failed:", err.response?.data || err.message);
        setError(err.response?.data?.detail || 'Signup failed. Username or email might be taken.');
        setLoading(false);
        return false; // Indicate signup failure
     }
  };

  // --- Logout Function ---
  const logout = () => {
    console.log("AuthContext: Logging out...");
    localStorage.removeItem('authToken'); // Remove token from storage
    setAuthToken(null); // Clear token state
    setUser(null); // Clear user state
    setError(null); // Clear any errors
    // Navigation/redirect should be handled by components observing the auth state change
  };

  // --- Context Value ---
  // Assemble the value object to be provided by the context
  const value = {
    authToken, // The current JWT token (or null)
    user, // The current user object (UserRead) (or null)
    // Determine authentication status: requires both a token AND a successfully fetched user object
    isAuthenticated: !!authToken && !!user,
    // Loading is true if actively fetching OR if initial check isn't done yet
    loading: loading || !authInitialized,
    authInitialized, // Boolean indicating if the initial auth check is complete
    error, // Any current authentication error message
    login, // Login function
    signup, // Signup function
    logout, // Logout function
    clearError: () => setError(null), // Function to manually clear errors
  };

  // --- Render Provider ---
  // Render children only after the initial authentication check is complete
  // This prevents UI flickering between states (e.g., showing login then immediately redirecting)
  return (
     <AuthContext.Provider value={value}>
        {authInitialized ? children : <div>Loading application state...</div> /* Replace with a proper loading indicator/spinner */}
     </AuthContext.Provider>
  );
};

// --- Custom Hook ---
// Hook for easy consumption of the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Ensure the hook is used within a component wrapped by AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};