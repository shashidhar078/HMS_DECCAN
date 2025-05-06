import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUserPlus, FaEnvelope, FaPhone, FaLock, FaUserMd, FaGraduationCap, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const LabTechnicianRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    contactNumber: '',
    specialization: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const passwordValidation = useMemo(() => {
    const { password } = formData;
    return {
      length: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValid: password.length >= 8 && 
              /[A-Z]/.test(password) && 
              /[a-z]/.test(password) && 
              /[0-9]/.test(password) && 
              /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }, [formData.password]);

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
      if (!passwordValidation.isValid) {
        throw new Error('Password does not meet requirements');
      }

      const res = await axios.post(
        '/api/lab/register',
        {
          ...formData,
          role: "LabTechnician"
        },
        { withCredentials: true }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Please wait for admin approval.');
      setTimeout(() => navigate('/awaiting-approval'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        'Registration failed';
      setError(errorMessage);
      console.error("Registration Error:", {
        error: err.response?.data || err.message,
        config: err.config
      });
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, passwordValidation.isValid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Luxury card container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border border-gray-200/70">
        {/* Premium header with subtle texture */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
          <FaUserShield className="mx-auto text-4xl text-white mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Lab Technician Registration</h1>
          <p className="text-blue-100 font-light">
            Join our professional lab team
          </p>
        </div>
        
        {/* Form content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Create a password"
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <ul className="list-disc list-inside">
                  <li className={passwordValidation.length ? 'text-green-600' : 'text-red-600'}>
                    At least 8 characters
                  </li>
                  <li className={passwordValidation.upperCase ? 'text-green-600' : 'text-red-600'}>
                    One uppercase letter
                  </li>
                  <li className={passwordValidation.lowerCase ? 'text-green-600' : 'text-red-600'}>
                    One lowercase letter
                  </li>
                  <li className={passwordValidation.number ? 'text-green-600' : 'text-red-600'}>
                    One number
                  </li>
                  <li className={passwordValidation.specialChar ? 'text-green-600' : 'text-red-600'}>
                    One special character
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserMd className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your contact number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserMd className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your specialization"
                />
              </div>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter years of experience"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !passwordValidation.isValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !passwordValidation.isValid
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Register
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-4">
            <button
              onClick={() => navigate('/auth/lab-technician-login')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors block w-full"
            >
              Already have an account? Login here
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-gray-700 transition-colors duration-200"
              onClick={() => navigate("/")}
            >
              <FaHome className="mr-2" /> Home
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LabTechnicianRegister; 