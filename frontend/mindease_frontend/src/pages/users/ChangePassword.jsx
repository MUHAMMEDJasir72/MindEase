import React, { useState } from 'react';
import { showToast } from '../../utils/toast';
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { verifyPassword, changePassword } from '../../api/user';
import { logoutUser } from '../../api/auth';
import { motion } from 'framer-motion';
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const PasswordUpdateForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isFocused, setIsFocused] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const verifyCurrentPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await verifyPassword(formData.currentPassword);
            if (response.success) {
                setIsAuthenticated(true);
            } else {
                showToast("The password you entered is incorrect", "error");
            }
        } catch (error) {
            showToast("Authentication failed. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await changePassword(formData.newPassword, formData.confirmPassword);
            if (response.success) {
                showToast('Your password has been updated successfully', "success");
                const res = await logoutUser();
                if (res.success) {
                    navigate('/login');
                } else {
                    showToast(res.message || "Logout failed. Please log out manually.", "error");
                }
            } else {
                showToast(response.message, "error");
            }
        } catch (error) {
            showToast("Password update failed. Please try again.", "error");
        } finally {
            setIsLoading(false);
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
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            {isAuthenticated ? "Create New Password" : "Verify Identity"}
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm sm:text-base">
                            {isAuthenticated
                                ? "Enter and confirm your new password"
                                : "Please enter your current password to continue"}
                        </p>
                    </div>

                    {!isAuthenticated ? (
                        <form onSubmit={verifyCurrentPassword} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <div className={`relative transition-all duration-200 ${isFocused.currentPassword ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setIsFocused(prev => ({ ...prev, currentPassword: true }))}
                                        onBlur={() => setIsFocused(prev => ({ ...prev, currentPassword: false }))}
                                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                                        placeholder="Enter your current password"
                                        required
                                    />
                                    <span
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors duration-150 cursor-pointer text-lg"
                                    >
                                        {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 sm:py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md'}`}
                            >
                                {isLoading ? "Verifying..." : "Continue"}
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={updatePassword} className="space-y-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className={`relative transition-all duration-200 ${isFocused.newPassword ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setIsFocused(prev => ({ ...prev, newPassword: true }))}
                                        onBlur={() => setIsFocused(prev => ({ ...prev, newPassword: false }))}
                                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className={`relative transition-all duration-200 ${isFocused.confirmPassword ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        onFocus={() => setIsFocused(prev => ({ ...prev, confirmPassword: true }))}
                                        onBlur={() => setIsFocused(prev => ({ ...prev, confirmPassword: false }))}
                                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                                        placeholder="Confirm new password"
                                        
                                    />
                                    <span
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors duration-150 cursor-pointer text-lg"
                                    >
                                        {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 sm:py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md'}`}
                            >
                                {isLoading ? "Updating..." : "Update Password"}
                            </motion.button>
                        </form>
                    )}
                </div>
            </motion.div>

            <ToastContainer
                position="top-center"
                autoClose={3000}
                toastStyle={{ borderRadius: '10px' }}
            />
        </div>
    );
};

export default PasswordUpdateForm;
