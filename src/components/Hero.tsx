import React from 'react';
import { Truck, Leaf, Award, Clock, Star, X, ShoppingCart, Plus, Minus } from 'lucide-react';
import SearchBar from './SearchBar';
import NoResults from './NoResults';
import { useCart } from '../context/CartContext';
import Auth from './Auth';
import ProductDetailModal from './ProductDetailModal';
import Toast from './Toast';

interface HeroProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultsCount: number;
  totalCount: number;
  filteredProducts: any[];
}

const Hero: React.FC<HeroProps> = ({ 
  searchTerm, 
  onSearchChange, 
  resultsCount, 
  totalCount, 
  filteredProducts 
}) => {
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [quantities, setQuantities] = React.useState<{ [key: number]: number }>({});
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const { addToCart } = useCart();

  // Close search results on ESC key
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchTerm) {
        onSearchChange('');
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [searchTerm, onSearchChange]);

  const getQuantity = (productId: number) => quantities[productId] || 1;
  
  const increaseQuantity = (productId: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };

  const decreaseQuantity = (productId: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const handleAddToCart = (product: any) => {
    const quantity = getQuantity(product.id);
    
    // Check if already authenticated
    const savedUser = localStorage.getItem('desiRootsUser');
    if (!savedUser) {
      setShowAuthModal(true);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product, () => setShowAuthModal(true));
    }
    
    // Show success toast
    setToastMessage(`${quantity}x ${product.name} added to cart!`);
    setShowToast(true);
    
    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Free Delivery',
      subtitle: 'On orders above ₹500',
      color: 'bg-blue-500'
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: '100% Natural',
      subtitle: 'No artificial additives',
      color: 'bg-green-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Premium Quality',
      subtitle: 'Traditional recipes',
      color: 'bg-purple-500'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Fresh Ground',
      subtitle: 'Made to order',
      color: 'bg-orange-500'
    }
  ];

  return (
    <section id="home" className="relative pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/WhatsApp Image 2025-06-28 at 4.09.58 PM copy.jpeg"
          alt="Spice background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Decorative background curves */}
      <div className="absolute inset-0 z-10">
        <svg
          className="absolute top-0 left-0 w-full h-64 text-red-800/20"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C300,200 900,0 1200,100 L1200,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-64 text-red-800/20"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 C300,200 900,400 1200,300 L1200,400 L0,400 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ultra Thin Scrolling Announcement Bar */}
        {showAnnouncement && (
          <div className="pt-2 pb-1">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg shadow-lg overflow-hidden relative h-8">
              {/* Scrolling text container */}
              <div className="flex items-center h-full relative overflow-hidden">
                {/* Scrolling text */}
                <div className="flex items-center animate-scroll whitespace-nowrap">
                  <div className="flex items-center space-x-2 px-4">
                    <Truck className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🚚 FREE Delivery on all orders above ₹500 - Limited time offer!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      ⚡ Fresh Stock Alert: All spices ground fresh daily - Order now for maximum flavor!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🏆 Premium Quality Guarantee: 100% authentic Guntur spices with traditional recipes!
                    </span>
                  </div>
                  {/* Duplicate for seamless loop */}
                  <div className="flex items-center space-x-2 px-4">
                    <Truck className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🚚 FREE Delivery on all orders above ₹500 - Limited time offer!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      ⚡ Fresh Stock Alert: All spices ground fresh daily - Order now for maximum flavor!
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      🏆 Premium Quality Guarantee: 100% authentic Guntur spices with traditional recipes!
                    </span>
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 group z-10 bg-black/20"
                  aria-label="Close announcement"
                >
                  <X className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              {/* Gradient fade edges */}
              <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-red-600 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-orange-600 to-transparent pointer-events-none"></div>
            </div>
          </div>
        )}

        {/* Search Bar positioned right below announcement bar */}
        <div className="pt-4 pb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            resultsCount={resultsCount}
            totalCount={totalCount}
          />
        </div>

        {/* Search Results Section */}
        {searchTerm && (
          <div className="mb-8">
            {filteredProducts.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
                <NoResults 
                  searchTerm={searchTerm} 
                  onClearSearch={() => onSearchChange('')}
                />
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                {/* Close Button at Top */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => onSearchChange('')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 font-semibold text-sm border border-red-200 hover:border-red-300 group"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Close Search</span>
                  </button>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Search Results
                  </h3>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-800 font-semibold text-sm">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                </div>
                
                {/* List View */}
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 flex items-center gap-4 border border-gray-100 hover:border-orange-200"
                    >
                      {/* Product Image - Smaller */}
                      <div 
                        className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-orange-600 font-bold text-sm">₹{product.price}</span>
                          <span className="text-gray-500 text-xs">• {product.weight}</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600 ml-0.5">5.0</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                        <button
                          onClick={() => decreaseQuantity(product.id)}
                          className="p-1 hover:bg-white rounded transition-colors duration-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-6 text-center">
                          {getQuantity(product.id)}
                        </span>
                        <button
                          onClick={() => increaseQuantity(product.id)}
                          className="p-1 hover:bg-white rounded transition-colors duration-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Add to Cart Icon Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-shrink-0 p-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        title={`Add ${getQuantity(product.id)} to cart`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Auth Modal */}
                <Auth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
                
                {/* Product Detail Modal */}
                <ProductDetailModal
                  product={selectedProduct}
                  isOpen={!!selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                  onAddToCart={(message: string) => {
                    setToastMessage(message);
                    setShowToast(true);
                  }}
                />
                
                {/* Success Toast */}
                <Toast
                  message={toastMessage}
                  isVisible={showToast}
                  onClose={() => setShowToast(false)}
                />
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-semibold text-sm hover:underline transition-all duration-200 group"
                    >
                      <span>View all products below</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    
                    {/* Close Button at Bottom */}
                    <button
                      onClick={() => onSearchChange('')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 font-semibold text-sm border border-red-200 hover:border-red-300 group"
                    >
                      <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                      <span>Close Search</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hero Content - only show when not searching */}
        {!searchTerm && (
          <div className="text-center py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-2xl">
              The Authentic Taste of
              <span className="text-amber-400 block drop-shadow-lg bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-extrabold">Guntur Spice</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-lg font-serif italic leading-relaxed tracking-wide">
              Experience the rich flavors of traditional spices, carefully crafted for the modern kitchen
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group border border-white/20"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {feature.subtitle}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-orange-400/50 hover:shadow-xl"
              >
                View Our Products
              </button>
              <a
                href="https://wa.me/918179715455?text=Hi, I'm interested in your spice products!"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;