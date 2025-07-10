import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AddInvestmentSummary = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();

  console.log('AddInvestmentSummary render - User:', user);
  console.log('AddInvestmentSummary render - Token:', token);

  const [formData, setFormData] = useState({
    user: user.id || '', // Auto-set to logged-in user
    quarter: '',
    beginning_balance: '',
    dividend_percent: '',
    dividend_amount: '',
    dividend_paid: '',
    unrealized_gain: '',
    ending_balance: '',
  });
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
        setError(`Failed to initialize form: ${err.message}`);
      });
  }, []);

  // Block non-authenticated users
  if (!token) {
    console.log('No token, showing login required message');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Add Investment Summary</h2>
          <div className="bg-red-100 text-red-700 p-4 rounded">
            You must be logged in to access this page.
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
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log('Form submission successful:', response.data);
      setSuccess(response.data.message);
      setFormData({
        user: user.id || '',
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

  console.log('Rendering form - csrfToken:', csrfToken, 'error:', error, 'success:', success);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Add Investment Summary</h2>
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
            <Label htmlFor="quarter" className="text-gray-700">Month</Label>
            <Input
              id="quarter"
              type="text"
              name="quarter"
              value={formData.quarter}
              onChange={handleChange}
              placeholder="e.g., July 2025"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="beginning_balance" className="text-gray-700">Principal</Label>
            <Input
              id="beginning_balance"
              type="number"
              name="beginning_balance"
              value={formData.beginning_balance}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="dividend_percent" className="text-gray-700">Dividend Percent</Label>
            <Input
              id="dividend_percent"
              type="number"
              name="dividend_percent"
              value={formData.dividend_percent}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="dividend_amount" className="text-gray-700">Dividend Amount</Label>
            <Input
              id="dividend_amount"
              type="number"
              name="dividend_amount"
              value={formData.dividend_amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="dividend_paid" className="text-gray-700">Dividend Paid</Label>
            <Input
              id="dividend_paid"
              type="number"
              name="dividend_paid"
              value={formData.dividend_paid}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="unrealized_gain" className="text-gray-700">Unrealized Gain</Label>
            <Input
              id="unrealized_gain"
              type="number"
              name="unrealized_gain"
              value={formData.unrealized_gain}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="ending_balance" className="text-gray-700">Current Balance</Label>
            <Input
              id="ending_balance"
              type="number"
              name="ending_balance"
              value={formData.ending_balance}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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