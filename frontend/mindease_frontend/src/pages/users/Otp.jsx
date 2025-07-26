import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../utils/toast';
import { ToastContainer } from "react-toastify";
import { verifyOtp, resendOtp } from '../../api/auth';
import { Link, useNavigate } from "react-router-dom";

function Otp() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    
        return () => clearInterval(interval);
    }, []);
    

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!otp || otp.length < 6) {
            showToast("Please enter a valid 6-digit OTP", "error");
            return;
        }

        setIsLoading(true);
        const email = localStorage.getItem("email");
        
        try {
            const response = await verifyOtp(otp, email);
            if (response.success) {
                showToast(response.message, "success");
                setTimeout(() => navigate('/login'), 1000);
            } else {
                showToast(response.message, "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
            console.error("OTP verification error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        
        setIsResending(true);
        const email = localStorage.getItem("email");
        
        try {
            const response = await resendOtp(email);
            if (response.success) {
                showToast("New OTP sent to your email", "success");
                setTimer(300);
                setCanResend(false);
            } else {
                showToast(response.message, "error");
            }
        } catch (error) {
            showToast("Failed to resend OTP. Please try again.", "error");
            console.error("OTP resend error:", error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="hidden md:block fixed inset-0 overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600"></div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden z-10"
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                
                <div className="px-6 py-8 sm:px-10 sm:py-12">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">OTP Verification</h2>
                        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Enter the 6-digit code sent to your email</p>
                    </div>
                    
                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                                pattern="\d{6}"
                                inputMode="numeric"
                                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-lg sm:text-xl tracking-widest"
                                placeholder="••••••"
                                required
                            />
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 sm:py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md'}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Verify OTP'}
                        </motion.button>
                    </form>

                    <div className="mt-4 sm:mt-6 text-center">
                        {canResend ? (
                            <button
                                onClick={handleResendOtp}
                                disabled={isResending}
                                className="text-teal-600 hover:text-teal-500 font-medium focus:outline-none text-sm sm:text-base"
                            >
                                {isResending ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-3 sm:h-4 w-3 sm:w-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : 'Resend OTP'}
                            </button>
                        ) : (
                            <p className="text-gray-600 text-xs sm:text-sm">
                                Resend OTP in <span className="font-medium">{formatTime(timer)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
            
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastStyle={{ borderRadius: '10px' }}
            />
        </div>
    );
}

export default Otp;