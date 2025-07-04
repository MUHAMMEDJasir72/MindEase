import React, { useState } from 'react';

function CompleteForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    language: '',
    gender: '',
    place: '',
    mobileNumber: '',
    struggles: []
  });

  const strugglesOptions = [
    'Anxiety & Stress',
    'Depression & Mood Disorder',
    'Relationship Issues',
    'Trauma & PTSD',
    'Self-Esteem & Confidence',
    'Addiction & Substance Use',
    'Eating Disorders',
    'Sleep Problems',
    'Workplace Issues',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStruggleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      struggles: checked
        ? [...prev.struggles, value]
        : prev.struggles.filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const isFirstStepValid = () => {
    const { fullName, age, language, gender, place, mobileNumber } = formData;
    return fullName && age && language && gender && place && mobileNumber;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Progress */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Tell us about yourself' : 'What brings you here?'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1
                ? 'We need a few details to get started.'
                : 'Select the struggles you’re facing (Confidential)'}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Language</label>
                  <select
                    name="language"
                    required
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Choose</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Gender</label>
                <div className="flex items-center gap-4">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        required
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        className="text-blue-500 focus:ring-blue-400"
                      />
                      <span>{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Location</label>
                <input
                  type="text"
                  name="place"
                  required
                  value={formData.place}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+1 123 456 7890"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {strugglesOptions.map((option, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                    formData.struggles.includes(option)
                      ? 'bg-blue-50 border-blue-400 shadow'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="struggles"
                    value={option}
                    checked={formData.struggles.includes(option)}
                    onChange={handleStruggleChange}
                    className="mt-1 h-4 w-4 text-blue-500 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-800">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-100 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                ← Back
              </button>
            ) : <span />}

            {step < 2 ? (
              <button
                type="button"
                disabled={!isFirstStepValid()}
                onClick={nextStep}
                className={`px-5 py-2 text-sm rounded-lg font-medium transition ${
                  isFirstStepValid()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 text-sm rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteForm;
