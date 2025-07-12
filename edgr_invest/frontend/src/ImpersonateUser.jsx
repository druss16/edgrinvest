// === Django Backend (users/views.py) ===
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

User = get_user_model()

class ImpersonateUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            user_id = request.data.get("user_id")
            if not user_id:
                return Response({"error": "User ID is required"}, status=400)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "is_staff": user.is_staff,
                "impersonating": True
            }, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# === Django Backend (users/urls.py) ===
from .views import ImpersonateUserView
urlpatterns += [
    path('impersonate/', ImpersonateUserView.as_view(), name='impersonate-user'),
]


// === Frontend (React: ImpersonateUser.jsx) ===
import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ImpersonateUser = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  const handleImpersonate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/users/impersonate/', { user_id: selectedUserId }, {
        headers: { Authorization: `Token ${token}` },
      });
      localStorage.setItem('token', res.data.token);
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Impersonate User</h2>
      <select
        className="block w-full p-2 mb-4 bg-slate-800 text-white rounded"
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
      >
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>{user.email || user.username}</option>
        ))}
      </select>
      <Button onClick={handleImpersonate} className="bg-blue-600 text-white px-4 py-2 rounded">
        Impersonate
      </Button>
    </div>
  );
};

export default ImpersonateUser;
