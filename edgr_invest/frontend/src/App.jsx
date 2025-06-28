import { useEffect } from 'react';
import api from './api'; // Import the Axios instance
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Index from './components/Index';
import PasswordReset from './components/PasswordReset';
import Waitlist from './components/Waitlist';
import './App.css';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/password_reset" element={<PasswordReset />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/waitlist-thankyou" element={<div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 text-center"><h2 className="text-3xl font-bold">Thank you for joining the waitlist!</h2></div>} />
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;