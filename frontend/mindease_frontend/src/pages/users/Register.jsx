import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "../../utils/toast";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import { validateForm } from "../../utils/validateForm";
import GoogleAuth from "../../components/users/GoogleAuth";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    email: false,
    password1: false,
    password2: false
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

    const errorMessage = validateForm(
      formData.username,
      formData.email,
      formData.password1,
      formData.password2
    );
    
    if (errorMessage) {
      showToast(errorMessage, "error");
      return;
    }

    setIsLoading(true);

    try {
      const { success, message } = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password1
      });

      if (success) {
        localStorage.setItem("email", formData.email);
        showToast("Registration successful!", "success");
        navigate('/otp');
      } else {
        showToast(message, "error");
      }
    } catch (error) {
      showToast("An error occurred. Please try again.", "error");
      console.error("Registration error:", error);
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
        
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Join us today</p>
          </div>
          
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
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
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className={`relative transition-all duration-200 ${isFocused.email ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className={`relative transition-all duration-200 ${isFocused.password1 ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                <input
                  id="password1"
                  name="password1"
                  type="password"
                  value={formData.password1}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password1')}
                  onBlur={() => handleBlur('password1')}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className={`relative transition-all duration-200 ${isFocused.password2 ? 'ring-2 ring-teal-500' : ''} rounded-lg`}>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password2')}
                  onBlur={() => handleBlur('password2')}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
             <GoogleAuth mode="register"/>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                Sign in
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

export default Register;