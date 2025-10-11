import React, { useState } from 'react';
import { X, ShoppingCart, MessageCircle, Minus, Plus, Star, Leaf, Award, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Auth from './Auth';

interface ProductDetailModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
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

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, () => setShowAuthModal(true));
    }
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
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-tl-2xl md:rounded-bl-2xl md:rounded-tr-none"
              />
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">(5.0)</span>
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
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium">In Stock - Ready to Ship</span>
                </div>
              </div>

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
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add {quantity} to Cart</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 animate-pulse" />
                  <span>Order via WhatsApp</span>
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

