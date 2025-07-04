import React, { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import { ToastContainer } from "react-toastify";
import { loginUser } from '../../api/auth';
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import jwt_decode from 'jwt-decode'; 
import GoogleAuth from '../../components/users/GoogleAuth';



function Login() {
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

    // useEffect(() => {
    //     const token = localStorage.getItem("access");
    //     if (token) {
    //         navigate("/"); 
    //     }
    // },[]);

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
        
        if (!formData.username.trim() || !formData.password.trim()) {
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
                localStorage.setItem('loginMethod', 'email');

                const decoded = jwt_decode(response.data.access);
                localStorage.setItem('id',decoded.id)
                localStorage.setItem('current_role', 'user');
                if (decoded.role === 'admin') {
                    navigate('/adminDashboard');
                }else{
                    navigate('/');
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
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600"></div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl overflow-hidden z-10"
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                
                <div className="px-10 py-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Sign in to your account</p>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className={`relative transition-all duration-200 ${isFocused.username ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                                <input 
                                    id="username"
                                    name="username"
                                    type="text" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('username')}
                                    onBlur={() => handleBlur('username')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className={`relative transition-all duration-200 ${isFocused.password ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                                <input 
                                    id="password"
                                    name="password"
                                    type="password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={() => handleBlur('password')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">       
                            <div className="text-sm">
                                <Link to="/forgotPassword" className="font-medium text-teal-600 hover:text-teal-500">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md'}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign in'}
                        </motion.button>
                    </form>

                     <div>
                            <GoogleAuth mode="login"/>
                        </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
                                Sign up
                            </Link>
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            Are you a therapist?{' '}
                            <Link to="/therapistLogin" className="font-medium text-teal-600 hover:text-teal-500">
                                Therapist login
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

export default Login;