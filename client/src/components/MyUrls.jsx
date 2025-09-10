import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './../App.css'; // Keep some of the old styles for tables


const MyUrls = ({ token }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchUrls() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5001/my-urls', {
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

  const handleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelected([]);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(urls.map((u) => u._id));
    } else {
      setSelected([]);
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/my-urls', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setUrls((prev) => prev.filter((u) => !selected.includes(u._id)));
        setSelected([]);
        setSelectMode(false);
      } else {
        setError(data.error || 'Failed to delete URLs');
      }
    } catch {
      setError('Server error');
    }
    setDeleting(false);
  };

  const handleCopy = (shortId) => {
    navigator.clipboard.writeText(`http://localhost:5001/${shortId}`);
    // Optional: show a "Copied!" message
  };

  return (
    <>
      <h1 className="page-title">Links</h1>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button className="select-btn" onClick={handleSelectMode}>
          {selectMode ? 'Cancel' : 'Select'}
        </button>
        {selectMode && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={selected.length === 0 || deleting}
            style={{ marginLeft: 12 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="table-box">
          <table className="url-table">
            <thead>
              <tr>
                {selectMode && (
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === urls.length && urls.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                <th>Short URL</th>
                <th>Original URL</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url._id}>
                  {selectMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(url._id)}
                        onChange={() => handleSelect(url._id)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  <td>
                    <a
                      href={`http://localhost:5001/${url.shortId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-url"
                    >
                      {`http://localhost:5001/${url.shortId}`}
                    </a>
                  </td>
                  <td className="original-url-cell">{url.longUrl}</td>
                  <td>{new Date(url.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleCopy(url.shortId)} className="copy-btn">
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default MyUrls;
