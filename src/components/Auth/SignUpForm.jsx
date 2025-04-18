import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function SignUpForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await signup(username, email, password);
    if (success) {
       setSignupSuccess(true);
    }
  };

   if (signupSuccess) {
        return (
            <div className="auth-container success-message"> {/* Use class */}
                <h2>Sign Up Successful!</h2>
                <p>Your Zync account has been created.</p> {/* App Name Changed */}
                <Link to="/login">Proceed to Login</Link>
            </div>
        );
    }

  return (
    <div className="auth-container">
      <h2>Create your Zync Account</h2> {/* App Name Changed */}
      <form onSubmit={handleSubmit}>
         {error && <p className="error-message">{error}</p>} {/* Use class */}
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
         <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
       <p>
         <Link to="/landing">Back</Link>
      </p>
    </div>
  );
}

export default SignUpForm;