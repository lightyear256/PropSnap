"use client"
import Link from 'next/link';
import { Button } from '../../components/Buttons';
import { useState } from 'react';
import axios from 'axios';
import { useLoader } from '@/app/hooks/useLoader';
import {useRouter} from 'next/navigation';

interface FormData {
    email: string;
    name: string;
    password: string;
    confirmPassword:string,
    countryCode: string;
    phone: string;
}

interface FormErrors {
    email: string;
    name: string;
    password: string;
    phone: string;
    general: string;
}

interface CountryCode {
    code: string;
    country: string;
}

export default function Register(){
    const router=useRouter()
    const { loading, setLoading } = useLoader();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        name: '',
        password: '',
        confirmPassword:'',
        countryCode: '+91',
        phone: ''
    });
    
    const [errors, setErrors] = useState<FormErrors>({
        email: '',
        name: '',
        password: '',
        phone: '',
        general: ''
    });

    const countryCodes: CountryCode[] = [
        { code: '+91', country: 'India' },
        { code: '+1', country: 'USA/Canada' },
        { code: '+44', country: 'UK' },
        { code: '+86', country: 'China' },
        { code: '+81', country: 'Japan' },
        { code: '+49', country: 'Germany' },
        { code: '+33', country: 'France' },
        { code: '+61', country: 'Australia' },
        { code: '+7', country: 'Russia' },
        { code: '+55', country: 'Brazil' }
    ];

    const handleInputChange = (field: keyof FormData, value: string): void => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault()
        setLoading(true);
        try {
            setErrors({
                email: '',
                name: '',
                password: '',
                phone: '',
                general: ''
            });
            
            const registrationData = {
                email:formData.email,
                password:formData.password,
                name:formData.name,
                phone:formData.phone,
                countryCode: formData.countryCode
            };

            console.log('Registration data:', registrationData);
            
            const result=await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/auth/register`,
                registrationData
            )
            console.log(result);
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                confirmPassword:'',
                countryCode: ''
            });
            router.push('/auth/login')
        } catch (error) {
            //@ts-expect-error
            console.log('Full error:', error.response?.data);
            
            //@ts-expect-error
            if (error.response?.data?.error) {
        //@ts-expect-error
        const backendErrors = error.response.data.error;
        
        const transformedErrors: FormErrors = {
            email: '',
            name: '',
            password: '',
            phone: '',
            general: ''
        };
        
        if (typeof backendErrors === 'object' && backendErrors !== null) {
            const fieldMapping: { [key: string]: keyof FormErrors } = {
                'email': 'email',
                'name': 'name', 
                'password': 'password',
                'phone': 'phone', 
                'general':'general'
                
            };
            
            Object.entries(backendErrors).forEach(([field, fieldError]: [string, any]) => {
                if (field === '_errors' && Array.isArray(fieldError) && fieldError.length > 0) {
                    transformedErrors.general = fieldError[0];
                } else if (fieldError && fieldError._errors && Array.isArray(fieldError._errors) && fieldError._errors.length > 0) {
                    const frontendField = fieldMapping[field];
                    if (frontendField) {
                        transformedErrors[frontendField] = fieldError._errors[0];
                    }
                }
            });
        } else if (typeof backendErrors === 'string') {
            transformedErrors.general = backendErrors;
        }
        
        setErrors(transformedErrors);
    } else {
        setErrors(prev => ({
            ...prev,
            general: 'Registration failed. Please try again.'
        }));
    }
} finally{
    setLoading(false)
}
};


    return(
        <div className="flex flex-col gap-y-4 justify-center items-center w-full min-h-screen p-4">
            <div className='text-3xl font-bold text-teal-700 mt-25'>Register</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 bg-teal-700/10 w-full max-w-md rounded-lg p-6 sm:p-8">
                
                <div className="flex flex-col gap-y-1">
                    <label className="text-sm font-medium text-teal-800">Email *</label>
                    <input 
                        placeholder="Enter your email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`p-3 outline-none bg-teal-800/20 rounded-md transition-colors focus:bg-teal-800/30 focus:ring-2 focus:ring-teal-500/50 ${
                            errors.email? 'border border-red-400' : ''
                        }`}
                        required
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-y-1">
                    <label className="text-sm font-medium text-teal-800">Full Name *</label>
                    <input 
                        placeholder="Enter your full name" 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`p-3 outline-none bg-teal-800/20 rounded-md transition-colors focus:bg-teal-800/30 focus:ring-2 focus:ring-teal-500/50 ${
                            errors.name ? 'border border-red-400' : ''
                        }`}
                        required
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-y-1">
                    <label className="text-sm font-medium text-teal-800">Password *</label>
                    <input 
                        placeholder="Create a password" 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`p-3 outline-none bg-teal-800/20 rounded-md transition-colors focus:bg-teal-800/30 focus:ring-2 focus:ring-teal-500/50 ${
                            errors.password ? 'border border-red-400' : ''
                        }`}
                        required
                    />
                    {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
                </div>
                <div className="flex flex-col gap-y-1">
                    <label className="text-sm font-medium text-teal-800">Confirm Password *</label>
                    <input 
                        placeholder="Confirm a password" 
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`p-3 outline-none bg-teal-800/20 rounded-md transition-colors focus:bg-teal-800/30 focus:ring-2 focus:ring-teal-500/50`}
                        required
                    />
                    {formData.password !== '' && formData.confirmPassword !== '' && (formData.password===formData.confirmPassword && formData.password!='' ? <span className="text-green-500 text-xs">Password Matched</span>:<span className="text-red-500 text-xs">Password didn&apos; matched</span>)}
                </div>

                <div className="flex flex-col gap-y-1">
                    <label className="text-sm font-medium text-teal-800">Phone Number *</label>
                    <div className="flex gap-x-2">
                        <select 
                            value={formData.countryCode}
                            onChange={(e) => handleInputChange('countryCode', e.target.value)}
                            className="p-3 outline-none bg-teal-800/20 rounded-md transition-colors focus:bg-teal-800/30 focus:ring-2 focus:ring-teal-500/50 w-24 text-sm"
                        >
                            {countryCodes.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.code}
                                </option>
                            ))}
                        </select>
                        <input 
                            placeholder="Enter phone number" 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleInputChange('phone', value);
                            }}
                            className={`flex-1 p-3 outline-none bg-teal-800/20 rounded-md transition-colors focus:bg-teal-800/30 focus:ring-2 focus:ring-teal-500/50 ${
                                errors.phone ? 'border border-red-400' : ''
                            }`}
                            required
                        />
                    </div>
                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
                    <span className="text-xs text-teal-600">
                        Full number: {formData.countryCode} {formData.phone}
                    </span>
                </div>
                {errors.general && <span className="text-red-500 text-xs">{errors.general}</span>}
                <Button variant='primary' className='mt-4 w-full py-3' type="submit" loading={loading}>
                    Register
                </Button>

                <div className="text-center mt-2">
                    <span className="text-sm text-teal-700">
                        Already have an account? 
                        <Link href={'/auth/login'}><button type="button"  className="ml-1 text-teal-600 hover:text-teal-800 underline">
                            Sign In
                        </button></Link>
                    </span>
                </div>
            </form>
            </div>
            )}
