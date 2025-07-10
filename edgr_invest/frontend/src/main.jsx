import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './Index.jsx';
import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Waitlist from './Waitlist.jsx'; // ✅ Add this
import PasswordReset from './PasswordReset';
import PasswordResetConfirm from './PasswordResetConfirm';
import WaitlistThankYou from './WaitlistThankYou';
import AddInvestmentSummary from './AddInvestmentSummary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/waitlist" element={<Waitlist />} /> {/* ✅ Add this */}
        <Route path="/waitlist-thankyou" element={<WaitlistThankYou />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/reset/:uid/:token" element={<PasswordResetConfirm />} />
        <Route path="/add-summary" element={<AddInvestmentSummary />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
