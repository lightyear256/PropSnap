"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Properties', href: '/search' },
        { name: 'Contact', href: '/contact' },
    ];
   
    const propertyTypes = [
        { name: 'Apartments', href: '/search?propertyType=APARTMENT' },
        { name: 'Houses', href: '/search?propertyType=HOUSE' },
        { name: 'Villas', href: '/search?propertyType=VILLA' },
        { name: 'Commercial', href: '/search?propertyType=COMMERCIAL' },
        { name: 'PG', href: '/search?propertyType=PG' },
        { name: 'Plots', href: '/search?propertyType=PLOT' }
    ];

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: '#' },
        { name: 'Twitter', icon: Twitter, href: '#' },
        { name: 'Instagram', icon: Instagram, href: '#' },
        { name: 'LinkedIn', icon: Linkedin, href: '#' }
    ];

    return (
        <footer className="bg-teal-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
                        <div className="flex-shrink-0">
                            <Image 
                                src="/assets/logo.svg" 
                                alt="Logo" 
                                width={120} 
                                height={24}
                                className="brightness-0 invert sm:w-[150px] sm:h-[30px]"
                            />
                        </div>
                        <p className="text-teal-100 text-xs sm:text-sm leading-5 sm:leading-6 pr-0 sm:pr-4">
                            Your trusted partner in finding the perfect property. We connect buyers, sellers, and renters with their ideal homes.
                        </p>
                        <div className="flex space-x-3 sm:space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="text-teal-200 hover:text-white transition-colors duration-200 p-1"
                                    aria-label={social.name}
                                >
                                    <social.icon size={18} className="sm:w-5 sm:h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-1.5 sm:space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-teal-100 hover:text-white transition-colors duration-200 text-xs sm:text-sm block py-1"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold">Property Types</h3>
                        <ul className="space-y-1.5 sm:space-y-2">
                            {propertyTypes.map((type) => (
                                <li key={type.name}>
                                    <Link 
                                        href={type.href}
                                        className="text-teal-100 hover:text-white transition-colors duration-200 text-xs sm:text-sm block py-1"
                                    >
                                        {type.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
                        <h3 className="text-base sm:text-lg font-semibold">Contact Us</h3>
                        <div className="space-y-2.5 sm:space-y-3">
                            <div className="flex items-start space-x-2 sm:space-x-3">
                                <MapPin size={14} className="text-teal-200 mt-0.5 sm:mt-1 flex-shrink-0 sm:w-4 sm:h-4" />
                                <span className="text-teal-100 text-xs sm:text-sm leading-4 sm:leading-5">
                                    123 Property Street,<br />
                                    Mumbai,Maharashtra 410206
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <Phone size={14} className="text-teal-200 flex-shrink-0 sm:w-4 sm:h-4" />
                                <a 
                                    href="tel:+919867356741" 
                                    className="text-teal-100 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                                >
                                    +91 9867356741
                                </a>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <Mail size={14} className="text-teal-200 flex-shrink-0 sm:w-4 sm:h-4" />
                                <a 
                                    href="mailto:info@propertyplatform.com" 
                                    className="text-teal-100 hover:text-white transition-colors duration-200 text-xs sm:text-sm break-all"
                                >
                                    info@propertyplatform.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-teal-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Stay Updated</h3>
                            <p className="text-teal-100 text-xs sm:text-sm">Get the latest property listings and market insights.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full sm:w-56 md:w-64 text-sm"
                            />
                            <button className="px-4 py-2 sm:px-6 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200 whitespace-nowrap text-sm font-medium">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-teal-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <p className="text-teal-200 text-xs sm:text-sm text-center sm:text-left">
                            © {currentYear} Property Platform. All rights reserved.
                        </p>
                        
                    </div>
                </div>
            </div>
        </footer>
    );
}