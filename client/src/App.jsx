

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Auth from './Auth';
import './App.css';

const Home = ({ token, user, onLogout }) => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');
    try {
      const res = await fetch('http://localhost:5000/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setShortUrl(data.shortUrl);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/my-urls" className="nav-link">My URLs</Link>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </nav>
      <h1 className="title">URL Shortener</h1>
      <form onSubmit={handleSubmit} className="form-box">
        <input
          type="url"
          placeholder="Enter long URL"
          value={longUrl}
          onChange={e => setLongUrl(e.target.value)}
          className="input"
          required
        />
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
        {error && <p className="error-msg">{error}</p>}
        {shortUrl && (
          <div className="result-box">
            <p className="success-msg">Short URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="short-url"
            >
              {shortUrl}
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

const MyUrls = ({ token }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUrls() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/my-urls', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUrls(data);
        } else {
          setError(data.error || 'Failed to fetch URLs');
        }
      } catch {
        setError('Server error');
      }
      setLoading(false);
    }
    fetchUrls();
  }, [token]);

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
      </nav>
      <h2 className="subtitle">My Shortened URLs</h2>
      {loading ? <p>Loading...</p> : error ? <p className="error-msg">{error}</p> : (
        <div className="table-box">
          <table className="url-table">
            <thead>
              <tr>
                <th>Short URL</th>
                <th>Original URL</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {urls.map(url => (
                <tr key={url.shortId}>
                  <td><a href={`/${url.shortId}`} target="_blank" rel="noopener noreferrer" className="short-url">{window.location.origin + '/' + url.shortId}</a></td>
                  <td className="break-all">{url.longUrl}</td>
                  <td>{new Date(url.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogin = (data) => {
    setToken(data.token);
    setUser({ username: data.username, email: data.email });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
    navigate('/');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <>
      <header className="app-header">
        <div className="logo-container">
          <h1 className="logo-title">LUSS</h1>
          <p className="logo-subtitle">Long URL Short in Second</p>
        </div>
        <button 
          className="dark-mode-toggle" 
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      <Routes>
        <Route path="/" element={token ? <Home token={token} user={user} onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />} />
        <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
        <Route path="/my-urls" element={token ? <MyUrls token={token} /> : <Auth onLogin={handleLogin} />} />
      </Routes>
    </>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
