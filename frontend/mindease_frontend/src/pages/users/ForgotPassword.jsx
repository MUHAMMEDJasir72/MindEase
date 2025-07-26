import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { changeForgotPassword, verifyEmail } from '../../api/user';
import { validateForm } from '../../utils/validateForm';
import { verifyOtp } from '../../api/auth';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [isLoading, setIsLoading] = useState(false);
    const [canResendOtp, setCanResendOtp] = useState(true);
    const [resendTimer, setResendTimer] = useState(0);

    // Timer effect for resend OTP
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        } else if (resendTimer === 0 && !canResendOtp) {
            setCanResendOtp(true);
        }
        return () => clearInterval(interval);
    }, [resendTimer, canResendOtp]);

    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        if (!email) {
            showToast("Please enter your email", "error");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await verifyEmail(email);
            if (response.success) {
                showToast("OTP sent to your email", "success");
                setStep(2);
                // Start the cooldown timer (5 minutes = 300 seconds)
                setResendTimer(300);
                setCanResendOtp(false);
            } else {
                showToast(response.message || "Email verification failed", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResendOtp) return;
        
        setIsLoading(true);
        try {
            const response = await verifyEmail(email);
            if (response.success) {
                showToast("New OTP sent to your email", "success");
                // Reset the cooldown timer
                setResendTimer(300);
                setCanResendOtp(false);
            } else {
                showToast(response.message || "Failed to resend OTP", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (event) => {
        event.preventDefault();
        if (!otp.trim()) {
            showToast("Please enter the OTP", "error");
            return;
        }
    
        setIsLoading(true);
        try {
            const response = await verifyOtp(otp.trim(), email.trim(),);
            if (response.success) {
                showToast("OTP verified successfully", "success");
                setStep(3);
            } else {
                showToast(response.message || "Invalid OTP", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
    
        // Validate fields
        if (!password || !confirmPassword) {
            showToast("Please fill in all fields", "error");
            return;
        }
    
        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }
    
        if (!validateForm({ password })) {
            showToast("Password must be at least 8 characters with letters and numbers", "error");
            return;
        }
    
        setIsLoading(true);
    
        try {
            const response = await changeForgotPassword(email, password);
            
            if (response.success) {
                showToast('Password changed successfully', "success");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                showToast(response.message || 'Password change failed', "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Format time to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <h1 className="text-2xl font-bold text-center">Password Recovery</h1>
                    <p className="text-center text-indigo-100 mt-1">
                        {step === 1 && "Enter your registered email"}
                        {step === 2 && "Enter OTP sent to your email"}
                        {step === 3 && "Set your new password"}
                    </p>
                </div>
                
                <div className="p-6">
                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending OTP...
                                    </span>
                                ) : 'Send OTP'}
                            </button>
                            
                            <div className="mt-4 text-center">
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                    Remember your password? Sign in
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleOTPSubmit}>
                            <div className="mb-4">
                                <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-2">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center text-xl tracking-widest"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    We've sent a 6-digit code to {email}
                                </p>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : 'Verify OTP'}
                            </button>
                            
                            <div className="mt-4 text-center flex flex-col items-center">
                                <button 
                                    onClick={() => {
                                        setOtp('');
                                        setStep(1);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2"
                                >
                                    Use a different email
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={!canResendOtp || isLoading}
                                    className={`text-indigo-600 hover:text-indigo-800 text-sm font-medium ${!canResendOtp ? 'text-gray-500 cursor-not-allowed' : ''}`}
                                >
                                    {canResendOtp ? 'Resend OTP' : `Resend OTP in ${formatTime(resendTimer)}`}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Must be at least 8 characters with letters and numbers
                                </p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}

export default ForgotPassword;