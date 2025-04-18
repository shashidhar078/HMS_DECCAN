import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserShield, FaSignInAlt, FaUserPlus, FaEnvelope, FaPhone, FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AuthReceptionist = ({ role = 'Receptionist' }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [emailForReset, setEmailForReset] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        contactNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Derived password validation state (no need for separate state)
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
            if (showForgotPassword && resetToken) {
                if (!passwordValidation.isValid) {
                    throw new Error('Password does not meet requirements');
                }
                
                await axios.post(
                    `http://localhost:5000/api/staff/receptionist/reset-password/${resetToken}`, 
                    { newPassword: formData.password },
                    { withCredentials: true }
                );
                setSuccess('Password reset successfully!');
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setResetToken('');
                }, 2000);
            } else if (isLogin) {
                const res = await axios.post(
                    'http://localhost:5000/api/staff/login-receptionist', 
                    {
                        email: formData.email.trim().toLowerCase(),
                        password: formData.password,
                        role: "Receptionist"
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
                localStorage.setItem('userData', JSON.stringify(res.data.user));
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => navigate('/receptionist/dashboard'), 1500);
            } else {
                if (!passwordValidation.isValid) {
                    throw new Error('Password does not meet requirements');
                }

                const res = await axios.post(
                    'http://localhost:5000/api/staff/register-receptionist',
                    {
                        ...formData,
                        role: "Receptionist"
                    },
                    { withCredentials: true }
                );

                if (!res.data.success) {
                    throw new Error(res.data.message || 'Registration failed');
                }

                setSuccess('Registration successful! Redirecting...');
                setTimeout(() => navigate('/awaiting-approval'), 1500);
            }
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
    }, [formData, isLogin, navigate, resetToken, showForgotPassword, passwordValidation.isValid]);

    const handleForgotPassword = useCallback(async () => {
        if (!emailForReset) {
            setError('Please enter your email');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await axios.post(
                'http://localhost:5000/api/staff/receptionist/forgot-password',
                { email: emailForReset },
                { withCredentials: true }
            );
            
            if (!res.data.success) {
                throw new Error(res.data.message || 'Failed to send reset link');
            }
            
            setSuccess('Password reset link sent to your email');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    }, [emailForReset]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            setResetToken(token);
            setShowForgotPassword(true);
        }
    }, []);

    const PasswordValidationChecklist = useMemo(() => () => (
        <div className="mt-4 space-y-2 text-sm">
            <div className={`flex items-center ${passwordValidation.length ? 'text-emerald-500' : 'text-rose-500'}`}>
                {passwordValidation.length ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center ${passwordValidation.upperCase ? 'text-emerald-500' : 'text-rose-500'}`}>
                {passwordValidation.upperCase ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                <span>At least one uppercase letter</span>
            </div>
            <div className={`flex items-center ${passwordValidation.lowerCase ? 'text-emerald-500' : 'text-rose-500'}`}>
                {passwordValidation.lowerCase ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                <span>At least one lowercase letter</span>
            </div>
            <div className={`flex items-center ${passwordValidation.number ? 'text-emerald-500' : 'text-rose-500'}`}>
                {passwordValidation.number ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                <span>At least one number</span>
            </div>
            <div className={`flex items-center ${passwordValidation.specialChar ? 'text-emerald-500' : 'text-rose-500'}`}>
                {passwordValidation.specialChar ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
                <span>At least one special character</span>
            </div>
        </div>
    ), [passwordValidation]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (showForgotPassword) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6"
            >
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <h2 className="text-2xl font-bold">Reset Password</h2>
                        <p className="text-indigo-100">Enter your details to reset password</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg border-l-4 border-rose-500">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg border-l-4 border-emerald-500">
                                {success}
                            </div>
                        )}

                        {!resetToken ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={emailForReset}
                                            onChange={(e) => setEmailForReset(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleForgotPassword}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null}
                                    Send Reset Link
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <PasswordValidationChecklist />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !passwordValidation.isValid}
                                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 ${(loading || !passwordValidation.isValid) ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'}`}
                                >
                                    Reset Password
                                </button>
                            </form>
                        )}

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetToken('');
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    const title = isLogin ? `${role} Login` : `Register ${role}`;
    const subtitle = isLogin ? 'Sign in to manage patients and appointments' : 'Register as a receptionist';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6"
        >
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-indigo-100">{subtitle}</p>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg border-l-4 border-rose-500">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg border-l-4 border-emerald-500">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUserShield className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="John Doe"
                                            required
                                            minLength="3"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Contact Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="+1 (555) 123-4567"
                                            required
                                            pattern="[0-9]{10,15}"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Password
                                {!isLogin && formData.password && (
                                    <span className="ml-2 text-sm font-normal">
                                        {passwordValidation.isValid ? (
                                            <span className="text-emerald-500">✓ Strong</span>
                                        ) : (
                                            <span className="text-rose-500">✗ Weak</span>
                                        )}
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {!isLogin && formData.password && <PasswordValidationChecklist />}
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(true);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (!isLogin && !passwordValidation.isValid)}
                            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${(loading || (!isLogin && !passwordValidation.isValid)) ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'}`}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccess('');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                        >
                            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AuthReceptionist;