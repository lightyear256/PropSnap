"use client"
import { useEffect, useState, useRef, Suspense } from 'react';
import { Send, User, Home } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import LoginComponent from '../components/LoginRedirection';
import { isLoggedIn } from '../utils/tokenCheker';

interface Message {
    id: string;
    content: string;
    conversationId: string;
    createdAt: string;
    messageType: string;
    receiverId: string;
    senderId: string;
}

function ChatContent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    
    const [newMessage, setNewMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true); 
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true); 

    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUserId(localStorage.getItem("session-id"));
        }
    }, []);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessagesSilent = async (): Promise<void> => {
        try {
            if (!id) return;

            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            if (!token) return;

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/fetch`,
                {
                    params: { id },
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 10000,
                }
            );

            if (response.data.success) {
                const newMessages = response.data.data.messages || [];
                
                setMessages(prevMessages => {
                    if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
                        return newMessages;
                    }
                    return prevMessages;
                });
            }
        } catch (err) {
            console.error("Silent fetch error:", err);
        }
    };

    const fetchMessages = async (): Promise<void> => {
        try {
            if (isInitialLoad) {
                setLoading(true);
            }
            setError(null);
            
            if (!id) {
                setError("Property ID is required");
                return;
            }

            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            if (!token) {
                setError("Authentication token not found");
                return;
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/fetch`,
                {
                    params: { id },
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 10000,
                }
            );

            console.log("Response data:", response.data);
            
            if (response.data.success) {
                setMessages(response.data.data.messages || []);
            } else {
                setError(response.data.message || "Failed to fetch messages");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.code === "ECONNABORTED") {
                    setError("Request timeout. Please try again.");
                } else if (err.response) {
                    setError(`Server Error: ${err.response.status} - ${err.response.statusText}`);
                } else if (err.request) {
                    setError("Network error. Please check your connection.");
                } else {
                    setError("An unexpected error occurred.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
            console.error("Error fetching messages:", err);
        } finally {
            if (isInitialLoad) {
                setLoading(false);
                setIsInitialLoad(false); 
            }
        }
    };

    useEffect(() => {
        if (!id) return;

        fetchMessages();

        const interval = setInterval(() => {
            fetchMessagesSilent(); 
        }, 5000); 

        return () => clearInterval(interval);
    }, [id]);

    const sendMessage = async (): Promise<void> => {
        if (!newMessage.trim() || !id) return;

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            if (!token) {
                setError("Authentication token not found");
                return;
            }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/chat/send`,
                {
                    id,
                    content: newMessage
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success && response.data.data) {
                setMessages(prevMessages => [...prevMessages, response.data.data]);
                setNewMessage("");
                
                if (error) setError(null);
            } else {
                setError("Failed to send message");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTimestamp = (timestamp: string): string => {
        try {
            return new Date(timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch {
            return timestamp;
        }
    };

    const handleRetry = () => {
        setIsInitialLoad(true); 
        fetchMessages();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center p-4">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button 
                        onClick={handleRetry}
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {isLoggedIn(localStorage.getItem("token")) ? 
                <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg mt-25">
                    <div className="flex items-center justify-between p-4 bg-teal-600 text-white rounded-t-lg">
                        <div className="flex items-center space-x-3">
                            <Home className="h-6 w-6" />
                            <div>
                                <h2 className="font-semibold">Property Chat</h2>
                                <p className="text-sm text-teal-100">Property Discussion</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                            <span className="text-sm">Online</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                                            message.senderId === currentUserId ? 'flex-row-reverse space-x-reverse' : ''
                                        }`}
                                    >
                                        <div
                                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                                message.senderId === currentUserId 
                                                    ? 'bg-teal-500 text-white' 
                                                    : 'bg-green-500 text-white'
                                            }`}
                                        >
                                            {message.senderId === currentUserId ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Home className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div
                                            className={`rounded-lg px-4 py-2 ${
                                                message.senderId === currentUserId
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    message.senderId === currentUserId ? 'text-teal-100' : 'text-gray-500'
                                                }`}
                                            >
                                                {formatTimestamp(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !newMessage.trim()}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-4 w-4" />
                                <span>Send</span>
                            </button>
                        </div>
                    </div>
                </div> 
                : <LoginComponent/>
            }
        </>
    );
}

function ChatLoading() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading chat...</p>
            </div>
        </div>
    );
}

export default function Chat() {
    return (
        <Suspense fallback={<ChatLoading />}>
            <ChatContent />
        </Suspense>
    );
}