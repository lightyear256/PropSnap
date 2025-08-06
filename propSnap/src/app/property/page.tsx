"use client"
import { useEffect, useState } from 'react';
import { MapPin, Square, MessageCircle, Send, ChevronDown, ChevronUp, IndianRupee, Home} from 'lucide-react';
import { Button } from '../components/Buttons';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoader } from '../hooks/useLoader';
import LoginComponent from '../components/LoginRedirection';
import { isLoggedIn } from '../utils/tokenCheker';

interface ImageType {
  id: string;
  url: string;
  description: string;
  propertyId: string;
}

interface favourite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

interface EnquiryReplySchema{
  id:string;
  message:string;
   createdAt:string;
   updatedAt:string;
   userId:string;
  enquiryId:string,
  user?: {
    name: string;
  };
}

interface EnquirySchema {
  createdAt: string;
  id: string;
  message: string;
  propertyId: string;
  updatedAt: string;
  userId: string;
  user?: {
    name: string;
  };
  replies:EnquiryReplySchema[]
}

interface Property {
  id: string;
  title: string;
  price: string;
  ListingType: string;
  address: string;
  description: string;
  furnished: boolean;
  listedById:string;
  city: {
    id: string;
    name: string;
    state: string;
    country: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  enquiries: EnquirySchema[];
  state: string;
  images: ImageType[];
  bhk: string;
  sqft: string;
  latitude: string;
  longitude: string;
  type: string;
  rent?: string;
  featured?: boolean;
  favourites: favourite[];
}

interface ApiResponse {
  success: boolean;
  data: Property;
  message?: string;
}

interface MessageResponse {
  success: boolean;
  data: EnquirySchema;
  message?: string;
}

interface ReplyResponse {
  success: boolean;
  data: EnquiryReplySchema;
  message?: string;
}

export default function Property() {
  const router=useRouter();
  const [properties, setProperties] = useState<Property | null>(null);
  const {loading,setLoading}=useLoader();
  const [loading1, setLoading1] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [submittingReply, setSubmittingReply] = useState<{[key: string]: boolean}>({});
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const fetchProperties = async () => {
    try {
      setLoading1(true);
      setError(null);
      
      if (!propertyId) {
        setError("Property ID is required");
        return;
      }

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/property/properties`,
        {
          params: { propertyId },
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      console.log("this response.data: "+JSON.stringify(response.data));
      if (response.data.success) {
        setProperties(response.data.data);
        const sortedComments = (response.data.data.enquiries || []).map(comment => ({
          ...comment,
        })).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComments(sortedComments);
      } else {
        setError(response.data.message || "Failed to fetch properties");
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
      console.error("Error fetching properties:", err);
    } finally {
      setLoading1(false);
    }
  };
 
  useEffect(() => {
    fetchProperties();
  }, [propertyId]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [comments, setComments] = useState<EnquirySchema[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});
  const [showReplyBox, setShowReplyBox] = useState<{[key: string]: boolean}>({});
  console.log("this teh comment: "+JSON.stringify(comments));
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return '?';
    
    const trimmedName = name.trim();
    if (trimmedName === 'Anonymous User' || trimmedName === '') return '?';
    
    return trimmedName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !properties?.id) return;
    
    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to post a comment');
        return;
      }

      const response = await axios.post<MessageResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/property/message`,
        {
          propertyId: properties.id,
          message: newComment.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setComments(prevComments => [{
          ...response.data.data,
        }, ...prevComments]);
        setNewComment('');
        alert('Question posted successfully!');
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('Please login to post a comment');
        } else {
          alert('Failed to post comment. Please try again.');
        }
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    const reply = replyText[commentId];
    if (!reply?.trim()) return;
    
    try {
      setSubmittingReply(prev => ({ ...prev, [commentId]: true }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.replace('/login')
        return;
      }

      const response = await axios.post<ReplyResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/property/reply_message`,
        {
          enquiryId: commentId,
          message: reply.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? {
                  ...comment,
                  replies: [...comment.replies, response.data.data]
                }
              : comment
          )
        );
        
        setReplyText(prev => ({ ...prev, [commentId]: '' }));
        setShowReplyBox(prev => ({ ...prev, [commentId]: false }));
      } else {
        console.log("issue in adding reply");
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('Please login to post a reply');
        } else {
          alert('Failed to post reply. Please try again.');
        }
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  async function handleStartChat(propertyId:string,sellerId:string,buyerId:string){
    try {
      setLoading(true);
      const response= await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/create`,{
        propertyId,
        sellerId,
        buyerId,
      },{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })
      if(response.data.success){
        router.push(`/chat/?id=${response.data.id}`)
      }
      
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false)
    }
  };

  if (loading1) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white mt-25">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white mt-25">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">Error Loading Property</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchProperties}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!properties) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white mt-25">
        <div className="text-center py-12">
          <div className="text-gray-500 text-xl">Property not found</div>
        </div>
      </div>
    );
  }

  const isRentProperty = properties.type === 'RENT' || properties.ListingType === 'RENT';
 console.log(isLoggedIn(localStorage.getItem("token")));
  return (
    <>
    {isLoggedIn(localStorage.getItem("token"))?<div className="max-w-6xl mx-auto p-6 bg-white mt-25">
      <div className="mb-8">
          {properties.listedById==localStorage.getItem("session-id")&&<div className='text-xl mb-2'>My Property</div>}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{properties.title}</h1>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{properties.city.name}, {properties.city.state}</span>
            </div>
            <div className="text-3xl font-bold text-teal-600 flex items-center">
              <IndianRupee className="w-8 h-8" />
              <span>{properties.price}</span>
              {isRentProperty && <span className="text-lg ml-1">/Month</span>}
            </div>
          </div>
          
        </div>

        <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-gray-600" />
            <span className="font-medium">{properties.bhk} BHK</span>
          </div>
          {properties.sqft && (
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{properties.sqft} sq ft</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {properties.furnished ? 'Furnished' : 'Unfurnished'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{properties.type}</span>
          </div>
        </div>
      </div>

      {properties.images && properties.images.length > 0 ? (
        <div className="mb-8">
          {properties.images.length === 1 ? (
            <div className="mb-8">
              <img 
                src={properties.images[0].url}
                alt={properties.images[0].description || 'Property image'} 
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {properties.images.map((image, index) => (
                <div key={image.id} className={index === 0 ? "col-span-2 row-span-2" : ""}>
                  <img 
                    src={image.url}
                    alt={image.description || `Property image ${index + 1}`} 
                    className={`w-full object-cover rounded-lg ${
                      index === 0 ? 'h-96' : 'h-44'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">No images available</span>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Description</h2>
        <div className="text-gray-700 leading-relaxed">
          {properties.description ? (
            <>
              <div className={`${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                <p className="whitespace-pre-line">{properties.description}</p>
              </div>
              {properties.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mt-4"
                >
                  {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                  {isDescriptionExpanded ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500">No description available for this property.</p>
          )}
        </div>
      </div>

      {properties.address && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Address</h2>
          <p className="text-gray-700">{properties.address}</p>
        </div>
      )}

     

      {properties.listedById!=localStorage.getItem("session-id")&&<div className="mb-8 p-6 bg-teal-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Interested in this property?
            </h3>
            <p className="text-gray-600">
              Chat directly with our property agent for more details and schedule a visit.
            </p>
          </div>
          <Button onClick={()=>{handleStartChat(propertyId as string,properties.listedById,localStorage.getItem("session-id") as string)}} loading={loading} size="lg">
            <MessageCircle className="w-5 h-5" />
            Start Chat
          </Button>
        </div>
      </div>}

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions & Answers</h2>
        
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Ask a Question</h3>
          <div className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Have a question about this property? Ask here..."
              className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              disabled={submittingComment}
            />
            <Button 
              onClick={handleAddComment} 
              className="self-end"
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {comments.map((comment) => {
            if (!comment || !comment.id) return null;
            
            const userName = comment.user?.name || 'Anonymous User';
            const userInitials = getUserInitials(userName);
            console.log(comment);
            return (
              <div key={comment.id} className="border-b pb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {userInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {userName}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.message || 'No message content'}</p>
                    
                    <button
                      onClick={() => setShowReplyBox({
                        ...showReplyBox,
                        [comment.id]: !showReplyBox[comment.id]
                      })}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                  <div className="ml-14 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">
                          {reply.user?.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{reply.user?.name}</span>
                            <span className="text-gray-500 text-xs">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showReplyBox[comment.id] && (
                  <div className="ml-14 mt-4">
                    <div className="flex gap-3">
                      <textarea
                        value={replyText[comment.id] || ''}
                        onChange={(e) => setReplyText({
                          ...replyText,
                          [comment.id]: e.target.value
                        })}
                        placeholder="Write your reply..."
                        className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows={2}
                        disabled={submittingReply[comment.id]}
                      />
                      <Button 
                        onClick={() => handleAddReply(comment.id)}
                        size="sm"
                        className="self-end"
                        disabled={submittingReply[comment.id] || !replyText[comment.id]?.trim()}
                      >
                        {submittingReply[comment.id] ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Posting...
                          </>
                        ) : (
                          'Reply'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          }).filter(Boolean)}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No questions yet. Be the first to ask!</p>
          </div>
        )}
      </div>
    </div>:<LoginComponent/>}
    </>
  );
}