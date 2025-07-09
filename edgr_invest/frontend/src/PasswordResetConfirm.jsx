// src/components/PasswordResetConfirm.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PasswordResetConfirm = () => {
  const { uid, token } = useParams();
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password1 !== password2) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await api.post('/password-reset-confirm/', {
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Please try again.');
      console.error('API error:', err); // Log the error for debugging
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Set New Password</h2>
        <Label>New Password</Label>
        <Input
          type="password"
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
          required
          className="bg-slate-700 border-slate-600 text-white"
        />
        <Label>Confirm New Password</Label>
        <Input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          className="bg-slate-700 border-slate-600 text-white"
        />
        {message && <p className="text-green-400 mt-2">{message}</p>}
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <Button type="submit" className="w-full mt-4 bg-teal-600 hover:bg-teal-500">Reset Password</Button>
      </form>
    </div>
  );
};

export default PasswordResetConfirm;