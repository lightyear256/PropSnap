"use client"
import { useState, useEffect } from 'react';
import { MessageCircle, Search, User, Clock, MapPin, Home, MoreVertical } from 'lucide-react';
import { Button } from '../components/Buttons';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginComponent from '../components/LoginRedirection';
import { isLoggedIn } from '../utils/tokenCheker';

interface Buyer {
  id: string;
  name: string;
  email: string;
}

interface City {
  state: string;
  name: string;
}

enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  PG = "PG",
  COMMERCIAL = "COMMERCIAL",
  VILLA = "VILLA",
  PLOT = "PLOT",
}

interface Property {
  title: string;
  id: string;
  bhk: number;
  type: PropertyType;
  city: City;
  price: number;
  ListingType: 'RENT' | 'SALE' | 'COMMERCIAL';
}

interface Conversation {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  buyer: Buyer;
  property: Property;
}

export default function Chats() {
    const params = useSearchParams();
    const router=useRouter()
    const propertyId = params.get('propertyId');
    const [chats, setChats] = useState<Conversation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'archived'>('all');

    const fetchChats = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/chats`, {
                params: {
                    propertyId,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }); 
            setChats(res.data.chats); 
        } catch (err:any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch chats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();     
    }, [propertyId]);

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            chat.property.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading chats...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-red-500 mb-4">
                            <MessageCircle className="w-16 h-16 mx-auto mb-2" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chats</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchChats} variant="primary">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
    {isLoggedIn(localStorage.getItem("token"))?<div className="min-h-screen bg-gray-50 pt-20">
            <div className="bg-white border-b border-gray-200 px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <MessageCircle className="w-7 h-7 mr-3 text-teal-600" />
                                My Chats
                            </h1>
                            <p className="text-gray-600 mt-1">Manage conversations with potential buyers and tenants</p>
                        </div>
                        
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {[
                                { key: 'all', label: 'All', count: chats.length },
                                { key: 'archived', label: 'Archived', count: 0 }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key as any)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filter === tab.key 
                                            ? 'bg-white text-teal-600 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label} {tab.count > 0 && `(${tab.count})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4">
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search chats by user name or property..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {filteredChats.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'No chats found' : 'No chats yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm 
                                ? 'Try adjusting your search terms' 
                                : 'When users inquire about your properties, conversations will appear here'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredChats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent ${selectedChat === chat.id ? 'ring-2 ring-teal-500' : ''}`}
                                onClick={() => setSelectedChat(chat.id)}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {chat.buyer.name}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-gray-500 ml-2">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatTimestamp(chat.updatedAt)}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {chat.buyer.email}
                                                </p>
                                                
                                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                                    <Home className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    <span className="truncate">{chat.property.title}</span>
                                                </div>
                                                
                                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    <span>{chat.property.city.name}, {chat.property.city.state}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="font-medium text-teal-600">
                                                        ₹{chat.property.price.toLocaleString()}
                                                        {chat.property.ListingType === 'RENT' && '/month'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center text-xs text-gray-400 space-x-2">
                                                    <span>{chat.property.bhk}BHK</span>
                                                    <span>•</span>
                                                    <span>{chat.property.type}</span>
                                                    <span>•</span>
                                                    <span>{chat.property.ListingType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-3">
                                            <button className="p-1 hover:bg-gray-100 rounded-full">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="px-4 pb-4">
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="primary"
                                            className="flex-1 text-sm py-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/chat?id=${chat.id}`)
                                            }}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            Open Chat
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="text-sm py-2 px-4"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/preview?propertyId=${chat.property.id}`) ;
                                            }}
                                        >
                                            View Property
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>:<LoginComponent/>}
        </>
    );
}