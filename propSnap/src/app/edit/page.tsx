"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { X, MapPin, Upload, ImageIcon } from "lucide-react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import LoginComponent from "../components/LoginRedirection";
import { isLoggedIn } from "../utils/tokenCheker";


export const PropertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "PG",
  "COMMERCIAL",
  "VILLA",
  "PLOT",
]);

const ListingTypeEnum = z.enum(["COMMERCIAL", "BUY", "RENT"]);

const PropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be a positive number"),
  type: PropertyTypeEnum,
  ListingType: ListingTypeEnum,
  bhk: z.number().int().min(0, "BHK must be positive"),
  sqft: z.number().positive("Square footage must be positive"),
  furnished: z.boolean(),
  available: z.boolean().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
});

interface ImageFile {
  file?: File; 
  url: string;
  description?: string;
  id?: string; 
  isExisting?: boolean; 
}

interface FormState {
  id: string; 
  title: string;
  description: string;
  price: number | string;
  type: z.infer<typeof PropertyTypeEnum>;
  ListingType: z.infer<typeof ListingTypeEnum>;
  bhk: number | string;
  sqft: number | string;
  furnished: boolean;
  available: boolean;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  images: ImageFile[];
}

type FormErrors = Partial<Record<keyof FormState, string>> & {
  images?: string[];
};

