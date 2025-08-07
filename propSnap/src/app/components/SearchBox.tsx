"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search } from "lucide-react";

interface City {
  id: string;
  name: string;
  state: string;
  propertyCount: number;
}

interface SearchData {
  city: string;
  propertyType: string;
  bhk: string;
}

interface ApiResponse {
  success: boolean;
  data: City[];
  message?: string;
  filters?: any;
}

export function SearchBox() {
  const router = useRouter();
  
  const [searchData, setSearchData] = useState<SearchData>({
    city: '',
    propertyType: '',
    bhk: ''
  });
  
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("BUY");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  const options = ["BUY", "RENT", "COMMERCIAL"];
  const propertyTypes = ["APARTMENT", "HOUSE", "PG", "COMMERCIAL", "VILLA", "PLOT"];
  const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];

  const checkAuthStatus = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('Token');
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp < currentTime;
          
          if (isExpired) {
            localStorage.removeItem('token');
            localStorage.removeItem('Token');
            setIsLoggedIn(false);
          } else {
            setIsLoggedIn(true);
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('Token');
          setIsLoggedIn(false);
          //@ts-expect-error
          setError(error)
        }
      } else {
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
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
  }, [checkAuthStatus]);

  const fetchCities = useCallback(async () => {
    if (!isLoggedIn) return; 
    
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      if (searchData.propertyType) {
        queryParams.append('propertyType', searchData.propertyType);
      }
      
      if (searchData.bhk) {
        queryParams.append('bhk', searchData.bhk);
      }
      
      if (selectedType) {
        queryParams.append('listingType', selectedType);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/property/get-cities${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('Fetching cities with URL:', url);
      
      const response = await axios.get<ApiResponse>(url);
      
      if (response.data.success) {
        setCities(response.data.data);
        if (searchData.city && !response.data.data.some(city => city.name === searchData.city)) {
          setSearchData(prev => ({ ...prev, city: '' }));
        }
      } else {
        setError(response.data.message || 'Failed to fetch cities');
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to load cities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchData.propertyType, searchData.bhk, selectedType, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      fetchCities();
    }
  }, [fetchCities, isLoggedIn, authLoading]);

  const handleInputChange = (field: keyof SearchData, value: string): void => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeChange = (newType: string): void => {
    setSelectedType(newType);
    setSearchData(prev => ({ ...prev, city: '' }));
  };

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    
    if (selectedType) {
      params.append('listingType', selectedType);
    }
    
    if (searchData.city) {
      params.append('city', searchData.city);
    }
    
    if (searchData.propertyType) {
      params.append('propertyType', searchData.propertyType);
    }
    
    if (searchData.bhk) {
      params.append('bhk', searchData.bhk);
    }
    
    return `/search?${params.toString()}`;
  };

  const handleSearch = () => {
    console.log('Search data:', {
      listingType: selectedType,
      ...searchData
    });
    
    const searchUrl = buildSearchUrl();
    console.log('Navigating to:', searchUrl);
    router.push(searchUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchData.city) {
      handleSearch();
    }
  };

  const clearAllFilters = () => {
    setSearchData({
      city: '',
      propertyType: '',
      bhk: ''
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse text-teal-700">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold text-teal-800 mb-2">Get Started</h3>
        <p className="text-teal-600 mb-6">
          Please log in to search and explore properties in your area.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-teal-700 text-white px-6 py-2 rounded-md hover:bg-teal-800 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => router.push('/auth/register')}
            className="bg-white text-teal-700 border border-teal-300 px-6 py-2 rounded-md hover:bg-teal-50 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto">
      <div className="flex text-xl justify-center gap-x-8 mb-6">
        {options.map((option) => (
          <div
            key={option}
            onClick={() => handleTypeChange(option)}
            className={`
              cursor-pointer font-semibold transition-all duration-300 relative pb-2
              ${selectedType === option 
                ? 'text-teal-700' 
                : 'text-teal-700/80 hover:text-teal-700/50'
              }
            `}
          >
            {option}
            {selectedType === option && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-800 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-teal-700 font-medium text-sm self-center mr-2">Property Type:</span>
          {propertyTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleInputChange('propertyType', searchData.propertyType === type ? '' : type)}
              className={`
                px-3 py-1 text-xs rounded-full border transition-all duration-200
                ${searchData.propertyType === type
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-teal-700 border-teal-300 hover:border-teal-500 hover:bg-teal-50'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>

        {(searchData.propertyType === 'APARTMENT' || searchData.propertyType === 'HOUSE' || searchData.propertyType === 'VILLA' || searchData.propertyType === '') && (
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-teal-700 font-medium text-sm self-center mr-2">BHK:</span>
            {bhkOptions.map((bhk) => (
              <button
                key={bhk}
                onClick={() => handleInputChange('bhk', searchData.bhk === bhk ? '' : bhk)}
                className={`
                  px-3 py-1 text-xs rounded-full border transition-all duration-200
                  ${searchData.bhk === bhk
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-teal-700 border-teal-300 hover:border-teal-500 hover:bg-teal-50'
                  }
                `}
              >
                {bhk}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex relative">
        <select 
          value={searchData.city} 
          onChange={(e) => handleInputChange('city', e.target.value)} 
          onKeyPress={handleKeyPress}
          className="p-3 h-12 outline-none bg-teal-800/20 rounded-l-md transition-colors focus:bg-teal-800/30 min-w-48 text-sm flex-1"
          disabled={loading}
        >
          <option value="">
            {loading ? "Loading cities..." : cities.length === 0 ? "No cities match filters" : "Select a city"}
          </option>
          
          {error ? (
            <option value="" disabled>
              Error loading cities
            </option>
          ) : (
            cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}, {city.state} ({city.propertyCount} properties)
              </option>
            ))
          )}
        </select>
        
        <button 
          onClick={handleSearch}
          className="w-15 h-12 bg-teal-700 hover:bg-teal-800 flex justify-center items-center rounded-r-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!searchData.city || loading}
          title={!searchData.city ? "Please select a city to search" : "Search properties"}
        >
          <Search className={`${!searchData.city ? 'text-white/50' : 'text-white'}`} size={20} />
        </button>

        {error && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded-md text-red-600 text-xs z-10">
            {error}
          </div>
        )}
      </div>

      {(searchData.city || searchData.propertyType || searchData.bhk || selectedType !== 'BUY') && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-teal-700 text-sm font-medium">Active filters:</span>
          
          {selectedType !== '' && (
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
              {selectedType}
            </span>
          )}
          
          {searchData.city && (
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
              City: {searchData.city}
              <button 
                onClick={() => handleInputChange('city', '')}
                className="ml-1 text-teal-500 hover:text-teal-700"
              >
                ×
              </button>
            </span>
          )}
          
          {searchData.propertyType && (
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
              Type: {searchData.propertyType}
              <button 
                onClick={() => handleInputChange('propertyType', '')}
                className="ml-1 text-teal-500 hover:text-teal-700"
              >
                ×
              </button>
            </span>
          )}
          
          {searchData.bhk && (
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
              {searchData.bhk}
              <button 
                onClick={() => handleInputChange('bhk', '')}
                className="ml-1 text-teal-500 hover:text-teal-700"
              >
                ×
              </button>
            </span>
          )}
          
          {(searchData.propertyType || searchData.bhk) && (
            <button 
              onClick={clearAllFilters}
              className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full hover:bg-red-200 transition-colors"
            >
              Clear all ×
            </button>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-2 text-center text-teal-600 text-sm">
          {cities.length === 0 
            ? "No cities found matching your criteria" 
            : `Showing ${cities.length} cities with available properties`
          }
        </div>
      )}
    </div>
  );
}