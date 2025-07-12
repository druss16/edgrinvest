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

  const [formData, setFormData] = useState({
    user_id: '',
    quarter: '',
    beginning_balance: '',
    dividend_percent: 3.33,
    dividend_amount: '',
    dividend_paid: '0.00',
    unrealized_gain: '',
    ending_balance: '',
  });

  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get next month from current string
  const getNextMonth = (currentQuarter) => {
    try {
      const [monthName, year] = currentQuarter.split(' ');
      const date = new Date(`${monthName} 1, ${year}`);
      date.setMonth(date.getMonth() + 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await api.get('/api/users/get-csrf-token/', { withCredentials: true });
        if (isAdmin && token) {
          const res = await api.get('api/users/users/', {
            headers: { Authorization: `Token ${token}` },
            withCredentials: true,
          });
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        setUsers([]);
      }
    };

    fetchInitialData();
  }, [isAdmin, token]);

  const handleUserSelect = async (e) => {
    const selectedUserId = e.target.value;
    setFormData(prev => ({ ...prev, user_id: selectedUserId }));

    try {
      const res = await api.get(`/api/users/latest-summary/${selectedUserId}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      const latest = res.data;
      const principal = parseFloat(latest.beginning_balance || 0);
      const priorUnrealized = parseFloat(latest.unrealized_gain || 0);
      const nextQuarter = getNextMonth(latest.quarter);
      const dividend_percent = 3.33;
      const dividend_amount = principal * (dividend_percent / 100);
      const unrealized_gain = priorUnrealized + dividend_amount;
      const ending_balance = principal + unrealized_gain;

      setFormData({
        user_id: selectedUserId,
        quarter: nextQuarter,
        beginning_balance: principal.toFixed(2),
        dividend_percent,
        dividend_amount: dividend_amount.toFixed(2),
        dividend_paid: '0.00',
        unrealized_gain: unrealized_gain.toFixed(2),
        ending_balance: ending_balance.toFixed(2),
      });
    } catch (err) {
      console.error('Error fetching user summary:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.get('/get-csrf/');
      const res = await api.post('/api/users/add-investment-summary/', formData, {
        headers: { Authorization: `Token ${token}` },
        withCredentials: true,
      });

      setSuccess(res.data.message || 'Investment summary submitted successfully.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data || `Submission failed: ${err.message}`);
    }
  };

  if (!token) return <div className="text-white p-10 text-center">You must be logged in.</div>;
  if (!isAdmin) return <div className="text-white p-10 text-center">Admin access only.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-green-800"></div>
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1590283603385-a6e2a5b9db6f"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative max-w-md w-full p-8 bg-slate-900 text-white rounded-lg shadow-lg">
        <img src={logo} alt="Logo" className="h-40 w-auto mx-auto mb-10" />
        <h2 className="text-3xl font-bold mb-6 text-center">Add Investment Summary</h2>

        {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded">{JSON.stringify(error)}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 mb-6 rounded">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>User (Email)</Label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleUserSelect}
              required
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600 py-2 px-3 rounded"
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email || u.username}
                </option>
              ))}
            </select>
          </div>

          {[
            ['quarter', 'Month (e.g., July 2025)'],
            ['beginning_balance', 'Principal'],
            ['dividend_percent', 'Dividend Percent'],
            ['dividend_amount', 'Dividend Amount'],
            ['dividend_paid', 'Dividend Paid'],
            ['unrealized_gain', 'Unrealized Gain'],
            ['ending_balance', 'Current Balance']
          ].map(([name, label]) => (
            <div key={name}>
              <Label>{label}</Label>
              <Input
                name={name}
                type={name === 'quarter' ? 'text' : 'number'}
                step="0.01"
                min="0"
                value={formData[name]}
                onChange={handleChange}
                className="mt-1 block w-full bg-slate-800 text-white border-slate-600"
                required
              />
            </div>
          ))}

          <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-teal-700">
            Submit Investment Summary
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentSummary;
