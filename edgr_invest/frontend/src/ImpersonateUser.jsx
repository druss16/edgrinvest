// src/Impersonate.jsx
import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Impersonate = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    const fetchUsersAndStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          navigate('/login', { replace: true });
          return;
        }

        const originalUserToken = localStorage.getItem('original_user_token');
        if (!originalUserToken) {
          const res = await api.get('/api/users/users/', {
            headers: {
              Authorization: `Token ${token}`,
              'X-CSRFToken': getCookie('csrftoken'),
            },
            withCredentials: true,
          });
          setUsers(res.data);
        } else {
          // When impersonating, fetch profile to ensure state is correct
          const res = await api.get('/api/users/profile/', {
            headers: { Authorization: `Token ${token}` },
          });
          localStorage.setItem('user', JSON.stringify(res.data));
        }

        setIsImpersonating(!!originalUserToken);
      } catch (err) {
        console.error('Error fetching users or status:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(`Failed to load impersonation data: ${err.response?.data?.error || err.message || 'Server error'}`);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsersAndStatus();
  }, [navigate]);

  const handleStartImpersonation = async () => {
    if (!selectedUserId) {
      setError('Please select a user to impersonate');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        navigate('/login', { replace: true });
        return;
      }

      localStorage.setItem('original_user_token', token);

      const res = await api.post('/api/users/impersonate/', { user_id: selectedUserId }, {
        headers: {
          Authorization: `Token ${token}`,
          'X-CSRFToken': getCookie('csrftoken'),
        },
        withCredentials: true,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.impersonated_user_id,
        username: res.data.username || res.data.email || 'unknown',
        email: res.data.email,
        is_staff: res.data.is_staff ?? false,
      }));

      setIsImpersonating(true);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Impersonation failed:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError('Impersonation failed: ' + (err.response?.data?.error || err.message || 'Server error'));
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStopImpersonation = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        navigate('/login', { replace: true });
        return;
      }

      const response = await api.post(
        '/api/users/stop-impersonation/',
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      const originalUserToken = localStorage.getItem('original_user_token');
      localStorage.setItem('token', response.data.token || originalUserToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('original_user_token');

      // Force refresh of profile to ensure is_staff is updated
      const profileRes = await api.get('/api/users/profile/', {
        headers: { Authorization: `Token ${response.data.token || originalUserToken}` },
      });
      localStorage.setItem('user', JSON.stringify(profileRes.data));

      setIsImpersonating(false);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to stop impersonation:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setError('Failed to stop impersonation: ' + (error.response?.data?.error || error.message || 'Server error'));
      if (error.response?.status === 403) {
        setError('Permission denied. Please log out and log back in as an admin.');
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <p className="text-white text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            {isImpersonating ? 'Currently Impersonating' : 'Impersonate User'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-400 bg-red-900/30 p-3 rounded-lg mb-4 text-center">{error}</p>
          )}
          {isImpersonating ? (
            <div className="space-y-4">
              <p className="text-white">You are currently impersonating a user.</p>
              <Button
                onClick={handleStopImpersonation}
                className="bg-red-600 text-white px-4 py-2 rounded w-full"
                disabled={loading}
              >
                Stop Impersonating
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <select
                className="block w-full p-2 mb-4 bg-slate-800 text-white rounded"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user.username} (${user.email})`}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleStartImpersonation}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                disabled={!selectedUserId || loading}
              >
                Impersonate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Impersonate;