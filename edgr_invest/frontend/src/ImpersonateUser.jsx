import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ImpersonateUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const navigate = useNavigate();

  // Utility to get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  useEffect(() => {
    const impersonating = localStorage.getItem('impersonating') === 'true';
    setIsImpersonating(impersonating);

    if (!impersonating) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found for fetching users');
            navigate('/login');
            return;
          }
          const res = await api.get('/api/users/users/', {
            headers: {
              Authorization: `Token ${token}`,
              'X-CSRFToken': getCookie('csrftoken'),
            },
            withCredentials: true,
          });
          setUsers(res.data);
        } catch (err) {
          console.error('Error fetching users:', err.response?.data || err.message);
          alert('Failed to fetch users: ' + (err.response?.data?.error || 'Server error'));
          if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
          }
        }
      };
      fetchUsers();
    }
  }, [navigate]);

  const handleImpersonate = async () => {
    if (!selectedUserId) {
      console.error('No user selected');
      alert('Please select a user to impersonate');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }

      const res = await api.post('/api/users/impersonate/', { user_id: selectedUserId }, {
        headers: {
          Authorization: `Token ${token}`,
          'X-CSRFToken': getCookie('csrftoken'),
        },
        withCredentials: true,
      });

      // Save current token before overwriting
      localStorage.setItem('original_token', token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('impersonating', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: res.data.impersonated_user_id,
        username: res.data.email || 'unknown',
        is_staff: res.data.is_staff || false,
        impersonating: true,
      }));

      navigate('/dashboard');
    } catch (err) {
      console.error('Impersonation failed:', err.response?.data || err.message);
      alert('Impersonation failed: ' + (err.response?.data?.error || 'Server error'));
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const handleStopImpersonation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/api/users/stop-impersonation/', {}, {
        headers: { Authorization: `Token ${token}` },
      });
      // Update localStorage with the original user's data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to stop impersonation:', error);
      setError('Failed to stop impersonation.');
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
            disabled={!selectedUserId} // Disable button if no user is selected
          >
            Impersonate
          </Button>
        </>
      )}
    </div>
  );
};

export default ImpersonateUser;