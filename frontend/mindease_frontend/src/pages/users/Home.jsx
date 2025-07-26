import React, { useState } from 'react';
import Navbar from '../../components/users/Navbar';
import CompleteForm from '../../components/users/completeForm';
import { Link } from 'react-router-dom';
import Notifications from '../../components/users/Notifications';

function Home() {
  const features = [
    {
      title: "Real Time Sessions",
      description: "Connect instantly with psychologists through secure video calls.",
      image: "/banner-9.jpg",
      icon: "🎯"
    },
    {
      title: "Expert Psychologists",
      description: "Consult with certified and experienced mental health professionals.",
      image: "/banner-10.jpg",
      icon: "👩‍⚕️"
    },
    {
      title: "Affordable Plans",
      description: "Transparent pricing and budget-friendly packages",
      image: "/banner-7.jpg",
      icon: "💲"
    }
  ];

  const therapists = [1, 2, 3, 4, 5];
  const [openModal, setOpenModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-gray-50'>
      {/* Mobile Navigation Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-teal-600 text-white"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        ☰
      </button>

      {/* Sidebar Navigation - Hidden on mobile unless toggled */}
      <div className={`${mobileNavOpen ? 'block' : 'hidden'} md:block w-full md:w-56 md:min-w-[14rem] bg-white shadow-md fixed md:relative z-40 h-full`}>
        <Navbar onClose={() => setMobileNavOpen(false)} />
      </div>
      
      {openModal && <CompleteForm/>}
      
      {/* Main Content */}
      <main className='flex-1 p-4 md:p-8 mt-16 md:mt-0'>
        <div className='absolute right-4 md:right-10 top-4 md:top-8'>
          <Notifications /> 
        </div>     
        
        {/* Hero Section */}
        <section className='mb-8 md:mb-16'>
          <h1 className='text-2xl md:text-4xl font-bold text-center text-gray-800 py-6 md:py-10'>
            You're Not Alone.<br/>
            <span className='text-teal-600'>Professional Help</span> Is Here
          </h1>
          
          <div className='flex flex-col lg:flex-row bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl overflow-hidden max-w-7xl mx-auto shadow-lg border border-teal-100'>
            <div className='w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-10 text-center'>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-sans font-semibold text-gray-800 mb-6 md:mb-8 leading-relaxed'>
                Connect with licensed psychologists for confidential online therapy sessions from the comfort of your home
              </h2>
              <Link to={'/selectTherapist'}>
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg transition duration-300 shadow-md hover:shadow-lg">
                  Start Your Healing Journey
                </button>
              </Link>
            </div>
            <div className='w-full lg:w-1/2 h-64 md:h-[500px]'>
              <img 
                className='w-full h-full object-cover' 
                src='banner-3.png' 
                alt='Happy person during therapy session'
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='my-12 md:my-20'>
          <h2 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8 md:mb-16'>
            Our <span className='text-teal-600'>Advantages</span>
          </h2>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto'>
            {features.map((feature, index) => (
              <div key={index} className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-2'>
                <div className='h-48 md:h-60 overflow-hidden relative'>
                  <img 
                    src={feature.image} 
                    className='w-full h-full object-cover' 
                    alt={feature.title}
                    loading="lazy"
                  />
                </div>
                <div className='p-6 md:p-8 md:pt-10'>
                  <h3 className='text-lg md:text-xl font-bold text-gray-800 mb-3'>{feature.title}</h3>
                  <p className='text-gray-600 text-sm md:text-base'>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Therapy Section */}
        <section className='my-12 md:my-20 max-w-6xl mx-auto bg-white rounded-2xl overflow-hidden shadow-lg'>
          <div className='flex flex-col lg:flex-row'>
            <div className='p-6 md:p-10 lg:w-2/3'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6'>
                When Should You <span className='text-teal-600'>Consider Therapy?</span>
              </h2>
              <p className='text-gray-600 leading-relaxed text-base md:text-lg mb-4 md:mb-6'>
                Therapy provides a safe space to navigate life's challenges with professional guidance. 
                Whether you're dealing with anxiety, relationship issues, or simply seeking personal growth, 
                our psychologists can help you develop coping strategies and gain valuable insights.
              </p>
              <ul className='space-y-2 md:space-y-3 text-gray-600'>
                <li className='flex items-start'>
                  <span className='text-teal-500 mr-2'>✓</span>
                  <span>Managing stress, anxiety, or depression</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-teal-500 mr-2'>✓</span>
                  <span>Improving relationships and communication</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-teal-500 mr-2'>✓</span>
                  <span>Processing trauma or grief</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-teal-500 mr-2'>✓</span>
                  <span>Building self-esteem and confidence</span>
                </li>
              </ul>
            </div>
            <div className='lg:w-1/3 h-48 md:h-80 lg:h-auto'>
              <img 
                src='/banner-11.avif' 
                className='w-full h-full object-cover' 
                alt='Therapy session in progress'
                loading="lazy"
              />
            </div>
          </div>
        </section>
       
        {/* CTA Section */}
        <section className='my-12 md:my-20 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 md:p-10 text-center text-white'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4 md:mb-6'>Ready to Begin Your Healing Journey?</h2>
          <p className='text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto'>
            Take the first step towards better mental health today. Our team is here to support you.
          </p>
          <button className="bg-white hover:bg-gray-100 text-teal-700 px-8 py-3 md:px-10 md:py-4 rounded-xl font-semibold text-base md:text-lg transition duration-300 shadow-lg hover:shadow-xl">
            Get Matched With a Therapist
          </button>
        </section>

        {/* Footer */}
        <footer className='mt-12 md:mt-20 py-8 md:py-10 border-t border-gray-200'>
          <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center'>
            <div className='mb-6 md:mb-0'>
              <h3 className='text-xl md:text-2xl font-bold text-teal-600'>MindCare</h3>
              <p className='text-gray-600 mt-2 text-sm md:text-base'>Professional online therapy platform</p>
            </div>
            <div className='flex gap-4 md:gap-6'>
              <a href="#" className='text-gray-600 hover:text-teal-600 text-sm md:text-base'>Privacy Policy</a>
              <a href="#" className='text-gray-600 hover:text-teal-600 text-sm md:text-base'>Terms of Service</a>
              <a href="#" className='text-gray-600 hover:text-teal-600 text-sm md:text-base'>Contact Us</a>
            </div>
          </div>
          <div className='max-w-6xl mx-auto text-center text-gray-500 mt-8 md:mt-10 text-sm md:text-base'>
            <p>© {new Date().getFullYear()} MindCare. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Home;