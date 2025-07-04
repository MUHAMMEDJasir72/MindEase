import React, { useState } from 'react';
import { showToast } from '../../utils/toast';
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { verifyPassword, changePassword } from '../../api/user';
import { logoutUser } from '../../api/auth';

const PasswordUpdateForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const verifyCurrentPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await verifyPassword(formData.currentPassword);
            if (response.success) {
                setIsAuthenticated(true);
            } else {
                showToast("The password you entered is incorrect", "error");
            }
        } catch (error) {
            showToast("Authentication failed. Please try again.", "error");
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await changePassword(formData.newPassword);
            if (response.success) {
                showToast('Your password has been updated successfully', "success");
                const res = await logoutUser();
                if (res.success) {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    navigate('/login');
                } else {
                    showToast(res.message || "Logout failed. Please log out manually.", "error");
                }
            } else {
                showToast('Password requirements not met', "error");
            }
        } catch (error) {
            showToast("Password update failed. Please try again.", "error");
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-600 via-emerald-700 to-cyan-700 p-4">
            <div className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isAuthenticated ? "Create New Password" : "Verify Identity"}
                        </h1>
                        <p className="text-white/80 text-sm">
                            {isAuthenticated 
                                ? "Enter and confirm your new password" 
                                : "Please enter your current password to continue"}
                        </p>
                    </div>

                    {isAuthenticated ? (
                        <form onSubmit={updatePassword} className="space-y-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-white/80 mb-1">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter your new password"
                                    className="w-full px-4 py-3 bg-white/30 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
                            >
                                Update Password
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyCurrentPassword} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-white/80 mb-1">
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter your current password"
                                    className="w-full px-4 py-3 bg-white/30 text-white placeholder-white/60 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
                            >
                                Continue
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                theme="colored"
                toastStyle={{ backgroundColor: '#0369a1' }}
            />
        </div>
    );
};

export default PasswordUpdateForm;
