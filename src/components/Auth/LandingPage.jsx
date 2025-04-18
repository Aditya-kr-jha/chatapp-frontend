import React from 'react';
import { Link } from 'react-router-dom';
// Assuming App.css is imported globally in App.js

// Simple SVG icon representing chat bubbles
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-chat-dots-fill" viewBox="0 0 16 16" style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
    </svg>
);


function LandingPage() {
  return (
    // Use the auth-container class for consistent styling
    <div className="auth-container" style={{ textAlign: 'center' }}> {/* Center align content */}

      {/* Add an icon */}
      <ChatIcon />

      {/* Main Heading */}
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to Zync!</h2>

      {/* Subheading / Tagline */}
      <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '2.5rem' }}>
        Real-time communication, simplified. <br /> Connect and collaborate instantly.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}> {/* Increase gap */}
        <Link to="/login">
          <button style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}> {/* Make buttons larger */}
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}> {/* Make buttons larger */}
            Sign Up
          </button>
        </Link>
      </div>

    </div>
  );
}

export default LandingPage;