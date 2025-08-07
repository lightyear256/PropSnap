"use client";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { PropertyCard } from "../components/PropertyCard";
import { Button } from "../components/Buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { isLoggedIn } from "../utils/tokenCheker";
import LoginComponent from "../components/LoginRedirection";

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
interface Property {
  id: string;
  title: string;
  city: {
    id: string;
    name: string;
    state: string;
    country: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  state: string;
  images: ImageType[];
  bhk: string;
  sqft: string;
  rent?: string;
  cost?: string;
  featured?: boolean;
  favourites: favourite[];
}

interface ApiResponse {
  success: boolean;
  data: Property[];
  message?: string;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [favouriteStates, setFavouriteStates] = useState<Record<string, boolean>>({});
  const city = searchParams.get("city"); 
  const propertyType = searchParams.get("propertyType"); 
  const bhk = searchParams.get("bhk");
  const ListingType = searchParams.get("listType");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    properties.forEach((property) => {
      initialStates[property.id] = property.favourites.length > 0;
    });
    setFavouriteStates(initialStates);
  }, [properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/property/properties`,
        {
          params: {
            city,
            ListingType,
            propertyType,
            bhk,
          },
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
          timeout: 150000, 
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setProperties(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch properties");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          setError("Request timeout. Please try again.");
        } else if (err.response) {
          setError(
            `Server Error: ${err.response.status} - ${err.response.statusText}`
          );
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);
 
  const handleToggleFavorite = (propertyId: string, favourite: boolean) => {
    try{
    console.log("Toggling favorite for property:", propertyId);
    setFavouriteStates((prev) => ({
      ...prev,
      [propertyId]: !favourite,
    }));
    if (!favourite) {
      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/property/add_fav`,
        { propertyId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } else {
      axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/property/del_fav`, {
        data: {
          propertyId: propertyId,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
    }
  }catch (err) {
    console.error("Failed to update favourite", err);
    setFavouriteStates((prev) => ({
      ...prev,
      [propertyId]: favourite,
    }));
  }
  };

  const handleRetry = () => {
    fetchProperties();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <Button variant="primary" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Properties Found
          </h2>
          <p className="text-gray-600 mb-4">
            There are currently no properties available.
          </p>
          <Button variant="primary" onClick={handleRetry}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    {isLoggedIn(localStorage.getItem("token")) ? <div className="min-h-screen bg-gray-50 mt-25">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600 mt-1">
                {properties.length}{" "}
                {properties.length === 1 ? "property" : "properties"} available
              </p>
            </div>
            <Button variant="primary" onClick={handleRetry}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {properties.map((property) => (
            <PropertyCard
            type="property"
            id={property.id}
              isFavorite={favouriteStates[property.id] || false}
              key={property.id}
              title={property.title}
              city={property.city.name}
              state={property.state}
              imgLink={property.images}
              bhk={property.bhk}
              sqft={property.sqft}
              rent={property.rent}
              cost={property.cost}
              featured={property.featured}
              onToggleFavorite={() =>
                handleToggleFavorite(
                  property.id,
                  favouriteStates[property.id] || false
                )
              }
            />
          ))}
        </div>
      </div>
    </div> : <LoginComponent/>}
    </>
  );
}

function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading properties...</p>
      </div>
    </div>
  );
}

export default function Properties() {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesContent />
    </Suspense>
  );
}