"use client"
import { useEffect, useState } from 'react';
import { MapPin, Square, ChevronDown, ChevronUp, IndianRupee, Home} from 'lucide-react';
import { Button } from '../components/Buttons';
import axios from 'axios';
import { isLoggedIn} from '../utils/tokenCheker';
import LoginComponent from '../components/LoginRedirection';

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



export default function Preview({ searchParams }: { searchParams: { [key: string]: string } }) {
  const [properties, setProperties] = useState<Property | null>(null);
  const [loading1, setLoading1] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const propertyId = searchParams.propertyId;

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

  return (
    <>
    {isLoggedIn(localStorage.getItem("token"))?<div className="max-w-6xl mx-auto p-6 bg-white mt-25">
      <div className="mb-8">
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
    </div>:<LoginComponent/>}</>
  );
}