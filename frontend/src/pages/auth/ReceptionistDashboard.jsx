// src/pages/PremiumDashboard.js
// Add this import at the top of ReceptionistDashboard.jsx
import React, { useState } from 'react';
// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUserPlus, FiSearch, FiCalendar, FiUsers, 
  FiClock, FiSettings, FiLogOut 
} from 'react-icons/fi';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { icon: <FiUserPlus />, label: 'Register Patient', path: '/register-patient' },
    { icon: <FiSearch />, label: 'Search Patient', path: '/search-patient' },
    { icon: <FiCalendar />, label: 'Appointments', path: '/appointments' },
    { icon: <FiUsers />, label: 'Patients', path: '/patients' },
    { icon: <FiClock />, label: 'Today', path: '/today' },
    { icon: <FiSettings />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gradient-to-b from-primary to-secondary text-white">
          <div className="flex items-center justify-center h-16 px-4 border-b border-blue-400">
            <h1 className="text-xl font-bold">MediCare Admin</h1>
          </div>
          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setActiveTab(item.label);
                  }}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === item.label ? 'bg-white text-primary' : 'text-white hover:bg-blue-600'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto">
              <button 
                onClick={() => navigate('/logout')}
                className="flex items-center w-full px-4 py-3 text-white hover:bg-blue-600 rounded-lg transition-all"
              >
                <FiLogOut className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span>RS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="card p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700">Total Patients</h3>
                <div className="p-3 rounded-full bg-blue-100 text-primary">
                  <FiUsers className="text-xl" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">1,248</p>
              <p className="mt-2 text-sm text-green-600">+12% from last month</p>
            </div>

            <div className="card p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700">Today's Appointments</h3>
                <div className="p-3 rounded-full bg-indigo-100 text-secondary">
                  <FiCalendar className="text-xl" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">24</p>
              <p className="mt-2 text-sm text-green-600">+2 from yesterday</p>
            </div>

            <div className="card p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700">Pending Actions</h3>
                <div className="p-3 rounded-full bg-red-100 text-danger">
                  <FiClock className="text-xl" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">5</p>
              <p className="mt-2 text-sm text-red-600">Requires attention</p>
            </div>

            {/* Quick Actions */}
            <div className="card col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/register-patient')}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-primary transition-all"
                >
                  <div className="p-3 mb-2 rounded-full bg-blue-100 text-primary">
                    <FiUserPlus className="text-xl" />
                  </div>
                  <span className="text-sm font-medium">Register Patient</span>
                </button>
                
                <button 
                  onClick={() => navigate('/appointments/new')}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-secondary transition-all"
                >
                  <div className="p-3 mb-2 rounded-full bg-indigo-100 text-secondary">
                    <FiCalendar className="text-xl" />
                  </div>
                  <span className="text-sm font-medium">New Appointment</span>
                </button>
                
                <button 
                  onClick={() => navigate('/search-patient')}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-success transition-all"
                >
                  <div className="p-3 mb-2 rounded-full bg-green-100 text-success">
                    <FiSearch className="text-xl" />
                  </div>
                  <span className="text-sm font-medium">Find Patient</span>
                </button>
                
                <button 
                  onClick={() => navigate('/today')}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-accent transition-all"
                >
                  <div className="p-3 mb-2 rounded-full bg-purple-100 text-accent">
                    <FiClock className="text-xl" />
                  </div>
                  <span className="text-sm font-medium">Today's Schedule</span>
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="card col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Appointments</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap">Dr. Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap">10:00 AM</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confirmed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;