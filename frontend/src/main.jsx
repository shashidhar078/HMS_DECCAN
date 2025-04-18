import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import RoleSelection from './pages/RoleSelection';
import AuthReceptionist from './pages/auth/AuthReceptionist';
import AdminLogin from './pages/auth/AdminLogin';
import DoctorLogin from './pages/auth/DoctorLogin';
import DoctorRegister from './pages/auth/DoctorRegister';
import AdminDashboard from './pages/auth/AdminDashboard';
import ReceptionistDashboard from './pages/auth/ReceptionistDashboard';
import GenAiSearch from './genai/GenAiSearch';
import AwaitingApproval from './pages/auth/AwaitingApproval';
import AboutUs from './pages/auth/AboutUs'; // Import the AboutUs component
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about-us" element={<AboutUs />} /> {/* Add this route */}
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/auth/receptionist" element={<AuthReceptionist role="receptionist" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        <Route path="/search/:query" element={<GenAiSearch />} />
        <Route path="/auth/dashboard" element={<AdminDashboard />} />
        <Route path="/awaiting-approval" element={<AwaitingApproval />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);