import React, { useMemo, useEffect, useState } from 'react';
import { MessageCircle, Award, Leaf, Shield, Star, ShoppingCart, Eye, Plus, Minus, Circle, Heart } from 'lucide-react';
import NoResults from './NoResults';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import Auth from './Auth';
import ProductDetailModal from './ProductDetailModal';
import Toast from './Toast';
import { useAllProductRatings } from '../hooks/useProductReviews';
import API_URL from '../config/api';

interface ProductsProps {
  searchTerm: string;
}

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

const Products: React.FC<ProductsProps> = ({ searchTerm }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  
  // Fetch product ratings
  const productIds = products.map(p => p.id.toString());
  const { ratings } = useAllProductRatings(productIds);

  // Define available categories (conditionally include Favorites for authenticated users)
  const categories = isAuthenticated 
    ? ['Favorites', 'All', 'Powders', 'Veg-pickles', 'Non-veg pickles', 'Others']
    : ['All', 'Powders', 'Veg-pickles', 'Non-veg pickles', 'Others'];

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
    
    // Check if already authenticated (including guest users)
    if (!isAuthenticated) {
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

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products?_=${Date.now()}`); // Cache buster
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Refetch products when page becomes visible (e.g., after editing in another tab/modal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };

    const handleFocus = () => {
      fetchProducts();
    };

    const handleProductsUpdate = () => {
      console.log('Products updated - refreshing Products component...');
      fetchProducts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('productsUpdated', handleProductsUpdate);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, []);

  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category first
    if (selectedCategory === 'Favorites') {
      // Show only favorited products
      filtered = filtered.filter(product => favorites.includes(product.id.toString()));
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Then apply search filter if there's a search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(product => {
        // Search in product name
        if (product.name.toLowerCase().includes(searchLower)) return true;
        
        // Search in description
        if (product.description.toLowerCase().includes(searchLower)) return true;
        
        // Search in keywords
        if (product.searchKeywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchLower)
        )) return true;
        
        // Search in features
        if (product.features.some((feature: any) => 
          feature.text.toLowerCase().includes(searchLower)
        )) return true;
        
        return false;
      });
    }

    return filtered;
  }, [searchTerm, products, selectedCategory, favorites]);

  const handleWhatsAppOrder = (productName: string) => {
    const message = `Hi! I'd like to order ${productName}. Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179542401?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Don't show this section if there's a search term (results are shown in Hero)
  if (searchTerm) {
    return null;
  }

  if (loading) {
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover our carefully curated selection of authentic spice blends, crafted with traditional methods and premium ingredients.
            </p>
          </div>

          {/* Fancy Loading Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="text-gray-700 font-semibold">Loading delicious products...</span>
              </div>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full animate-pulse" 
                     style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }}>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Loader - Product Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image skeleton */}
                <div className="aspect-square bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_200%] animate-shimmer"></div>
                
                {/* Content skeleton */}
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading message with animation */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm animate-pulse">
              Fetching fresh products from our collection...
            </p>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .animate-shimmer {
            animation: shimmer 2s ease-in-out infinite;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Premium Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our carefully curated selection of authentic spice blends, crafted with traditional methods and premium ingredients.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex flex-wrap gap-2 p-2 bg-white rounded-xl shadow-md">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category
                    ? category === 'Favorites'
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'Favorites' && (
                  <Heart className={`w-4 h-4 ${selectedCategory === category ? 'fill-white' : ''}`} />
                )}
                {category}
                {category === 'Favorites' && favorites.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedCategory === category ? 'bg-white/20' : 'bg-red-100 text-red-600'
                  }`}>
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Legend */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-6 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-5 h-5 bg-white border-2 border-green-600 rounded">
                <Circle className="w-2.5 h-2.5 fill-green-600 text-green-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Vegetarian</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-5 h-5 bg-white border-2 border-red-600 rounded">
                <Circle className="w-2.5 h-2.5 fill-red-600 text-red-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Non-Vegetarian</span>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Availability Badge */}
                <div className="absolute top-2 left-2">
                  {(() => {
                    const hasStock = product.stockQuantity != null && product.stockQuantity > 0;
                    const isInStock = product.inStock !== false;
                    const lowStock = product.stockQuantity != null && product.stockQuantity < 5 && product.stockQuantity > 0;
                    
                    if (!isInStock || !hasStock) {
                      return (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          Out of Stock
                        </span>
                      );
                    } else if (lowStock) {
                      return (
                        <span className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white text-xs font-bold rounded-full shadow-xl animate-pulse border-2 border-orange-300">
                          🔥 Only {product.stockQuantity} left!
                        </span>
                      );
                    } else {
                      return (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          In Stock
                        </span>
                      );
                    }
                  })()}
                </div>
                
                {/* Top Right Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  {/* Favorite Icon */}
                  {isAuthenticated && (
                    <button
                      onClick={() => toggleFavorite(product.id.toString())}
                      className={`p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 ${
                        isFavorite(product.id.toString())
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-white/90 hover:bg-white'
                      }`}
                      title={isFavorite(product.id.toString()) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite(product.id.toString())
                            ? 'text-white fill-white'
                            : 'text-gray-700'
                        }`}
                      />
                    </button>
                  )}
                  
                  {/* Eye Icon - View Details */}
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-lg font-bold">₹{product.price}</div>
                      <div className="text-xs opacity-90">{product.weight}</div>
                    </div>
                    {ratings[product.id] && ratings[product.id].totalReviews > 0 ? (
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">{ratings[product.id].averageRating}</span>
                        <span className="text-xs text-gray-500 ml-1">({ratings[product.id].totalReviews})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No reviews</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-3">
                <div className="flex items-start gap-2 mb-3 min-h-[2.5rem]">
                  <DietaryBadge category={product.category} />
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                </div>

                {/* Quantity Selector with Action Icons */}
                <div className="flex items-center gap-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 flex-1">
                    <button
                      onClick={() => decreaseQuantity(product.id)}
                      className="p-1 hover:bg-white rounded transition-colors duration-200"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="text-sm font-semibold text-gray-900 px-2">
                      {getQuantity(product.id)}
                    </span>
                    <button
                      onClick={() => increaseQuantity(product.id)}
                      className="p-1 hover:bg-white rounded transition-colors duration-200"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                  
                  {/* Action Icons */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inStock === false || !product.stockQuantity || product.stockQuantity <= 0}
                    className={`p-2.5 rounded-lg transition-all duration-200 shadow-md ${
                      product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                    aria-label="Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(product.name)}
                    disabled={product.inStock === false || !product.stockQuantity || product.stockQuantity <= 0}
                    className={`p-2.5 rounded-lg transition-all duration-200 shadow-md ${
                      product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={product.inStock !== false && product.stockQuantity != null && product.stockQuantity > 0 ? "Order on WhatsApp" : "Out of Stock"}
                    aria-label="Order on WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
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
    </section>
  );
};

export default Products;