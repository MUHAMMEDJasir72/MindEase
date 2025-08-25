import React, { useState } from "react";
import { motion } from "framer-motion";
import { showToast } from "../../utils/toast";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import { validateForm } from "../../utils/validateForm";
import GoogleAuth from "../../components/users/GoogleAuth";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    age: "",
    place: "",
    gender: "",
    language: "",
    phone: "",
    password1: "",
    password2: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({});
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      formData.fullName,
      formData.email,
      formData.age,
      formData.place,
      formData.gender,
      formData.language,
      formData.phone,
      formData.password1,
      formData.password2
    );

    setIsLoading(true);

    try {
      const { success, message } = await registerUser(formData);
      if (success) {
        localStorage.setItem("email", formData.email);
        showToast("Please Enter The OTP", "success");
        navigate("/otp");
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-blue-600"></div>

        {/* Content */}
        <div className="px-10 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2 text-sm">Join our community today</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fields */}
            {[
              { id: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name" },
              { id: "email", label: "Email", type: "email", placeholder: "Enter your email" },
              { id: "age", label: "Age", type: "number", placeholder: "Enter your age" },
              { id: "place", label: "Place", type: "text", placeholder: "Enter your place" },
              { id: "language", label: "Language", type: "text", placeholder: "Enter your preferred language" },
              { id: "phone", label: "Phone", type: "tel", placeholder: "Enter your phone number" }
            ].map(({ id, label, type, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  value={formData[id]}
                  onChange={handleChange}
                  onFocus={() => handleFocus(id)}
                  onBlur={() => handleBlur(id)}
                  placeholder={placeholder}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none transition-colors duration-200 ${isFocused[id] ? "ring-2 ring-teal-500" : ""}`}
                />
              </div>
            ))}

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onFocus={() => handleFocus("gender")}
                onBlur={() => handleBlur("gender")}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none transition-colors duration-200 ${isFocused.gender ? "ring-2 ring-teal-500" : ""}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Passwords */}
            {[
              { id: "password1", label: "Password", placeholder: "Create a password", show: showPassword1, setShow: setShowPassword1 },
              { id: "password2", label: "Confirm Password", placeholder: "Confirm your password", show: showPassword2, setShow: setShowPassword2 }
            ].map(({ id, label, placeholder, show, setShow }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className={`relative ${isFocused[id] ? "ring-2 ring-teal-500" : ""} rounded-lg`}>
                  <input
                    id={id}
                    name={id}
                    type={show ? "text" : "password"}
                    value={formData[id]}
                    onChange={handleChange}
                    onFocus={() => handleFocus(id)}
                    onBlur={() => handleBlur(id)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-colors duration-200"
                  />
                  <span
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 cursor-pointer text-lg"
                  >
                    {show ? <MdVisibility /> : <MdVisibilityOff />}
                  </span>
                </div>
              </div>
            ))}

            {/* Submit button spans full width */}
            <div className="col-span-1 md:col-span-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-lg"}`}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </motion.button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 text-sm text-gray-500">Or continue with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>

          {/* Google Auth */}
          <GoogleAuth mode="register" current_role="user" />

          {/* Footer */}
          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        toastStyle={{ borderRadius: "10px" }}
      />
    </div>
  );
}

export default Register;
