import React, { useState, useEffect } from 'react'
import { CalendarClock, DollarSign, Home, TrendingUp, LogOut, Menu, X } from "lucide-react";
import { logoutUser } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

function TherapistDashboard() {
  const [isRequested, setIsrequested] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        localStorage.clear()
        navigate('/login');
        showToast(response.message, 'success');
      } else {
        showToast(response.message, 'error');
      }
      console.log('Logout clicked');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleJoinClick = () => {
    navigate('/requestForm')
   
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Mindease</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Therapy <span className="text-blue-600">Career</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join Mindease and unlock your potential as a therapist. Work from home, set your own schedule, and earn excellent income while making a meaningful difference in people's lives.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellent Earning Potential</h3>
              <p className="text-gray-600">Earn competitive rates with flexible pricing. Set your own fees and maximize your income potential.</p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Work From Home</h3>
              <p className="text-gray-600">Enjoy the comfort and convenience of working from your own space. No commute, no office rent.</p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Grow Your Career</h3>
              <p className="text-gray-600">Build your client base, develop your expertise, and advance your therapy career on your own terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              className="w-full h-96 object-cover" 
              src="/banner-4.png" 
              alt="Mental health support illustration"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Start Your Profitable Therapy Practice
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of therapists who are building successful careers from home with flexible schedules and great earning potential.
          </p>
          
          <button 
            onClick={handleJoinClick}
            type="button" 
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <CalendarClock className="mr-2 h-5 w-5" />
            Start Earning Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Mindease</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The premier platform for therapists to build successful online practices with flexible schedules and competitive earnings.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TherapistDashboard