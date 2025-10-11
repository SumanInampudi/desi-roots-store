import React, { useState } from 'react';
import { X, ShoppingCart, MessageCircle, Minus, Plus, Star, Leaf, Award, Shield, Circle, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useProductReviews } from '../hooks/useProductReviews';
import Auth from './Auth';

interface ProductDetailModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (message: string) => void;
}

// Helper function to map icon names to components
const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    'Leaf': <Leaf className="w-4 h-4" />,
    'Shield': <Shield className="w-4 h-4" />,
    'Award': <Award className="w-4 h-4" />,
    'Star': <Star className="w-4 h-4" />
  };
  return icons[iconName] || <Star className="w-4 h-4" />;
};

// Helper function to check if product is non-veg
const isNonVeg = (category: string) => {
  return category?.toLowerCase().includes('non-veg');
};

// Veg/Non-veg Badge Component (Icon Only)
const DietaryBadge: React.FC<{ category: string }> = ({ category }) => {
  const nonVeg = isNonVeg(category);
  
  if (nonVeg) {
    return (
      <div className="inline-flex items-center justify-center w-5 h-5 bg-white border-2 border-red-600 rounded" title="Non-Veg">
        <Circle className="w-2.5 h-2.5 fill-red-600 text-red-600" />
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center justify-center w-5 h-5 bg-white border-2 border-green-600 rounded" title="Veg">
      <Circle className="w-2.5 h-2.5 fill-green-600 text-green-600" />
    </div>
  );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart: onAddToCartCallback }) => {
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { productRating } = useProductReviews(product?.id);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    // Check if already authenticated
    const savedUser = localStorage.getItem('desiRootsUser');
    if (!savedUser) {
      setShowAuthModal(true);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product, () => setShowAuthModal(true));
    }
    
    // Trigger success callback
    if (onAddToCartCallback) {
      onAddToCartCallback(`${quantity}x ${product.name} added to cart!`);
    }
    
    // Close modal and reset quantity
    onClose();
    setQuantity(1);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi! I'd like to order ${quantity}x ${product.name} (${product.weight}) - ₹${parseFloat(product.price) * quantity}. Please provide details about availability and delivery.`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(product.id.toString())}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                isFavorite(product.id.toString())
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/90 hover:bg-white'
              }`}
              title={isFavorite(product.id.toString()) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite(product.id.toString())
                    ? 'text-white fill-white'
                    : 'text-gray-600'
                }`}
              />
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-tl-2xl md:rounded-bl-2xl md:rounded-tr-none"
              />
              {/* Availability Badge */}
              <div className="absolute top-4 right-4">
                {(() => {
                  const hasStock = product.stockQuantity != null && product.stockQuantity > 0;
                  const isInStock = product.inStock !== false;
                  const isAvailable = isInStock && hasStock;
                  const lowStock = product.stockQuantity != null && product.stockQuantity < 5 && product.stockQuantity > 0;
                  
                  if (!isAvailable) {
                    return (
                      <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        Out of Stock
                      </span>
                    );
                  } else if (lowStock) {
                    return (
                      <span className="px-4 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white text-sm font-bold rounded-full shadow-2xl animate-pulse border-2 border-orange-300">
                        🔥 Only {product.stockQuantity} left!
                      </span>
                    );
                  } else {
                    return (
                      <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        In Stock
                      </span>
                    );
                  }
                })()}
              </div>
              {/* Price Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">₹{product.price}</div>
                    <div className="text-sm opacity-90">{product.weight}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <DietaryBadge category={product.category} />
                  <h2 className="text-3xl font-bold text-gray-900 flex-1">{product.name}</h2>
                </div>
                <div className="flex items-center space-x-3">
                  {productRating.totalReviews > 0 ? (
                    <>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(productRating.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({productRating.averageRating} - {productRating.totalReviews} {productRating.totalReviews === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No reviews yet</span>
                  )}
                  {product.category && (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-red-600" />
                  Key Features
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.features.map((feature: any, index: number) => (
                    <div
                      key={index}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${feature.color} border border-opacity-20`}
                    >
                      {getIcon(feature.icon)}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              {(() => {
                const hasStock = product.stockQuantity != null && product.stockQuantity > 0;
                const isInStock = product.inStock !== false;
                const isAvailable = isInStock && hasStock;
                const lowStock = product.stockQuantity != null && product.stockQuantity < 5 && product.stockQuantity > 0;
                
                return (
                  <div className={`mb-6 p-4 rounded-xl border-2 ${
                    !isAvailable 
                      ? 'bg-red-50 border-red-300'
                      : lowStock 
                        ? 'bg-gradient-to-r from-orange-50 via-orange-100 to-red-50 border-orange-400 shadow-lg'
                        : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`flex items-center justify-between ${
                      !isAvailable
                        ? 'text-red-800'
                        : lowStock
                          ? 'text-orange-900'
                          : 'text-green-800'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          !isAvailable 
                            ? 'bg-red-500'
                            : lowStock
                              ? 'bg-orange-500 animate-pulse'
                              : 'bg-green-500 animate-pulse'
                        }`}></div>
                        <span className={`text-sm ${lowStock ? 'font-bold text-base' : 'font-medium'}`}>
                          {!isAvailable 
                            ? 'Out of Stock' 
                            : lowStock
                              ? `🔥 Only ${product.stockQuantity} ${product.stockQuantity === 1 ? 'unit' : 'units'} left - Order now!`
                              : 'In Stock - Ready to Ship'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={decreaseQuantity}
                      className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="px-6 py-2 text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    Total: ₹{parseFloat(product.price) * quantity}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock === false || !product.stockQuantity || product.stockQuantity <= 0}
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg ${
                    product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  disabled={product.inStock === false || !product.stockQuantity || product.stockQuantity <= 0}
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg ${
                    product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0 ? 'Order via WhatsApp' : 'Out of Stock'}</span>
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Award className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Premium Quality</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    <span>100% Authentic</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Leaf className="w-4 h-4 mr-2 text-green-600" />
                    <span>Natural Ingredients</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-600" />
                    <span>Top Rated</span>
                  </div>
                </div>
              </div>

              {/* Customer Reviews */}
              {productRating.totalReviews > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Customer Reviews</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {productRating.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.customerName}</p>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Auth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default ProductDetailModal;

