import { useState, useEffect } from 'react';
import api from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/users/profile/', {
            headers: { Authorization: `Token ${token}` },
          });
          console.log('User is authenticated:', response.data);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error('Token validation failed:', error.response?.data || error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Session expired. Please log in again.');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await api.get('/api/users/get-csrf-token/', {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error.response?.data || error.message);
        setError('Failed to initialize login. Please refresh and try again.');
      }
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({ ...credentials, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('CSRF token not loaded. Please refresh and try again.');
      return;
    }
    try {
      const response = await api.post('/api/users/login/', credentials, {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        email: response.data.username, // Since username is email
        is_staff: response.data.is_staff
      }));
      localStorage.setItem('token', response.data.token);
      console.log('Login successful:', response.data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid credentials. Please try again.');
      console.error('Login error:', error.response?.data || error.message);
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
          className="h-40 w-auto mx-auto mb-10 drop-shadow-[0_0_22px_rgba(20,184,166,1)] shadow-xl"
          style={{ height: '168px' }}
        />
        <h2 className="text-3xl font-bold mb-2 text-center">Login to Your Account</h2>
        <p className="text-gray-300 mb-6 text-center">Enter your credentials below</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-white">Email</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              className="bg-slate-800 text-white border-slate-600"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              className="bg-slate-800 text-white border-slate-600"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={credentials.remember}
                onChange={handleChange}
                className="border-slate-600 rounded text-teal-500 focus:ring-teal-400"
              />
              <Label htmlFor="remember" className="text-white">Remember me</Label>
            </div>
            <a href="/reset-password/" className="text-teal-400 hover:text-teal-300 text-sm">
              Forgot your password?
            </a>
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600" disabled={!csrfToken}>
            Login
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-300">
            Don't have an account? <a href="/waitlist/" className="text-teal-400 hover:text-teal-300">Join Waitlist</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;