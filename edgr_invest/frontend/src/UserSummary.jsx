import React, { useState, useEffect } from 'react';
import api from './api';
import AddInvestmentSummary from './AddInvestmentSummary'; // reuse your component

const UserSummary = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.is_staff || false;

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/users/users/', {
          headers: { Authorization: `Token ${token}` },
          withCredentials: true,
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!selectedUserId) return;
      try {
        const res = await api.get(`/api/users/all-summaries/${selectedUserId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setSummaries(res.data || []);
      } catch (err) {
        console.error('Error fetching summaries:', err);
      }
    };

    fetchSummaries();
  }, [selectedUserId, token]);

  if (!token || !isAdmin) return <div className="text-white p-10">Admin access required.</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left - Add Form */}
      <div className="w-1/3 bg-slate-900 text-white p-6 border-r border-gray-800 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Summary</h2>
        <select
          className="w-full p-2 mb-6 bg-gray-800 text-white rounded"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email || u.username}
            </option>
          ))}
        </select>

        {selectedUserId && <AddInvestmentSummary selectedUserId={selectedUserId} />}
      </div>

      {/* Right - Summary List */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Investment Summary</h2>
        {summaries.length > 0 ? (
          <table className="w-full table-auto text-left bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200 text-sm uppercase text-gray-600">
                <th className="p-2">Quarter</th>
                <th className="p-2">Principal</th>
                <th className="p-2">Div %</th>
                <th className="p-2">Dividend</th>
                <th className="p-2">Paid</th>
                <th className="p-2">Unrealized</th>
                <th className="p-2">End Balance</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => (
                <tr key={summary.id} className="border-b text-sm">
                  <td className="p-2">{summary.quarter}</td>
                  <td className="p-2">${parseFloat(summary.beginning_balance).toFixed(2)}</td>
                  <td className="p-2">{summary.dividend_percent}%</td>
                  <td className="p-2">${parseFloat(summary.dividend_amount).toFixed(2)}</td>
                  <td className="p-2">${parseFloat(summary.dividend_paid).toFixed(2)}</td>
                  <td className="p-2">${parseFloat(summary.unrealized_gain).toFixed(2)}</td>
                  <td className="p-2 font-bold">${parseFloat(summary.ending_balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No summaries available for this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserSummary;
