import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError('');

    const url = isLogin ? 'http://localhost:5001/login' : 'http://localhost:5001/register';
    const body = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          onLogin(data);
        } else {
          setIsLogin(true); // Switch to login form on successful registration
        }
      } else {
        setError(data.error || 'An error occurred.');
      }
    } catch {
      setError('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="subtitle">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="form-box">
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="input"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input"
          required
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Rewrite Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="input"
            required
          />
        )}
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth-btn">
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
    </div>
  );
};

export default Auth;
