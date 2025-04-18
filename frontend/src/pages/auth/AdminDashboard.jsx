import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserClock, 
  FaUserCheck, 
  FaUserTimes, 
  FaChartLine, 
  FaSignOutAlt, 
  FaFileAlt,
  FaDownload,
  FaFilter,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8884D8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    approvedStaff: 0,
    rejectedStaff: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState('users');
  const [reportRange, setReportRange] = useState('weekly');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        // Fetch dashboard stats
        const usersRes = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        
        const pendingRes = await fetch('/api/admin/pending-staff', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pendingData = await pendingRes.json();

        // Fetch user activity data from your backend
        const activityRes = await fetch('/api/admin/user-activity', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const activityData = await activityRes.json();

        setStats({
          totalUsers: usersData.users?.length || 0,
          pendingApprovals: pendingData.length || 0,
          approvedStaff: usersData.users?.filter(u => u.isApproved).length || 0,
          rejectedStaff: usersData.users?.filter(u => u.isRejected).length || 0
        });

        setRecentUsers(usersData.users?.slice(0, 5) || []);
        setAllUsers(usersData.users || []);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/approve-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      window.location.reload();
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  const handleReject = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/reject-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      window.location.reload();
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  const getUserDistributionData = () => {
    const roles = ['Doctor', 'Receptionist', 'LabTechnician'];
    return roles.map(role => ({
      name: role,
      value: allUsers.filter(user => user.role === role).length
    }));
  };

  const getUserActivityData = () => {
    // Replace this with actual API call to get real data
    // For now, this is just a placeholder structure
    return allUsers.reduce((acc, user) => {
      const month = new Date(user.createdAt).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.name === month);
      if (existing) {
        existing.active += 1;
        if (new Date(user.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
          existing.new += 1;
        }
      } else {
        acc.push({
          name: month,
          active: 1,
          new: new Date(user.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 1 : 0
        });
      }
      return acc;
    }, []).slice(-6); // Last 6 months
  };

  const downloadReport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/reports?type=${reportType}&range=${reportRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Report generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setShowReports(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const filteredUsers = pendingOnly 
    ? (showAllUsers ? allUsers : recentUsers).filter(user => !user.isApproved && !user.isRejected)
    : (showAllUsers ? allUsers : recentUsers);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-2 border border-gray-300 dark:border-gray-600 shadow-sm"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            icon={<FaUsers className="text-indigo-500 dark:text-indigo-400 text-xl" />} 
            title="Total Users" 
            value={stats.totalUsers} 
            change="+12%"
            trend="up"
            darkMode={darkMode}
          />
          <StatCard 
            icon={<FaUserClock className="text-amber-500 dark:text-amber-400 text-xl" />} 
            title="Pending Approvals" 
            value={stats.pendingApprovals} 
            change="+3 new"
            trend="up"
            darkMode={darkMode}
          />
          <StatCard 
            icon={<FaUserCheck className="text-emerald-500 dark:text-emerald-400 text-xl" />} 
            title="Approved Staff" 
            value={stats.approvedStaff} 
            change="+5%"
            trend="up"
            darkMode={darkMode}
          />
          <StatCard 
            icon={<FaUserTimes className="text-rose-500 dark:text-rose-400 text-xl" />} 
            title="Rejected Staff" 
            value={stats.rejectedStaff} 
            change="2 today"
            trend="down"
            darkMode={darkMode}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Distribution Chart */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xs`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">User Distribution</h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">By Role</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getUserDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getUserDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : 'white',
                      borderColor: darkMode ? '#374151' : '#E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      color: darkMode ? 'white' : 'black'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: darkMode ? 'white' : 'black' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Activity Chart */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xs`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">User Activity</h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">Last 6 Months</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getUserActivityData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={darkMode ? '#4B5563' : '#E5E7EB'} 
                  />
                  <XAxis 
                    dataKey="name" 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
                  />
                  <YAxis 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : 'white',
                      borderColor: darkMode ? '#374151' : '#E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      color: darkMode ? 'white' : 'black'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: darkMode ? 'white' : 'black' }}
                  />
                  <Bar 
                    dataKey="active" 
                    fill="#6366F1" 
                    name="Active Users" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="new" 
                    fill="#10B981" 
                    name="New Users" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xs`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {pendingOnly ? 'Pending Approvals' : (showAllUsers ? 'All Users' : 'Recent Users')}
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPendingOnly(!pendingOnly)}
                    className={`text-sm px-3 py-1 rounded flex items-center ${pendingOnly 
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    <FaFilter className="mr-1" /> {pendingOnly ? 'Show All' : 'Pending Only'}
                  </button>
                  <button 
                    onClick={() => setShowAllUsers(!showAllUsers)}
                    className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {showAllUsers ? 'Show Recent' : 'Show All'}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-300 font-medium">{user.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'Doctor' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 
                              user.role === 'Receptionist' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 
                              'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.isApproved ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                              user.isRejected ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 
                              'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}`}>
                            {user.isApproved ? 'Approved' : user.isRejected ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {!user.isApproved && !user.isRejected && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleApprove(user._id)}
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(user._id)}
                                className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xs`}>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setPendingOnly(true);
                    setShowAllUsers(true);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
                >
                  <span className="font-medium">View Pending Approvals</span>
                  <FaUserClock className="text-indigo-500 dark:text-indigo-400" />
                </button>
                <button 
                  onClick={() => setShowReports(!showReports)}
                  className="w-full flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition"
                >
                  <span className="font-medium">Generate Reports</span>
                  <FaChartLine className="text-emerald-500 dark:text-emerald-400" />
                </button>
              </div>

              {/* Report Generation Panel */}
              {showReports && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Report Options</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Report Type</label>
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <option value="users">User Report</option>
                        <option value="activity">Activity Report</option>
                        <option value="approvals">Approvals Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Time Period</label>
                      <select 
                        value={reportRange}
                        onChange={(e) => setReportRange(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <button 
                      onClick={downloadReport}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm font-medium"
                    >
                      <FaDownload /> Generate Report
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* System Status */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-xs`}>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Database</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">API Server</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Last Backup</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Today, 02:30 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Enhanced StatCard Component with dark mode support
const StatCard = ({ icon, title, value, change, trend, darkMode }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-xs`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-opacity-10 ${darkMode ? 'bg-indigo-400' : 'bg-indigo-500'} mr-4`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' 
        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
        : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'}`}>
        {change}
      </div>
    </div>
  </div>
);

export default AdminDashboard;