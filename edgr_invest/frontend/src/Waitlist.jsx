import { useState, useEffect } from 'react';
import api from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from './assets/logo.png';

const Waitlist = () => {
  const [waitlist, setWaitlist] = useState({ full_name: '', email: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Waitlist component mounted');
    const fetchCsrfToken = async () => {
      try {
        const response = await api.get('/api/get-csrf-token/', { // Updated to /api/
          withCredentials: true,
        });
        if (response.data && response.data.csrfToken) {
          setCsrfToken(response.data.csrfToken);
          console.log('CSRF token fetched:', response.data.csrfToken);
        } else {
          throw new Error('Invalid CSRF token response');
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error.response?.status, error.response?.data || error.message);
        setError('Failed to initialize. Please check server connection.');
      }
    };
    fetchCsrfToken().catch((e) => console.error('UseEffect error:', e));
  }, []);

  const handleChange = (e) => {
    setWaitlist({ ...waitlist, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted to /api/waitlist/:', waitlist);
    if (!csrfToken) {
      setError('CSRF token not loaded. Please refresh and try again.');
      return;
    }
    if (!waitlist.full_name || !waitlist.email || !/\S+@\S+\.\S+/.test(waitlist.email)) {
      setError('Please provide a valid full name and email address.');
      return;
    }
    try {
      const response = await api.post('/api/waitlist/', waitlist, { // Updated to /api/
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log('API response from /api/waitlist/:', response.status, response.data);
      if (response.status === 201) {
        setMessage(response.data.message || 'Successfully joined waitlist!');
        setError('');
        setWaitlist({ full_name: '', email: '' });
        navigate('/waitlist-thankyou');
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data || 'Failed to join waitlist. Please try again.';
      setError(errorMsg);
      setMessage('');
      console.error('Waitlist error:', error.response?.status, error.response?.data || error.message);
    }
  };

  if (error && !message) {
    console.error('Rendering with error:', error);
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 text-center">
        <h2 className="text-2xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!logo) {
    console.error('Logo asset not loaded');
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 text-center">
        <h2 className="text-2xl font-bold">Error</h2>
        <p>Logo not found. Please check the asset path.</p>
      </div>
    );
  }

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
        <h2 className="text-3xl font-bold mb-2 text-center">Join the EDGR Waitlist</h2>
        <p className="text-gray-300 mb-6 text-center">Be the first to experience cutting-edge investment opportunities</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-white">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={waitlist.full_name}
              onChange={handleChange}
              className="bg-slate-800 text-white border-slate-600"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={waitlist.email}
              onChange={handleChange}
              className="bg-slate-800 text-white border-slate-600"
              placeholder="Enter your email"
              required
            />
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
          {message && <p className="text-green-400 text-center">{message}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600" disabled={!csrfToken}>
            Join Now
          </Button>
        </form>
        <div className="mt-4 text-center">
          <a href="/" className="text-teal-400 hover:text-teal-300">
            <FontAwesomeIcon icon={faChevronLeft} className="me-1" /> Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;