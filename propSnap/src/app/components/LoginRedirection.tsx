import React from 'react';
import {  Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginComponent = () => {
    const router=useRouter()

  const handleLoginRedirect = () => {
    router.replace('/auth/login');
  };
  const handleSignup = () => {
    router.replace('/auth/register');
  };

  

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Required</h1>
          <p className="text-gray-600">Please log in to continue to your account</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLoginRedirect}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Go to Login Page</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <div className="text-center text-gray-500 text-sm">
            Don&apos;t have an account? 
            <button onClick={handleSignup} className="text-teal-600 hover:text-teal-700 font-medium ml-1">
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;