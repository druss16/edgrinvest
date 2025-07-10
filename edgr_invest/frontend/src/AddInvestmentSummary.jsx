import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from './assets/logo.png';

const AddInvestmentSummary = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token') || '';
  const isAdmin = user.is_staff || false;
  const navigate = useNavigate();

  console.log('AddInvestmentSummary render - User:', user);
  console.log('AddInvestmentSummary render - isAdmin:', isAdmin);
  console.log('AddInvestmentSummary render - Token:', token);

  const [formData, setFormData] = useState({
    user: '',
    quarter: '',
    beginning_balance: '',
    dividend_percent: '',
    dividend_amount: '',
    dividend_paid: '',
    unrealized_gain: '',
    ending_balance: '',
  });
  const [users, setUsers] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch CSRF token
  useEffect(() => {
    console.log('Fetching CSRF token from:', api.defaults.baseURL + '/get-csrf-token/');
    api.get('/get-csrf-token/', { withCredentials: true })
      .then((response) => {
        console.log('CSRF token fetched:', response.data);
        setCsrfToken(response.data.csrfToken);
      })
      .catch((err) => {
        console.error('Failed to fetch CSRF token:', {
          message: err.message,
          config: err.config,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(`Failed to initialize CSRF token: ${err.message}. Using fallback.`);
        // Temporary bypass for production testing
        setCsrfToken('temp-bypass');
      });
  }, []);

  // Fetch users for dropdown
  useEffect(() => {
    if (isAdmin && token) {
      console.log('Fetching users from:', api.defaults.baseURL + '/users/');
      api.get('api/users/users/', {
        headers: { Authorization: `Token ${token}` },
        withCredentials: true,
      })
        .then((response) => {
          console.log('Users fetched:', response.data);
          if (Array.isArray(response.data)) {
            setUsers(response.data);
          } else {
            console.error('Users data is not an array:', response.data);
            setError('Invalid user data received from server.');
            // Fallback to current user
            setUsers([{ id: user.id, email: user.email || 'druss16@gmail.com' }]);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch users:', {
            message: err.message,
            config: err.config,
            response: err.response?.data,
            status: err.response?.status,
          });
          setError('Failed to load user list: ' + (err.response?.statusText || err.message));
          // Fallback to current user
          setUsers([{ id: user.id, email: user.email || 'druss16@gmail.com' }]);
        });
    } else {
      console.log('Skipping users fetch: isAdmin=', isAdmin, 'token=', !!token);
    }
  }, [isAdmin, token, user.id, user.email]);

  // Block non-authenticated users
  if (!token) {
    console.log('No token, showing login required message');
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
          <h2 className="text-3xl font-bold mb-6 text-center">Add Investment Summary</h2>
          <div className="bg-red-100 text-red-700 p-4 rounded">
            You must be logged in to access this page.
          </div>
        </div>
      </div>
    );
  }

  // Block non-staff users
  if (!isAdmin) {
    console.log('Not admin, showing admin-only message');
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
          <h2 className="text-3xl font-bold mb-6 text-center">Add Investment Summary</h2>
          <div className="bg-red-100 text-red-700 p-4 rounded">
            Only administrators can add investment summaries.
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log('Form data updated:', { ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    console.log('Submitting form with data:', formData);

    try {
      const response = await api.post('/add-investment-summary/', formData, {
        headers: {
          Authorization: `Token ${token}`,
          'X-CSRFToken': csrfToken || 'temp-bypass',
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log('Form submission successful:', response.data);
      setSuccess(response.data.message);
      setFormData({
        user: '',
        quarter: '',
        beginning_balance: '',
        dividend_percent: '',
        dividend_amount: '',
        dividend_paid: '',
        unrealized_gain: '',
        ending_balance: '',
      });
      setTimeout(() => {
        console.log('Navigating to /dashboard');
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Form submission error:', {
        message: err.message,
        config: err.config,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data || `Failed to submit form: ${err.message}`);
    }
  };

  console.log('Rendering form - csrfToken:', csrfToken, 'users:', users, 'error:', error, 'success:', success);

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
        <h2 className="text-3xl font-bold mb-6 text-center">Add Investment Summary</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="user" className="text-white">User (Email)</Label>
            <select
              id="user"
              name="user"
              value={formData.user}
              onChange={handleChange}
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 py-2 px-3"
              required
            >
              <option value="">Select a user</option>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
            </select>
          </div>
          <div>
            <Label htmlFor="quarter" className="text-white">Month</Label>
            <Input
              id="quarter"
              type="text"
              name="quarter"
              value={formData.quarter}
              onChange={handleChange}
              placeholder="e.g., July 2025"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="beginning_balance" className="text-white">Principal</Label>
            <Input
              id="beginning_balance"
              type="number"
              name="beginning_balance"
              value={formData.beginning_balance}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="dividend_percent" className="text-white">Dividend Percent</Label>
            <Input
              id="dividend_percent"
              type="number"
              name="dividend_percent"
              value={formData.dividend_percent}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="dividend_amount" className="text-white">Dividend Amount</Label>
            <Input
              id="dividend_amount"
              type="number"
              name="dividend_amount"
              value={formData.dividend_amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="dividend_paid" className="text-white">Dividend Paid</Label>
            <Input
              id="dividend_paid"
              type="number"
              name="dividend_paid"
              value={formData.dividend_paid}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="unrealized_gain" className="text-white">Unrealized Gain</Label>
            <Input
              id="unrealized_gain"
              type="number"
              name="unrealized_gain"
              value={formData.unrealized_gain}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="ending_balance" className="text-white">Current Balance</Label>
            <Input
              id="ending_balance"
              type="number"
              name="ending_balance"
              value={formData.ending_balance}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600"
            disabled={!csrfToken}
          >
            Submit Investment Summary
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentSummary;