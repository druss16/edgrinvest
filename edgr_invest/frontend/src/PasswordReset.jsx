// src/components/PasswordReset.jsx
import { useState } from 'react';
import api from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/users/password-reset/', { email });
      setMessage(res.data.message || 'Check your email for the reset link.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
        />
        {message && <p className="text-green-400 mt-2">{message}</p>}
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <Button type="submit" className="w-full mt-4 bg-teal-600 hover:bg-teal-500">Send Reset Link</Button>
      </form>
    </div>
  );
};

export default PasswordReset;
