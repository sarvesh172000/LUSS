import React, { useState } from 'react';
import './../App.css'; // Keep some of the old styles for forms

const Home = ({ token }) => {
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
      const res = await fetch('http://localhost:5001/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setShortUrl(`http://localhost:5001/${data.shortId}`);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    // Optional: show a "Copied!" message
  };

  return (
    <>
      <h1 className="page-title">Create New</h1>
      <div className="form-box quick-create">
        <h2 className="form-title">Enter your long URL</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="https://example.com/my-long-url"
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
            {loading ? 'Creating...' : 'Create Link'}
          </button>
          {error && <p className="error-msg">{error}</p>}
          {shortUrl && (
            <div className="result-box">
              <p className="success-msg">Your short link:</p>
              <div className="short-url-container">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="short-url"
                >
                  {shortUrl}
                </a>
                <button type="button" onClick={handleCopy} className="copy-btn">
                  Copy
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default Home;
