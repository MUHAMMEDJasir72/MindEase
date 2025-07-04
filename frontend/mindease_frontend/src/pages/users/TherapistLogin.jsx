import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showToast } from '../../utils/toast';
import { ToastContainer } from "react-toastify";
import { loginUser } from '../../api/auth';
import { Link, useNavigate } from "react-router-dom";
import jwt_decode from 'jwt-decode';
import { checkRequested } from '../../api/therapist';

function TherapistLogin() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState({
        username: false,
        password: false
    });
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFocus = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: false }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!formData.username || !formData.password) {
            showToast("Please fill in all fields", "error");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await loginUser(formData);

            if (response.success && response.data.access && response.data.refresh) {
                showToast("Login successful!", "success");
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                localStorage.setItem('current_role', 'therapist');
                const decoded = jwt_decode(response.data.access);
                localStorage.setItem('id',decoded.id)
                if (decoded.role === 'admin') {
                    navigate('/adminDashboard');
                }else if(decoded.role === 'therapist'){
                    navigate('/therapistHome')
                }
                else{
                    const res = await checkRequested()
                    if (res.success){
                         navigate('/submited');
                    }else{
                        navigate('/therapistDashboard');
                    }
                }
            } else {
                showToast(response.message || "Invalid credentials. Please try again.", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again later.", "error");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="hidden md:block fixed inset-0 overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl overflow-hidden z-10"
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                
                <div className="px-10 py-12">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Therapist Portal</h2>
                        <p className="text-gray-500 mt-2">Sign in to your professional account</p>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className={`relative transition-all duration-200 ${isFocused.username ? 'ring-2 ring-indigo-500' : ''} rounded-lg`}>
                                <input 
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('username')}
                                    onBlur={() => handleBlur('username')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className={`relative transition-all duration-200 ${isFocused.password ? 'ring-2 ring-indigo-500' : ''} rounded-lg`}>
                                <input 
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={() => handleBlur('password')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md'}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link to="/therapistRegister" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Register
                            </Link>
                        </p>
                        <p className="text-gray-600 text-sm">
                            login as client?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Client login
                            </Link>
                        </p>
                        <p className="text-gray-600 text-sm">
                            <Link to="/forgotPassword" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </p>
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

export default TherapistLogin;