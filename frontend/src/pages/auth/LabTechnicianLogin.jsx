import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaSignInAlt, FaEnvelope, FaLock, FaHome, FaFlask } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const LabTechnicianLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post(
        '/api/lab/login',
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "LabTechnician"
        },
        {
          withCredentials: true,
          validateStatus: (status) => status < 500
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || 'Login failed');
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/auth/lab-technician-dashboard'), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        'Authentication failed';
      setError(errorMessage);
      console.error("Auth Error:", {
        error: err.response?.data || err.message,
        config: err.config
      });
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
      style={{
        backgroundImage: 'radial-gradient(at 40% 20%, hsla(252,100%,70%,0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(252,100%,70%,0.2) 0px, transparent 50%)'
      }}
    >
      {/* Luxury Glass Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden relative z-10 border border-white/20">
        {/* Premium Metallic Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center overflow-hidden">
          {/* Subtle metallic texture */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
          
          {/* Animated floating elements */}
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <div className="absolute top-20 left-20 w-8 h-8 rounded-full bg-white/10"></div>
            <div className="absolute bottom-10 right-16 w-12 h-12 rounded-full bg-white/10"></div>
          </motion.div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <FaFlask className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight font-serif">Lab Technician Portal</h1>
            <p className="text-indigo-100/90 font-light tracking-wide">
              Secure access to diagnostic systems
            </p>
          </div>
        </div>
        
        {/* Luxury Form Container */}
        <div className="p-8">
          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-lg flex items-start backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-lg flex items-start backdrop-blur-sm"
            >
              <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 transition-all duration-200"
                  placeholder="professional@lab.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-300 ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Access Laboratory
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/auth/lab-technician-register')}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors inline-flex items-center"
            >
              <span className="border-b border-dashed border-indigo-300 hover:border-indigo-500">
                Request laboratory access
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors inline-flex items-center mx-auto"
            >
              <FaHome className="mr-2" />
              Return to main site
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LabTechnicianLogin;