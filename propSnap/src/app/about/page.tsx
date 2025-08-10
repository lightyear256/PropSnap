import React from 'react';
import { Users, Target, Award, Home } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen mt-25 bg-white">
      <div className="bg-white text-teal-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-6">About Premium Properties</h1>
          <p className="text-xl text-teal-600 max-w-3xl leading-relaxed">
            Your trusted real estate partner, helping families and investors find their 
            perfect properties through personalized service and local market expertise.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-teal-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To make home buying and selling simple, transparent, and rewarding for every client. 
              We guide you through every step of your real estate journey with expertise, 
              integrity, and a personal touch that makes all the difference.
            </p>
          </div>
          
          <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-teal-800 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To be the most trusted real estate agency in our community, known for our 
              commitment to client satisfaction, market knowledge, and helping people 
              achieve their property dreams with confidence.
            </p>
          </div>
        </div>



        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Integrity</h3>
              <p className="text-gray-600 leading-relaxed">
                We conduct business with honesty and transparency, always putting 
                our clients best interests first in every transaction.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Service</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide personalized attention to every client, ensuring your 
                real estate experience exceeds your expectations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Expertise</h3>
              <p className="text-gray-600 leading-relaxed">
                Our experienced agents bring deep local market knowledge and 
                proven strategies to help you achieve your real estate goals.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-teal-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Track Record</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-teal-200">Homes Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">450+</div>
              <div className="text-teal-200">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-teal-200">Expert Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">14</div>
              <div className="text-teal-200">Years of Service</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Find Your Dream Home?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss your real estate needs and help you find the perfect property. 
            Contact our team today for a free consultation.
          </p>
          <button className="bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105">
            Contact Us Today
          </button>
        </div>
      </div>
    </div>
  );
}