import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUserPlus, FiSearch, FiCalendar, FiUsers, 
  FiClock, FiSettings, FiLogOut, FiFileText, FiCheck,
  FiDownload, FiEye, FiFilter, FiUpload, FiBarChart2,
  FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LabTechnicianDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingTests, setPendingTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState({
    tests: false,
    patients: false,
    search: false
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [patientsServedToday, setPatientsServedToday] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [updateResult, setUpdateResult] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Approval check on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'LabTechnician') {
      navigate('/auth/lab-technician-login');
      return;
    }
    if (user && user.isApproved === false) {
      navigate('/awaiting-approval');
    }
  }, [navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(prev => ({ ...prev, tests: true }));
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (activeTab === 'pending') {
          const res = await axios.get('/api/lab/pending-tests', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPendingTests(res.data || []);
        } else if (activeTab === 'completed') {
          const res = await axios.get('/api/lab/my-reports', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCompletedTests(res.data || []);
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(prev => ({ ...prev, tests: false }));
      }
    };
    if (activeTab !== 'search') fetchData();
  }, [activeTab]);

  // Fetch all patients when patients tab is active
  useEffect(() => {
    const fetchAllPatients = async () => {
      if (activeTab !== 'patients') return;
      
      setLoading(prev => ({ ...prev, patients: true }));
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user || user.role !== 'LabTechnician') {
          setError('Unauthorized access');
          navigate('/auth/lab-technician-login');
          return;
        }

        const response = await axios.get('/api/patients', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const patientsData = response.data?.data || [];
        setPatients(patientsData);
        setError('');
      } catch (error) {
        console.error('Error fetching patients:', error);
        if (error.response?.status === 403) {
          setError('You do not have permission to view patients');
          setTimeout(() => navigate('/auth/lab-technician-login'), 2000);
        } else {
          setError('Failed to fetch patients');
        }
        setPatients([]);
      } finally {
        setLoading(prev => ({ ...prev, patients: false }));
      }
    };

    fetchAllPatients();
  }, [activeTab, navigate]);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(prev => ({ ...prev, search: true }));
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user || user.role !== 'LabTechnician') {
        setError('Unauthorized access');
        navigate('/auth/lab-technician-login');
        return;
      }

      const response = await axios.get('/api/lab/patients/search', {
        params: { query: searchTerm },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const searchData = response.data?.data || [];
      setSearchResults(searchData);
      setError('');
    } catch (error) {
      console.error('Search error:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to search patients');
      } else {
        setError('Failed to search patients');
      }
      setSearchResults([]);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Upload mock lab report PDF
  const handleReportUpload = async (patientId, file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user || user.role !== 'LabTechnician') {
        setError('Unauthorized access');
        navigate('/auth/lab-technician-login');
        return;
      }

      const formData = new FormData();
      formData.append('report', file);
      formData.append('patientId', patientId);
      await axios.post('/api/lab/upload-report', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchPatientsServedToday();
      alert('Lab report uploaded!');
    } catch (err) {
      setError('Error uploading report');
    } finally {
      setUploading(false);
    }
  };

  // Fetch number of unique patients served today
  const fetchPatientsServedToday = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/lab/patients-served-today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientsServedToday(res.data.count || 0);
    } catch {
      setPatientsServedToday(0);
    }
  };

  useEffect(() => {
    fetchPatientsServedToday();
  }, []);

  // Update test result
  const handleUpdateTest = (test) => {
    setSelectedTest(test);
    setUpdateResult(test.result || '');
    setUpdateNotes(test.notes || '');
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedTest) return;
    setLoading(prev => ({ ...prev, tests: true }));
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/lab/tests/${selectedTest._id}`, {
        result: updateResult,
        notes: updateNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowUpdateModal(false);
      setSelectedTest(null);
      setUpdateResult('');
      setUpdateNotes('');
      setActiveTab('pending');
    } catch (err) {
      setError('Error updating test result');
    } finally {
      setLoading(prev => ({ ...prev, tests: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/lab-technician-login');
  };

  // Fetch patient prescriptions
  const fetchPatientPrescriptions = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/prescriptions/patient/${patientId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  };

  // Download prescription
  const handleDownloadPrescription = async (prescriptionId, patientName) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user || user.role !== 'LabTechnician') {
        setError('Unauthorized access');
        navigate('/auth/lab-technician-login');
        return;
      }

      setError('');
      const downloadButton = document.getElementById(`download-btn-${prescriptionId}`);
      if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.innerHTML = '<span class="animate-spin">↻</span> Downloading...';
      }

      const response = await axios.get(`/api/prescriptions/${prescriptionId}/download`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let fileName = 'prescription.pdf';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        fileName = disposition.split('filename=')[1].replace(/"/g, '');
      } else {
        fileName = `prescription_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setError('');

      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<span>⬇️ Download</span>';
      }
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error response:', error.response);

      const downloadButton = document.getElementById(`download-btn-${prescriptionId}`);
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<span>⬇️ Download</span>';
      }

      if (error.response) {
        if (error.response.status === 403) {
          setError('You do not have permission to download prescriptions');
        } else if (error.response.status === 404) {
          setError('Prescription file not found. Please contact the doctor to regenerate the prescription.');
        } else if (error.response.status === 500) {
          setError('Server error while downloading prescription. Please try again.');
        } else {
          const errorMessage = error.response.data?.message || 'Failed to download prescription';
          setError(`${errorMessage}. Please try again or contact support.`);
        }
      } else {
        setError('Network error while downloading prescription. Please check your connection and try again.');
      }
    }
  };

  // Handle viewing patient details
  const handleViewPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    try {
      const prescriptions = await fetchPatientPrescriptions(patient._id);
      setPatientPrescriptions(prescriptions || []);
      setShowPrescriptionsModal(true);
      setError('');
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to view prescriptions');
      } else {
        setError('Failed to fetch patient prescriptions');
      }
      setPatientPrescriptions([]);
    }
  };

  const renderPrescriptionsModal = () => {
    if (!showPrescriptionsModal || !selectedPatient) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Patient Details: <span className="text-primary">{selectedPatient.name}</span>
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">ID: {selectedPatient.customId}</span>
                {selectedPatient.age && (
                  <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">Age: {selectedPatient.age}</span>
                )}
                {selectedPatient.gender && (
                  <span className="text-xs font-medium bg-pink-100 text-pink-800 px-2.5 py-1 rounded-full">Gender: {selectedPatient.gender}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setShowPrescriptionsModal(false);
                setError('');
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2 flex items-center">
              <FiFileText className="mr-2 text-primary" /> Prescriptions History
            </h4>
            {patientPrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No prescriptions found</h3>
                <p className="mt-2 text-sm text-gray-500">This patient doesn't have any prescriptions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientPrescriptions.map(prescription => (
                  <div key={prescription._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            Prescribed by: <span className="font-medium">{prescription.doctorId?.name || 'Unknown'}</span>
                          </span>
                        </div>
                        
                        {prescription.diagnosis && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-600 mb-1">Diagnosis</h5>
                            <p className="text-gray-800">{prescription.diagnosis}</p>
                          </div>
                        )}
                        
                        {prescription.medications && prescription.medications.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-600 mb-2">Medications</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {prescription.medications.map((med, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">{med.name}</span>
                                    <span className="text-sm text-gray-600">{med.dosage}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">Frequency: {med.frequency}</div>
                                  {med.instructions && (
                                    <div className="text-xs text-gray-500 mt-1">Instructions: {med.instructions}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                        <button
                          id={`download-btn-${prescription._id}`}
                          onClick={() => handleDownloadPrescription(prescription._id, selectedPatient.name)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!prescription.filePath}
                        >
                          <FiDownload className="mr-2" /> 
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-gray-600"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:relative z-30 lg:z-auto lg:flex lg:flex-shrink-0 w-72 h-full"
          >
            <div className="flex flex-col w-full h-full bg-gradient-to-b from-indigo-700 to-indigo-600 text-white shadow-xl">
  <div className="flex flex-col items-center justify-center h-24 px-4 border-b border-indigo-500">
    <h1 className="text-2xl font-bold text-white">DeccanCare</h1>
    <p className="text-xs text-indigo-100 mt-1">Laboratory Management System</p>
  </div>
              <div className="flex flex-col flex-grow p-4 overflow-y-auto">
                <nav className="space-y-1">
                  <button 
                    onClick={() => {
                      setActiveTab('pending');
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-700 shadow-lg' : 'text-indigo-100 hover:bg-indigo-700'}`}
                  >
                    <FiClock className="mr-3 text-lg" /> 
                    <span className="font-medium">Pending Tests</span>
                    {activeTab === 'pending' && (
                      <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {pendingTests.length}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('completed');
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'completed' ? 'bg-white text-indigo-700 shadow-lg' : 'text-indigo-100 hover:bg-indigo-700'}`}
                  >
                    <FiCheck className="mr-3 text-lg" /> 
                    <span className="font-medium">Completed Tests</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('patients');
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'patients' ? 'bg-white text-indigo-700 shadow-lg' : 'text-indigo-100 hover:bg-indigo-700'}`}
                  >
                    <FiUsers className="mr-3 text-lg" /> 
                    <span className="font-medium">All Patients</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('search');
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'search' ? 'bg-white text-indigo-700 shadow-lg' : 'text-indigo-100 hover:bg-indigo-700'}`}
                  >
                    <FiSearch className="mr-3 text-lg" /> 
                    <span className="font-medium">Search Patients</span>
                  </button>
                </nav>
                
                <div className="mt-auto pt-4 border-t border-indigo-600">
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-4 py-3 text-indigo-100 hover:bg-indigo-700 rounded-xl transition-all"
                  >
                    <FiLogOut className="mr-3 text-lg" /> 
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Lab Technician Dashboard</h2>
              <p className="text-sm text-gray-500">Manage laboratory tests and patient reports</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                <FiCalendar className="text-gray-500" />
                <span className="text-gray-600 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md cursor-pointer">
                    <span className="font-semibold">LT</span>
                  </div>
                  <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Patients Served Today */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patients Served Today</p>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{patientsServedToday}</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                  <FiUsers className="text-2xl" />
                </div>
              </div>
            </motion.div>
            
            {/* Pending Tests */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Tests</p>
                  <p className="mt-2 text-3xl font-bold text-amber-600">{pendingTests.length}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                  <FiClock className="text-2xl" />
                </div>
              </div>
            </motion.div>
            
            {/* Completed Tests */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed Tests</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-600">{completedTests.length}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                  <FiCheck className="text-2xl" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FiUsers className="mr-2 text-indigo-600" /> All Patients
                  </h3>
                  <div className="mt-4 md:mt-0 relative">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full md:w-64 px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {loading.patients ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-6 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              ) : (patients.length === 0 && !searchTerm) ? (
                <div className="text-center py-12">
                  <FiUsers className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No patients found</h3>
                  <p className="mt-2 text-sm text-gray-500">No patients are currently registered in the system.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(searchTerm ? searchResults : patients).map(patient => (
                        <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                                {patient.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-500">{patient.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{patient.customId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{patient.age || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : patient.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}>
                              {patient.gender || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewPatientDetails(patient)}
                              className="text-indigo-600 hover:text-indigo-800 mr-4"
                            >
                              <FiEye className="inline mr-1" /> View
                            </button>
                            <label className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                              <FiUpload className="inline mr-1" /> Upload
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={e => handleReportUpload(patient._id, e.target.files[0])}
                                disabled={uploading}
                              />
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Pending Tests Tab */}
          {activeTab === 'pending' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiClock className="mr-2 text-indigo-600" /> Pending Lab Tests
                </h3>
              </div>
              {pendingTests.length === 0 ? (
                <div className="text-center py-12">
                  <FiCheck className="mx-auto h-16 w-16 text-green-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No pending tests</h3>
                  <p className="mt-2 text-sm text-gray-500">All lab tests have been processed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingTests.map(test => (
                        <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                                {test.patientId?.name?.charAt(0) || 'P'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{test.patientId?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{test.patientId?.customId || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{test.testType || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(test.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleUpdateTest(test)}
                              className="text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-lg hover:shadow-md transition-all"
                            >
                              Update Result
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Completed Tests Tab */}
          {activeTab === 'completed' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiCheck className="mr-2 text-indigo-600" /> Completed Lab Tests
                </h3>
              </div>
              {completedTests.length === 0 ? (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No completed tests</h3>
                  <p className="mt-2 text-sm text-gray-500">Completed test reports will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedTests.map(test => (
                        <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                                {test.patientId?.name?.charAt(0) || 'P'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{test.patientId?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{test.patientId?.customId || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{test.testType || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2">{test.result || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {test.completedAt ? new Date(test.completedAt).toLocaleTimeString() : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiSearch className="mr-2 text-indigo-600" /> Search Patients
                </h3>
                <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search patient by name, ID, or contact..."
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      disabled={loading.search}
                    />
                    <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    onClick={handleSearch}
                    disabled={loading.search || !searchTerm.trim()}
                  >
                    {loading.search ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div className="p-6">
                {loading.search ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                ) : searchTerm && searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <FiSearch className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No results found</h3>
                    <p className="mt-2 text-sm text-gray-500">Try different search terms</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {searchResults.map(patient => (
                      <motion.div 
                        key={patient._id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                              {patient.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">ID: {patient.customId}</span>
                                {patient.age && <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Age: {patient.age}</span>}
                                {patient.gender && <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Gender: {patient.gender}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                              onClick={() => handleViewPatientDetails(patient)}
                            >
                              <FiEye className="mr-2" /> View Details
                            </button>
                            <label className="flex items-center justify-center px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                              <FiUpload className="mr-2" /> Upload Report
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={e => handleReportUpload(patient._id, e.target.files[0])}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiBarChart2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Search for patients</h3>
                    <p className="mt-2 text-sm text-gray-500">Enter patient name, ID, or contact information to search</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Update Test Result Modal */}
          <AnimatePresence>
            {showUpdateModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4"
              >
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-gray-800">Update Test Result</h4>
                    <button
                      onClick={() => setShowUpdateModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="font-medium">{selectedTest?.patientId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Test: {selectedTest?.testType || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Result *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={updateResult}
                        onChange={e => setUpdateResult(e.target.value)}
                        placeholder="Enter test results..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={updateNotes}
                        onChange={e => setUpdateNotes(e.target.value)}
                        placeholder="Additional notes about the test..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() => setShowUpdateModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                        onClick={handleUpdateSubmit}
                        disabled={!updateResult.trim() || loading.tests}
                      >
                        {loading.tests ? 'Updating...' : 'Update Result'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {renderPrescriptionsModal()}
        </main>
      </div>
    </div>
  );
};

export default LabTechnicianDashboard;