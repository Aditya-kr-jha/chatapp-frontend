import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h2>Welcome to the Chat App!</h2>
      <p>Please log in or sign up to continue.</p>
      <div style={{ marginTop: '20px' }}> {/* Added some spacing */}
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup" style={{ marginLeft: '10px' }}> {/* Added spacing */}
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;