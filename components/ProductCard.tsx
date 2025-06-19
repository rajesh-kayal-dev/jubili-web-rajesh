import React, { useState } from "react";
import { toggleProductLike, addToCart } from "@/lib/api/products";
import { getUser } from "@/utils/storage";

interface ProductCardProps {
    product: {
        productId: string;
        productName: string;
        productDescription: string;
        productCategory: string;
        imageUrls: string[];
        price: string;
        size: string;
        brand?: string;
        likeCount: number;
        reviews?: number;
        likedByUser: boolean;
    };
}

const ProductCard: React.FC<{ product: ProductCardProps["product"] }> = ({ product }) => {
    const [bgImage, setBgImage] = useState(product.imageUrls?.[0]);
    const [isLiked, setIsLiked] = useState(product.likedByUser || false);
    const [likeCount, setLikeCount] = useState(product.likeCount || 0);
    const [isLoading, setIsLoading] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    const handleLikeToggle = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            await toggleProductLike(product.productId, product.productCategory);
            
            // Toggle the like state and update count
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error("Failed to toggle like:", error);
            // You might want to show a toast notification here
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        console.log("Adding to cart");
        if (cartLoading) return;
        setCartLoading(true);
        try {
            const user = getUser();
            console.log("User:", user);
            if (!user || !user.userId) {
                throw new Error("User not found. Please login.");
            }
            await addToCart({
                userId: user.userId,
                productId: product.productId,
                quantity: "1",
            });
            // Optionally, show a toast or update UI
        } catch (error) {
            console.error("Failed to add to cart:", error);
        } finally {
            setCartLoading(false);
        }
    };

    return (
        <div className="relative bg-white overflow-hidden flex flex-col">
            {/* Background image only on laptop and up */}
            {bgImage && (
                <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2 z-0 overflow-hidden">
                    <img
                        src={bgImage}
                        alt="background"
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute left-0 top-0 h-full w-full"
                        style={{
                            background: "linear-gradient(80deg, white 10%, transparent 70%)",
                        }}
                    />
                </div>
            )}

            {/* Foreground content */}
            <div className="relative z-10 py-5">
                {/* Top Row */}
                <div className="flex items-start justify-between mb-1 w-full md:w-2/3 lg:w-1/2 px-4">
                    <div>
                        <div className="text-xl font-semibold">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.brand || "SUTA"}</div>
                    </div>
                    <div className="w-15" />
                    <div className="flex items-center gap-15">
                        <div className="text-green-600 text-lg font-semibold ">₹{product.price}</div>
                        <button className="text-2xl px-2"><b>⋮</b></button>
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="flex overflow-x-auto gap-4 mb-2" style={{ height: 320 }}>
                    <div style={{ height: 300, width: 0 }} />
                    {product.imageUrls.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={product.productName}
                            onMouseEnter={() => setBgImage(url)}
                            style={{ height: 300, width: "auto" }}
                            className="object-cover rounded-xl cursor-pointer"
                        />
                    ))}
                </div>

                {/* Actions Row */}
                <div className="w-full md:w-2/3 lg:w-1/2 flex items-center gap-6 mb-2 px-4">
                    <button 
                        onClick={handleLikeToggle}
                        disabled={isLoading}
                        className={`flex items-center gap-1 transition-all duration-200 ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        }`}
                    >
                        <img 
                            src={isLiked ? "/icons/like_filled.svg" : "/icons/like_outlined.svg"} 
                            alt={isLiked ? "Liked" : "Like"} 
                            width={24} 
                            height={24}
                            className={`transition-all duration-200 ${isLiked ? 'filter-blue' : ''}`}
                        />
                    </button>
                    <span className="text-gray-700">{likeCount}</span>
                    <div className="flex-2" />
                    <button className="flex items-center gap-1 text-gray-700">
                        <img src="/icons/share.svg" alt="share-product" width={24} height={24} />
                    </button>
                    <button className="bg-black text-white rounded px-4 py-1 text-sm">{product.reviews ?? 0} reviews</button>
                    <div className="flex-1" />
                </div>

                {/* Description */}
<div
            className={`text-base text-justify font-medium mb-2 w-full md:w-2/3 lg:w-1/2 px-4 cursor-pointer select-none`}
            style={
                descExpanded
                    ? {}
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }
            }
            onClick={() => setDescExpanded((prev) => !prev)}
            title={descExpanded ? "Show less" : "Show more"}
        >
            {product.productDescription}
            {!descExpanded && (
                <span className="text-blue-500 ml-2">See more</span>
            )}
            {descExpanded && (
                <span className="text-blue-500 ml-2">See less</span>
            )}
        </div>

                {/* Buy Row */}
                <div className="flex items-center gap-3 mt-2 w-full md:w-2/3 lg:w-1/2 px-4">
                    <button className="bg-gray-900 text-white rounded-full px-10 py-2 text-lg font-semibold">Swipe to buy</button>
                    <button className="bg-gray-100 rounded-full p-3 hover:bg-gray-200 cursor-pointer" onClick={handleAddToCart} disabled={cartLoading}>
                        <img src="/icons/cart-bag.svg" alt="Favourites" width={24} height={24} />
                    </button>
                    <div className="flex-1" />
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
