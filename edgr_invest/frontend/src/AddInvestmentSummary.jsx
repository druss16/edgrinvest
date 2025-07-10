import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

const AddInvestmentSummary = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token') || '';
  const isAdmin = user.is_staff || false;
  const navigate = useNavigate();

  console.log('User:', user);
  console.log('isAdmin:', isAdmin);
  console.log('Token:', token);

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
  const [loading, setLoading] = useState(false); // Start as false to avoid blank page

  // Fetch CSRF token
  useEffect(() => {
    console.log('Starting CSRF token fetch');
    api.get('/get-csrf-token/')
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
        setError(`Failed to initialize form: ${err.message}`);
      });
  }, []);

  // Fetch users for admin
  useEffect(() => {
    if (isAdmin && token) {
      console.log('Fetching users for admin');
      api.get('/users/', {
        headers: { Authorization: `Token ${token}` },
      })
        .then((response) => {
          console.log('Users fetched:', response.data);
          setUsers(response.data);
        })
        .catch((err) => {
          console.error('Failed to fetch users:', {
            message: err.message,
            config: err.config,
            response: err.response?.data,
            status: err.response?.status,
          });
          setError('Failed to load user list.');
        });
    }
  }, [isAdmin, token]);

  // Block non-admins
  if (!token) {
    console.log('No token, showing login required message');
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Add Investment Summary</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          You must be logged in to access this page.
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('Not admin, showing admin-only message');
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Add Investment Summary</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Only administrators can add investment summaries.
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
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
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

  console.log('Rendering form, loading:', loading, 'csrfToken:', csrfToken, 'users:', users);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Add Investment Summary</h2>
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
          <label className="block text-sm font-medium text-gray-700">User (Email)</label>
          <select
            name="user"
            value={formData.user}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          >
            <option value="">Select a user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Month</label>
          <input
            type="text"
            name="quarter"
            value={formData.quarter}
            onChange={handleChange}
            placeholder="e.g., July 2025"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Principal</label>
          <input
            type="number"
            name="beginning_balance"
            value={formData.beginning_balance}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dividend Percent</label>
          <input
            type="number"
            name="dividend_percent"
            value={formData.dividend_percent}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dividend Amount</label>
          <input
            type="number"
            name="dividend_amount"
            value={formData.dividend_amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dividend Paid</label>
          <input
            type="number"
            name="dividend_paid"
            value={formData.dividend_paid}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unrealized Gain</label>
          <input
            type="number"
            name="unrealized_gain"
            value={formData.unrealized_gain}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Balance</label>
          <input
            type="number"
            name="ending_balance"
            value={formData.ending_balance}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={!csrfToken}
        >
          Submit Investment Summary
        </button>
      </form>
    </div>
  );
};

export default AddInvestmentSummary;