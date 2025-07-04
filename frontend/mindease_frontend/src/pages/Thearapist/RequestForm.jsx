import React, { useState, useEffect } from 'react';
import { registerTherapist } from '../../api/therapist';
import { showToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SeparatorHorizontal } from "lucide-react";
import { getSpecializations } from '../../api/admin';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    state: '',
    country: '',
    address: '',
    professionalTitle: '',
    specializations: [],
    yearsOfExperience: '',
    languages: [],
    professionalLicenseNumber: '',
    licenseIssuingAuthority: '',
    licenseExpiryDate: '',
    degree: '',
    university: '',
    yearOfGraduation: '',
    additionalCertifications: '',
    governmentIssuedID: null,
    professionalLicense: null,
    educationalCertificate: null,
    additionalCertificationDocument: null,
    profile_image: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [specializationOptions, setSpecializationOptions] = useState([]);

  useEffect(() => {
      fetchSpecializations();
    }, []);
  
    const fetchSpecializations = async () => {
      try {
        const info = await getSpecializations();
        if (info.success) {
          setSpecializationOptions(info.data.map(item => item.specialization));
        } else {
          console.error('Failed to fetch:', info.error);
        }
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    };

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Mandarin',
    'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Japanese',
    'Italian', 'Korean', 'Dutch', 'Swedish', 'Other'
  ];

 

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (field, value, checked) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, [field]: [...prev[field], value] };
      } else {
        return { ...prev, [field]: prev[field].filter(item => item !== value) };
      }
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.address) newErrors.address = 'Address is required';
    }
    
    if (step === 2) {
      if (!formData.professionalTitle) newErrors.professionalTitle = 'Professional title is required';
      if (formData.specializations.length === 0) newErrors.specializations = 'At least one specialization is required';
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
      if (formData.languages.length === 0) newErrors.languages = 'At least one language is required';
      if (!formData.professionalLicenseNumber) newErrors.professionalLicenseNumber = 'License number is required';
      if (!formData.licenseIssuingAuthority) newErrors.licenseIssuingAuthority = 'Issuing authority is required';
      if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'Expiry date is required';
    }
    
    if (step === 3) {
      if (!formData.degree) newErrors.degree = 'Degree is required';
      if (!formData.university) newErrors.university = 'University is required';
      if (!formData.yearOfGraduation) newErrors.yearOfGraduation = 'Year of graduation is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await registerTherapist(formData);
      if (response.success) {
        showToast('Application submitted successfully!', 'success');
        navigate('/submited'); 
      } else {
        showToast(response.error || 'Submission failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMultiSelect = (field, options, label, description) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}*</label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>
      {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {options.map(option => (
          <div key={option} className="flex items-center">
            <input
              type="checkbox"
              id={`${field}-${option}`}
              value={option}
              checked={formData[field].includes(option)}
              onChange={(e) => handleMultiSelectChange(field, option, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`${field}-${option}`} className="ml-2 block text-sm text-gray-700">
              {option}
            </label>
          </div>
        ))} 
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Personal Information" },
    { number: 2, title: "Professional Information" },
    { number: 3, title: "Educational Background" },
    { number: 4, title: "Supporting Documents" }
  ];

  return (
    <div className="max-w-5xl mx-auto my-8 md:my-16 bg-white shadow-md rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Form Section */}
        <div className="md:w-2/3 w-full bg-gray-50 p-6 md:p-8">
          {currentStep > 1 && (
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              {steps[currentStep - 1].title}
            </h2>
            <div className="flex justify-center mt-2 mb-6">
              <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {currentStep === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    id="fullname"
                    type="text"
                    name="fullname"
                    className={`p-3 w-full rounded-lg border ${errors.fullname ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.fullname}
                    onChange={handleChange}
                  />
                  {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    className={`p-3 w-full rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                  <select
                    id="gender"
                    name="gender"
                    className={`p-3 w-full rounded-lg border ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number*</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+1 (123) 456-7890"
                    className={`p-3 w-full rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State/Province*</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    className={`p-3 w-full rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.state}
                    onChange={handleChange}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    className={`p-3 w-full rounded-lg border ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.country}
                    onChange={handleChange}
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address*</label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className={`p-3 w-full rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'} resize-none`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-4"
              >
                Continue to Professional Information
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700 mb-1">Professional Title*</label>
                  <input 
                    id="professionalTitle"
                    name="professionalTitle" 
                    className={`p-3 w-full rounded-lg border ${errors.professionalTitle ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.professionalTitle} 
                    onChange={handleChange} 
                  />
                  {errors.professionalTitle && <p className="text-red-500 text-sm mt-1">{errors.professionalTitle}</p>}
                </div>
                
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience*</label>
                  <input 
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    name="yearsOfExperience" 
                    className={`p-3 w-full rounded-lg border ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.yearsOfExperience} 
                    onChange={handleChange} 
                  />
                  {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
                </div>
              </div>
              
              {renderMultiSelect(
                'specializations',
                specializationOptions,
                'Specializations',
                'Select all areas you specialize in'
              )}
              
              {renderMultiSelect(
                'languages',
                languageOptions,
                'Languages Spoken',
                'Select all languages you\'re proficient in'
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="professionalLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">Professional License Number*</label>
                  <input 
                    id="professionalLicenseNumber"
                    name="professionalLicenseNumber" 
                    className={`p-3 w-full rounded-lg border ${errors.professionalLicenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.professionalLicenseNumber} 
                    onChange={handleChange} 
                  />
                  {errors.professionalLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.professionalLicenseNumber}</p>}
                </div>
                
                <div>
                  <label htmlFor="licenseIssuingAuthority" className="block text-sm font-medium text-gray-700 mb-1">License Issuing Authority*</label>
                  <input 
                    id="licenseIssuingAuthority"
                    name="licenseIssuingAuthority" 
                    className={`p-3 w-full rounded-lg border ${errors.licenseIssuingAuthority ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.licenseIssuingAuthority} 
                    onChange={handleChange} 
                  />
                  {errors.licenseIssuingAuthority && <p className="text-red-500 text-sm mt-1">{errors.licenseIssuingAuthority}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date*</label>
                <input 
                  id="licenseExpiryDate"
                  type="date" 
                  name="licenseExpiryDate" 
                  className={`p-3 w-full rounded-lg border ${errors.licenseExpiryDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.licenseExpiryDate} 
                  onChange={handleChange} 
                />
                {errors.licenseExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiryDate}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-4"
              >
                Continue to Educational Background
              </button>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Degree/Certification*</label>
                  <input 
                    id="degree"
                    name="degree" 
                    placeholder="e.g., PhD in Psychology"
                    className={`p-3 w-full rounded-lg border ${errors.degree ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.degree} 
                    onChange={handleChange} 
                  />
                  {errors.degree && <p className="text-red-500 text-sm mt-1">{errors.degree}</p>}
                </div>
                
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">University/Institution*</label>
                  <input 
                    id="university"
                    name="university" 
                    placeholder="e.g., Harvard University"
                    className={`p-3 w-full rounded-lg border ${errors.university ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.university} 
                    onChange={handleChange} 
                  />
                  {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="yearOfGraduation" className="block text-sm font-medium text-gray-700 mb-1">Year of Graduation*</label>
                <input 
                  id="yearOfGraduation"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  name="yearOfGraduation" 
                  className={`p-3 w-full rounded-lg border ${errors.yearOfGraduation ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.yearOfGraduation} 
                  onChange={handleChange} 
                />
                {errors.yearOfGraduation && <p className="text-red-500 text-sm mt-1">{errors.yearOfGraduation}</p>}
              </div>
              
              <div>
                <label htmlFor="additionalCertifications" className="block text-sm font-medium text-gray-700 mb-1">Additional Certifications</label>
                <textarea
                  id="additionalCertifications"
                  name="additionalCertifications" 
                  placeholder="List any additional certifications or training"
                  rows={2}
                  className="p-3 w-full rounded-lg border border-gray-300 resize-none"
                  value={formData.additionalCertifications} 
                  onChange={handleChange} 
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-4"
              >
                Continue to Supporting Documents
              </button>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-1">Profile Photo*</label>
                <p className="text-xs text-gray-500 mb-2">Upload a professional headshot (JPEG/PNG, max 5MB)</p>
                <input 
                  id="profile_image"
                  type="file" 
                  name="profile_image" 
                  accept="image/jpeg, image/png"
                  className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="governmentIssuedID" className="block text-sm font-medium text-gray-700 mb-1">Government Issued ID*</label>
                <p className="text-xs text-gray-500 mb-2">Upload a clear copy of your passport, driver's license, or national ID (PDF/JPEG/PNG, max 5MB)</p>
                <input 
                  id="governmentIssuedID"
                  type="file" 
                  name="governmentIssuedID" 
                  accept=".pdf, image/jpeg, image/png"
                  className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="professionalLicense" className="block text-sm font-medium text-gray-700 mb-1">Professional License*</label>
                <p className="text-xs text-gray-500 mb-2">Upload your current professional license (PDF/JPEG/PNG, max 5MB)</p>
                <input 
                  id="professionalLicense"
                  type="file" 
                  name="professionalLicense" 
                  accept=".pdf, image/jpeg, image/png"
                  className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="educationalCertificate" className="block text-sm font-medium text-gray-700 mb-1">Educational Certificate*</label>
                <p className="text-xs text-gray-500 mb-2">Upload your highest degree certificate (PDF/JPEG/PNG, max 5MB)</p>
                <input 
                  id="educationalCertificate"
                  type="file" 
                  name="educationalCertificate" 
                  accept=".pdf, image/jpeg, image/png"
                  className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="additionalCertificationDocument" className="block text-sm font-medium text-gray-700 mb-1">Additional Certification Documents</label>
                <p className="text-xs text-gray-500 mb-2">Upload any additional certifications (PDF/JPEG/PNG, max 5MB each)</p>
                <input 
                  id="additionalCertificationDocument"
                  type="file" 
                  name="additionalCertificationDocument" 
                  accept=".pdf, image/jpeg, image/png"
                  className="p-3 w-full rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange} 
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-medium mt-6 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>

        {/* Progress Section */}
        <div className="md:w-1/3 w-full bg-gradient-to-b from-blue-50 to-blue-100 p-6 md:p-8">
          <div className="sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Application Progress</h3>
            <div className="space-y-6">
              {steps.map((step) => (
                <div 
                  key={step.number} 
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${currentStep === step.number ? 'bg-white shadow-md' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === step.number ? 'bg-blue-600 text-white' : currentStep > step.number ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
                    {step.number}
                  </div>
                  <h4 className={`font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </h4>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">Need help?</h4>
              <p className="text-sm text-gray-600">
                If you have any questions about the application process, please contact our support team at support@therapyplatform.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;