export default function Edit() {
  const [formData, setFormData] = useState<FormState>({
    id: "",
    title: "",
    description: "",
    price: "",
    type: "APARTMENT" as const,
    ListingType: "RENT" as const,
    bhk: "",
    sqft: "",
    furnished: false,
    available: true,
    city: "",
    state: "",
    country: "",
    address: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  const params = useSearchParams();
  const id = params.get("id");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router=useRouter();

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  async function fetchProperty() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/property/properties`,
        {
          params: {
            id: id,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        const propertyData = response.data.data;
        
        setFormData({
          id: propertyData.id,
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          type: propertyData.type,
          ListingType: propertyData.ListingType,
          bhk: propertyData.bhk,
          sqft: propertyData.sqft,
          furnished: propertyData.furnished,
          available: propertyData.available,
          city: propertyData.city.name, 
          state: propertyData.state,
          country: propertyData.country,
          address: propertyData.address,
          latitude: propertyData.latitude,
          longitude: propertyData.longitude,
          images: propertyData.images.map((img:any) => ({
            id: img.id,
            url: img.url,
            description: img.description || "",
            isExisting: true, 
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      alert("Failed to load property data");
    }
  }

  const handleInputChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData((prev: FormState) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleNumberChange = (field: keyof FormState, value: string) => {
    setFormData((prev: FormState) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));

    if (errors[field]) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles: ImageFile[] = [];
    const maxSize = 5 * 1024 * 1024; 
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(
          `${file.name} is not a supported image format. Please use JPEG, PNG, or WebP.`
        );
        return;
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Please use images smaller than 5MB.`);
        return;
      }

      const url = URL.createObjectURL(file);
      validFiles.push({
        file,
        url,
        description: "",
        isExisting: false, 
      });
    });

    if (validFiles.length > 0) {
      setFormData((prev: FormState) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));
    }
  };

  const removeImageFile = (index: number) => {
    const imageToRemove = formData.images[index];
    
    if (!imageToRemove.isExisting && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev: FormState) => ({
      ...prev,
      images: newImages,
    }));
  };

  const updateImageDescription = (index: number, description: string) => {
    const newImages = [...formData.images];
    newImages[index] = {
      ...newImages[index],
      description,
    };
    setFormData((prev: FormState) => ({
      ...prev,
      images: newImages,
    }));
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        ...formData,
        price: formData.price === "" ? 0 : Number(formData.price),
        bhk: formData.bhk === "" ? 0 : Number(formData.bhk),
        sqft: formData.sqft === "" ? 0 : Number(formData.sqft),
        latitude: formData.latitude === "" ? 0 : Number(formData.latitude),
        longitude: formData.longitude === "" ? 0 : Number(formData.longitude),
      };

      const { ...dataForValidation } = dataToValidate;
      PropertySchema.parse(dataForValidation);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err:any) => {
          const path = err.path.join(".");
          newErrors[path as keyof FormState] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmitHybrid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!formData.id) {
      alert("Property ID is missing. Cannot update.");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const price =
        typeof formData.price === "string"
          ? parseFloat(formData.price)
          : formData.price;
      const bhk =
        typeof formData.bhk === "string"
          ? parseInt(formData.bhk)
          : formData.bhk;
      const sqft =
        typeof formData.sqft === "string"
          ? parseFloat(formData.sqft)
          : formData.sqft;
      const latitude =
        typeof formData.latitude === "string"
          ? parseFloat(formData.latitude)
          : formData.latitude;
      const longitude =
        typeof formData.longitude === "string"
          ? parseFloat(formData.longitude)
          : formData.longitude;

      const propertyData = {
        id: formData.id, 
        creatorId: localStorage.getItem("userId"),
        title: formData.title,
        description: formData.description,
        price,
        type: formData.type,
        ListingType: formData.ListingType,
        bhk,
        sqft,
        furnished: formData.furnished,
        available: formData.available,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        address: formData.address,
        latitude,
        longitude,
      };

      const hybridFormData = new FormData();

      hybridFormData.append("propertyData", JSON.stringify(propertyData));

      const newImages = formData.images.filter(img => !img.isExisting && img.file);
      newImages.forEach((imageFile, index) => {
        if (imageFile.file) {
          hybridFormData.append("images", imageFile.file);
          if (imageFile.description) {
            hybridFormData.append(
              `imageDescriptions[${index}]`,
              imageFile.description
            );
          }
        }
      });

      const existingImages = formData.images.filter(img => img.isExisting);
      hybridFormData.append("existingImages", JSON.stringify(existingImages));

      console.log("Sending hybrid update request with JSON data and files");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/property/update_Property`,
        hybridFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      
      console.log("Property updated:", response.data);
      router.replace('/my_properties');

   

    } catch (error) {
      console.error("Error in hybrid property update:", error);
      handleSubmissionError(error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

 
  const handleSubmissionError = (error:any) => {
    let errorMessage = "Failed to update property. Please try again.";

    if (axios.isAxiosError(error)) {
      console.log("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      switch (error.response?.status) {
        case 400:
          errorMessage = "Invalid data provided. Please check your inputs.";
          break;
        case 401:
          errorMessage = "You are not authorized. Please login again.";
          break;
        case 403:
          errorMessage = "You don't have permission to edit this property.";
          break;
        case 413:
          errorMessage = "Files are too large. Please reduce image sizes.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
      }
    }

    alert(errorMessage);
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev: FormState) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Could not get your location. Please enter coordinates manually."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  return (
    
    <>
    {isLoggedIn(localStorage.getItem("token"))?<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update the details below to modify your property listing
          </p>
        </div>

        {isLoading && uploadProgress > 0 && (
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-teal-700">
                Updating...
              </span>
              <span className="text-sm font-medium text-teal-700">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitHybrid} className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter property title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleNumberChange("price", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter price"
                  min="0"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter property description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    handleInputChange(
                      "type",
                      e.target.value as z.infer<typeof PropertyTypeEnum>
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="PG">PG</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="VILLA">Villa</option>
                  <option value="PLOT">Plot</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  value={formData.ListingType}
                  onChange={(e) =>
                    handleInputChange(
                      "ListingType",
                      e.target.value as z.infer<typeof ListingTypeEnum>
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="RENT">Rent</option>
                  <option value="BUY">Buy</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
                {errors.ListingType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ListingType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK *
                </label>
                <input
                  type="number"
                  value={formData.bhk}
                  onChange={(e) => handleNumberChange("bhk", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Number of bedrooms"
                  min="0"
                />
                {errors.bhk && (
                  <p className="text-red-500 text-sm mt-1">{errors.bhk}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage *
                </label>
                <input
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => handleNumberChange("sqft", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Square feet"
                  min="0"
                />
                {errors.sqft && (
                  <p className="text-red-500 text-sm mt-1">{errors.sqft}</p>
                )}
              </div>

              <div className="flex items-center space-x-6 pt-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.furnished}
                    onChange={(e) =>
                      handleInputChange("furnished", e.target.checked)
                    }
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Furnished
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      handleInputChange("available", e.target.checked)
                    }
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter country"
                />
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <div className="flex">
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleNumberChange("latitude", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Latitude"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 transition-colors"
                    title="Get current location"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
                {errors.latitude && (
                  <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleNumberChange("longitude", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Longitude"
                />
                {errors.longitude && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Property Images
              </h2>
              <label className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload New Images
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              Supported formats: JPEG, PNG, WebP • Max size: 5MB per image
            </div>

            {formData.images.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm">
                  No images uploaded yet. Click &apos;Upload New Images&apos; to add property photos.
                </p>
              </div>
            )}

            {formData.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div
                    key={image.id || index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            image.isExisting
                              ? "bg-teal-100 text-teal-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {image.isExisting ? "Existing" : "New"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <input
                        type="text"
                        value={image.description || ""}
                        onChange={(e) =>
                          updateImageDescription(index, e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Image description (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="min-w-[200px] px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? "Updating Property..." : "Update Property"}
            </button>
          </div>
        </form>
      </div>
    </div>:<LoginComponent/>}
    </>
  );
}