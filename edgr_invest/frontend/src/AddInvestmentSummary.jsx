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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isAdmin && token) {
      api.get('api/users/users/', {
        headers: { Authorization: `Token ${token}` },
        withCredentials: true,
      })
        .then((response) => {
          if (Array.isArray(response.data)) {
            setUsers(response.data);
          } else {
            setUsers([{ id: user.id, email: user.email || 'druss16@gmail.com' }]);
          }
        })
        .catch(() => {
          setUsers([{ id: user.id, email: user.email || 'druss16@gmail.com' }]);
        });
    }
  }, [isAdmin, token, user.id, user.email]);

  // CSRF token getter
  function getCookie(name) {
    const cookie = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // First, ensure CSRF cookie is set
      await api.get('/get-csrf/');

      const response = await api.post('/add-investment-summary/', formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          // X-CSRFToken will be pulled from the cookie automatically by Axios
        },
        withCredentials: true,
      });

      setSuccess(response.data.message || 'Investment summary submitted successfully.');
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

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data || `Failed to submit form: ${err.message}`);
    }
  };


  if (!token) {
    return <div className="text-white p-10 text-center">You must be logged in to access this page.</div>;
  }

  if (!isAdmin) {
    return <div className="text-white p-10 text-center">Only administrators can add investment summaries.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-green-800"></div>
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1590283603385-a6e2a5b9db6f?w=1920&h=1080&fit=crop"
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
            <Label htmlFor="user">User (Email)</Label>
            <select
              id="user"
              name="user"
              value={formData.user}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-slate-800 text-white border-slate-600 py-2 px-3 rounded"
            >
              <option value="">Select a user</option>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((u) => (
                  <option key={u.id} value={u.id}>{u.email || u.username}</option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
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
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
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
