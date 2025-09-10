import React, { useState } from 'react';
import './Dashboard.css';

const Settings = ({ user, token, onProfileUpdate, onHistoryDelete }) => {
  const [form, setForm] = useState({
    username: user?.username || '',
    age: user?.age || '',
    mobile: user?.mobile || '',
    sex: user?.sex || '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');
    // TODO: Call backend to update profile (username, age, mobile, sex)
    try {
      const res = await fetch('http://localhost:5001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username,
          age: form.age,
          mobile: form.mobile,
          sex: form.sex,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Profile updated!');
        if (data.user) {
          setForm(f => ({ ...f, ...data.user }));
          onProfileUpdate && onProfileUpdate(data.user);
        }
      } else {
        setErr(data.error || 'Failed to update profile');
      }
    } catch {
      setErr('Server error');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');
    if (form.newPassword !== form.confirmNewPassword) {
      setErr('New passwords do not match');
      setLoading(false);
      return;
    }
    // TODO: Call backend to change password
    try {
      const res = await fetch('http://localhost:5001/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: form.password,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Password changed!');
        setForm(f => ({ ...f, password: '', newPassword: '', confirmNewPassword: '', ...data.user }));
        if (data.user) {
          onProfileUpdate && onProfileUpdate(data.user);
        }
      } else {
        setErr(data.error || 'Failed to change password');
      }
    } catch {
      setErr('Server error');
    }
    setLoading(false);
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm('Delete all your URL history? This cannot be undone.')) return;
    setLoading(true);
    setMsg('');
    setErr('');
    // TODO: Call backend to delete all URLs
    try {
      const res = await fetch('http://localhost:5001/my-urls', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: 'ALL' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('All history deleted!');
        onHistoryDelete && onHistoryDelete();
      } else {
        setErr(data.error || 'Failed to delete history');
      }
    } catch {
      setErr('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="settings-box">
      <h2>Profile Settings</h2>
      <form onSubmit={handleProfileUpdate} className="settings-form">
        <label>
          Name
          <input name="username" value={form.username} onChange={handleChange} />
        </label>
        <label>
          Age
          <input name="age" value={form.age} onChange={handleChange} type="number" min="0" />
        </label>
        <label>
          Mobile
          <input name="mobile" value={form.mobile} onChange={handleChange} />
        </label>
        <label>
          Sex
          <select name="sex" value={form.sex} onChange={handleChange}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <button type="submit" className="select-btn" disabled={loading}>Update Profile</button>
      </form>
      <h2>Change Password</h2>
      <form onSubmit={handlePasswordChange} className="settings-form">
        <label>
          Current Password
          <input name="password" value={form.password} onChange={handleChange} type="password" />
        </label>
        <label>
          New Password
          <input name="newPassword" value={form.newPassword} onChange={handleChange} type="password" />
        </label>
        <label>
          Confirm New Password
          <input name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} type="password" />
        </label>
        <button type="submit" className="select-btn" disabled={loading}>Change Password</button>
      </form>
      <h2>Danger Zone</h2>
      <button className="delete-btn" onClick={handleDeleteHistory} disabled={loading}>Delete All History</button>
      {msg && <div className="success-msg">{msg}</div>}
      {err && <div className="error-msg">{err}</div>}
    </div>
  );
};

export default Settings;
