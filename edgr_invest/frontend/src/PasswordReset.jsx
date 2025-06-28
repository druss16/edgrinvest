import { useState, useEffect } from 'react';
import api from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from './assets/logo.png';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await api.get('/api/users/get-csrf-token/', {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error.response?.data || error.message);
        setError('Failed to initialize. Please refresh and try again.');
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('CSRF token not loaded. Please refresh and try again.');
      return;
    }
    try {
      const response = await api.post('/api/users/password_reset/', { email }, {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setMessage('A password reset link has been sent to your email.');
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset link. Please try again.');
      setMessage('');
      console.error('Password reset error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-green-800"></div>
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1590283603385-a6e2a5b9db6f?w=1920&h=1080&fit=crop"
          alt="Stock market and portfolio growth background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative max-w-md w-full p-8 bg-slate-900 text-white rounded-lg shadow-lg">
        <img
          src={logo}
          alt="EdgeRin Investment"
          className="h-40 w-auto mx-auto mb-10 drop-shadow-[0_0_22px_rgba(20,184,166,1)] shadow-xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
          style={{ height: '168px' }}
        />
        <h2 className="text-3xl font-bold mb-2 text-center">Reset Your Password</h2>
        <p className="text-gray-300 mb-6 text-center">Enter your email and we’ll send you a link to reset it</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 text-white border-slate-600"
              placeholder="Enter your email"
              required
            />
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
          {message && <p className="text-green-400 text-center">{message}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600" disabled={!csrfToken}>
            Send Reset Link
          </Button>
        </form>
        <div className="mt-4 text-center">
          <a href="/login/" className="text-teal-400 hover:text-teal-300">
            <FontAwesomeIcon icon={faChevronLeft} className="me-1" /> Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;