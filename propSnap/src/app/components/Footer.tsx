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
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' }
    ];

    const propertyTypes = [
        { name: 'Apartments', href: '/search?propertyType=APARTMENT' },
        { name: 'Houses', href: '/search?propertyType=HOUSE' },
        { name: 'Villas', href: '/search?propertyType=VILLA' },
        { name: 'Commercial', href: '/search?propertyType=COMMERCIAL' },
        { name: 'PG/Hostels', href: '/search?propertyType=PG' },
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
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex-shrink-0">
                            <Image 
                                src="/assets/logo.svg" 
                                alt="Logo" 
                                width={150} 
                                height={30}
                                className="brightness-0 invert"
                            />
                        </div>
                        <p className="text-teal-100 text-sm leading-6">
                            Your trusted partner in finding the perfect property. We connect buyers, sellers, and renters with their ideal homes and investment opportunities.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="text-teal-200 hover:text-white transition-colors duration-200"
                                    aria-label={social.name}
                                >
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-teal-100 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Property Types */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Property Types</h3>
                        <ul className="space-y-2">
                            {propertyTypes.map((type) => (
                                <li key={type.name}>
                                    <Link 
                                        href={type.href}
                                        className="text-teal-100 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        {type.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <MapPin size={16} className="text-teal-200 mt-1 flex-shrink-0" />
                                <span className="text-teal-100 text-sm">
                                    123 Property Street,<br />
                                    Hubballi, Karnataka 580029
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone size={16} className="text-teal-200 flex-shrink-0" />
                                <a 
                                    href="tel:+919876543210" 
                                    className="text-teal-100 hover:text-white transition-colors duration-200 text-sm"
                                >
                                    +91 98765 43210
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail size={16} className="text-teal-200 flex-shrink-0" />
                                <a 
                                    href="mailto:info@propertyplatform.com" 
                                    className="text-teal-100 hover:text-white transition-colors duration-200 text-sm"
                                >
                                    info@propertyplatform.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-teal-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Stay Updated</h3>
                            <p className="text-teal-100 text-sm">Get the latest property listings and market insights.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full sm:w-64"
                            />
                            <button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-teal-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <p className="text-teal-200 text-sm">
                            © {currentYear} Property Platform. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <Link 
                                href="/privacy" 
                                className="text-teal-200 hover:text-white transition-colors duration-200 text-sm"
                            >
                                Privacy Policy
                            </Link>
                            <Link 
                                href="/terms" 
                                className="text-teal-200 hover:text-white transition-colors duration-200 text-sm"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}