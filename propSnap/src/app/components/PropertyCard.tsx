import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Home, Square, Heart, Eye, ChevronLeft, ChevronRight, Edit, Trash2, MessageCircle } from 'lucide-react';
import { Button } from './Buttons';
import Link from 'next/link';

interface ImageType {
    id: string;
    url: string;
    description: string;
    propertyId: string;
}

interface PropertyCard {
    type?:string
    id:string
    imgLink: ImageType[];
    title: string;
    city: string;
    state: string;
    bhk: string;
    sqft: string;
    rent?: string;
    cost?: string;
    featured?: boolean;
   
    onViewDetails?: () => void;
    onToggleFavorite?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isFavorite?: boolean;
    showActions?: boolean; 
}

export function PropertyCard(props: PropertyCard) {
    const {
        
        imgLink,
        title,
        city,
        state,
        bhk,
        sqft,
        rent,
        cost,
        featured = false,
     
        onToggleFavorite,
        
        onDelete,
        isFavorite = false,
        type,
        showActions = false
    } = props;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying || imgLink.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => 
                prev === imgLink.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, imgLink.length]);

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === imgLink.length - 1 ? 0 : prev + 1
        );
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === 0 ? imgLink.length - 1 : prev - 1
        );
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const goToImage = (index: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.();
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full max-w-6xl mx-auto group 
                        flex flex-col md:flex-row">
            <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0 overflow-hidden">
                <div 
                    className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <Image 
                        src={imgLink[currentImageIndex]?.url || imgLink[0]?.url} 
                        alt={title} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 320px, 384px"
                    />
                    
                    {imgLink.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent">
                        {featured && (
                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                                <span className="bg-teal-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                                    Featured
                                </span>
                            </div>
                        )}
                        
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-2">
                            
                            
                            
                            {type==="property" && (
                                <button
                                    onClick={onToggleFavorite}
                                    className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-md"
                                >
                                    <Heart 
                                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                                            isFavorite 
                                                ? 'text-red-500 fill-red-500' 
                                                : 'text-gray-600 hover:text-red-500'
                                        }`} 
                                    />
                                </button>
                            )}
                        </div>
                        
                        {imgLink.length > 1 && (
                            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                                {currentImageIndex + 1} / {imgLink.length}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-2 sm:p-3 bg-gray-50 border-t">
                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                        {imgLink[currentImageIndex]?.description || 'No description available'}
                    </p>
                </div>
                
                {imgLink.length > 1 && (
                    <div className="flex justify-center space-x-1.5 sm:space-x-2 p-2 bg-gray-50">
                        {imgLink.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => goToImage(index, e)}
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                                    index === currentImageIndex 
                                        ? 'bg-teal-600 w-3 sm:w-4' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-lg sm:text-xl text-gray-900 line-clamp-2 leading-tight">
                        {title}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{city}, {state}</span>
                    </div>

                    <div className="flex items-center space-x-4 sm:space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">{bhk} BHK</span>
                        </div>
                        <div className="flex items-center">
                            <Square className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">{sqft} sqft</span>
                        </div>
                    </div>

                    
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-auto border-t border-gray-100 gap-3 sm:gap-0">
                    <div className="flex flex-col">
                        {rent && (
                            <div className="flex items-baseline">
                                <span className="text-xl sm:text-2xl font-bold text-teal-600">₹{rent}</span>
                                <span className="text-xs sm:text-sm text-gray-500 ml-2">/month</span>
                            </div>
                        )}
                        {cost && (
                            <div className="flex items-baseline">
                                <span className="text-xl sm:text-2xl font-bold text-green-600">₹{cost}</span>
                                <span className="text-xs sm:text-sm text-gray-500 ml-2">total</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        {showActions && (
                            <>
                                <Link href={`/edit?id=${props.id}`}><Button
                                    
                                    variant={'secondary'}
                                    className="flex-1 sm:flex-none text-sm px-3 py-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline ml-1">Edit</span>
                                </Button></Link>
                                <Button
                                    onClick={handleDelete}
                                    variant={'danger'}
                                    className="flex-1 sm:flex-none text-sm px-3 py-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline ml-1">Delete</span>
                                </Button>
                            </>
                        )}
                        
                        <Link href={showActions?`/preview?propertyId=${props.id}`:`/property?propertyId=${props.id}`}>
                            <Button
                                variant={'primary'}
                                className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2"
                            >
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                                <span className="hidden sm:inline">{showActions?"Preview":"View Details"}</span>
                                <span className="sm:hidden">{showActions?"Preview":"View"}</span>
                            </Button>
                        </Link>
                        {showActions&&<Link href={`/chats?propertyId=${props.id}`}>
                            <Button
                                variant={'primary'}
                                className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2"
                            >
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                                <span className="hidden sm:inline">Chats</span>
                                <span className="sm:hidden">Chats</span>
                            </Button>
                        </Link>}
                    </div>
                </div>
            </div>
        </div>
    );
}