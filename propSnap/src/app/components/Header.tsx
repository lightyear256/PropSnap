"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './Buttons';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isTokenExpired } from '../utils/tokenCheker';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false); 
    const router = useRouter();
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const checkAuthStatus = () => {
        if (typeof window === 'undefined') return;
        
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('Token');
            
            if (token) {
                const expired = isTokenExpired(token);
                if (expired) {
                    alert('Token expired! Please log in again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('Token');
                    setIsLoggedIn(false);
                } else {
                    console.log('Token is still valid');
                    setIsLoggedIn(true);
                }
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        checkAuthStatus();

        const handleAuthChange = () => {
            checkAuthStatus();
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === 'Token') {
                checkAuthStatus();
            }
        };

        window.addEventListener('authStateChanged', handleAuthChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [mounted]);

    const handleLogout = () => {
        if (typeof window === 'undefined') return;
        
        localStorage.removeItem('token');
        localStorage.removeItem('session-id');
        setIsLoggedIn(false);
        window.dispatchEvent(new Event('authStateChanged'));
        router.replace('/');
    };

    const closeMobileMenu = () => {
        setIsMenuOpen(false);
    };

    const publicNavItems = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' }
    ];

    const privateNavItems = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'My Properties', href: '/my_properties' },
        { name: 'Favourites', href: '/favourites' },
        { name: 'Contact', href: '/contact' }
    ];

    const navItems = isLoggedIn ? privateNavItems : publicNavItems;

    if (!mounted || loading) {
        return (
            <div className="absolute top-0 left-0 w-full flex justify-between items-center h-16 sm:h-20 px-4 sm:px-6 lg:px-8 bg-teal-600/10 z-50">
                <div className="flex-shrink-0">
                    <Link href={'/'}>
                        <Image 
                            src={'/assets/logo.svg'} 
                            alt='logo' 
                            width={120} 
                            height={20}
                            className="sm:w-[150px] sm:h-[25px]"
                        />
                    </Link>
                </div>
                
                <div className="hidden lg:flex justify-center gap-x-6 xl:gap-x-8 text-teal-700 font-mono text-base xl:text-lg">
                    {publicNavItems.map((item) => (
                        <div key={item.name} className="hover:text-teal-900 cursor-pointer transition-colors">
                            {item.name}
                        </div>
                    ))}
                </div>
                
                <div className="w-24 sm:w-32 h-8 sm:h-10 bg-gray-200 animate-pulse rounded"></div>

                <button 
                    className="lg:hidden p-2 text-teal-700 hover:text-teal-900 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} className="sm:w-6 sm:h-6" />
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="absolute top-0 left-0 w-full flex justify-between items-center h-16 sm:h-20 px-4 sm:px-6 lg:px-8 bg-teal-600/10 z-50">
                <div className="flex-shrink-0">
                    <Link href={'/'}>
                        <Image 
                            src={'/assets/logo.svg'} 
                            alt='logo' 
                            width={120} 
                            height={20}
                            className="sm:w-[150px] sm:h-[25px]"
                        />
                    </Link>
                </div>
                
                <div className="hidden lg:flex justify-center gap-x-6 xl:gap-x-8 text-teal-700 font-mono text-base xl:text-lg">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href}>
                            <div className="hover:text-teal-900 cursor-pointer transition-colors">
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </div>
                
                {isLoggedIn ? (
                    <div className='hidden lg:flex items-center gap-x-2 xl:gap-x-3'>
                        <Link href={'/add_property'}>
                            <Button variant='primary' size='sm' className="text-xs xl:text-sm px-3 xl:px-4">
                                Register Property
                            </Button>
                        </Link>
                        <Button 
                            variant='danger' 
                            size='sm'
                            className="text-xs xl:text-sm px-3 xl:px-4"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center gap-x-2 xl:gap-x-3">
                        <Link href={'/auth/register'}>
                            <Button variant='secondary' size='sm' className="text-xs xl:text-sm px-3 xl:px-4">
                                SignUp
                            </Button>
                        </Link>
                        <Link href={'/auth/login'}>
                            <Button variant='primary' size='sm' className="text-xs xl:text-sm px-3 xl:px-4">
                                Login
                            </Button>
                        </Link>
                    </div>
                )}

                <button 
                    onClick={toggleMenu}
                    className="lg:hidden p-2 text-teal-700 hover:text-teal-900 transition-colors z-50"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <X size={20} className="sm:w-6 sm:h-6" />
                    ) : (
                        <Menu size={20} className="sm:w-6 sm:h-6" />
                    )}
                </button>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div 
                        className="absolute inset-0 bg-black/50" 
                        onClick={toggleMenu}
                    ></div>
                    
                    <div className="absolute top-16 sm:top-20 left-0 right-0 bg-white border-b shadow-lg">
                        <div className="flex flex-col p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col space-y-3 text-teal-700 font-mono text-base sm:text-lg">
                                {navItems.map((item) => (
                                    <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                                        <div className="hover:text-teal-900 cursor-pointer transition-colors py-2 border-b border-gray-100">
                                            {item.name}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            
                            {isLoggedIn ? (
                                <div className="flex flex-col gap-y-3 pt-4">
                                    <Link href={'/add_property'} onClick={closeMobileMenu}>
                                        <Button variant='primary' size='md' className="w-full">
                                            Register Property
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant='danger' 
                                        size='md' 
                                        className="w-full"
                                        onClick={() => {
                                            handleLogout();
                                            closeMobileMenu();
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-y-3 pt-4">
                                    <Link href={'/auth/register'} onClick={closeMobileMenu}>
                                        <Button variant='secondary' size='md' className="w-full">
                                            SignUp
                                        </Button>
                                    </Link>
                                    <Link href={'/auth/login'} onClick={closeMobileMenu}>
                                        <Button variant='primary' size='md' className="w-full">
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

