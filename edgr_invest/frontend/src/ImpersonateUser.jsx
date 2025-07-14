// src/ImpersonateUser.jsx
import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ImpersonateUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const impersonating = localStorage.getItem('impersonating') === 'true';
    setIsImpersonating(impersonating);

    if (!impersonating) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await api.get('/api/users/users/', {
            headers: { Authorization: `Token ${token}` },
          });
          setUsers(res.data);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      fetchUsers();
    }
  }, []);

  const handleImpersonate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/users/impersonate/', { user_id: selectedUserId }, {
        headers: { Authorization: `Token ${token}` },
      });

      // Save current token before overwriting
      localStorage.setItem('original_token', token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('impersonating', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: res.data.user_id,
        username: res.data.username,
        is_staff: res.data.is_staff,
        impersonating: true,
      }));

      navigate('/dashboard');
    } catch (err) {
      console.error('Impersonation failed:', err);
    }
  };

  const handleStopImpersonating = async () => {
    const originalToken = localStorage.getItem('original_token');
    if (originalToken) {
      try {
        // Restore original token
        localStorage.setItem('token', originalToken);
        localStorage.removeItem('original_token');
        localStorage.removeItem('impersonating');

        // Fetch real user with is_staff info
        const res = await api.get('/api/users/profile/', {
          headers: { Authorization: `Token ${originalToken}` },
        });

        const user = {
          ...res.data,
          is_staff: res.data.is_staff || false, // Ensure flag is preserved
        };
        localStorage.setItem('user', JSON.stringify(user));

        navigate(`/dashboard?refresh=${Date.now()}`);;
      } catch (err) {
        console.error('Failed to restore admin session:', err);
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">
        {isImpersonating ? 'Currently Impersonating' : 'Impersonate User'}
      </h2>

      {isImpersonating ? (
        <Button
          onClick={handleStopImpersonating}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Stop Impersonating
        </Button>
      ) : (
        <>
          <select
            className="block w-full p-2 mb-4 bg-slate-800 text-white rounded"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email || user.username}
              </option>
            ))}
          </select>

          <Button
            onClick={handleImpersonate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Impersonate
          </Button>
        </>
      )}
    </div>
  );
};

export default ImpersonateUser;
