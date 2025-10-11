import React, { useMemo, useEffect, useState } from 'react';
import { MessageCircle, Award, Leaf, Shield, Star, ShoppingCart, Eye, Plus, Minus } from 'lucide-react';
import NoResults from './NoResults';
import { useCart } from '../context/CartContext';
import Auth from './Auth';
import ProductDetailModal from './ProductDetailModal';

const API_URL = 'http://localhost:3001';

interface ProductsProps {
  searchTerm: string;
}

// Helper function to map icon names to components
const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    'Leaf': <Leaf className="w-3 h-3" />,
    'Shield': <Shield className="w-3 h-3" />,
    'Award': <Award className="w-3 h-3" />,
    'Star': <Star className="w-3 h-3" />
  };
  return icons[iconName] || <Star className="w-3 h-3" />;
};

const Products: React.FC<ProductsProps> = ({ searchTerm }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const { addToCart } = useCart();

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
    for (let i = 0; i < quantity; i++) {
      addToCart(product, () => setShowAuthModal(true));
    }
    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const searchLower = searchTerm.toLowerCase().trim();
    
    return products.filter(product => {
      // Search in product name
      if (product.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in description
      if (product.description.toLowerCase().includes(searchLower)) return true;
      
      // Search in keywords
      if (product.searchKeywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      )) return true;
      
      // Search in features
      if (product.features.some(feature => 
        feature.text.toLowerCase().includes(searchLower)
      )) return true;
      
      return false;
    });
  }, [searchTerm, products]);

  const handleWhatsAppOrder = (productName: string) => {
    const message = `Hi! I'd like to order ${productName}. Could you please provide me with more details about pricing and availability?`;
    const whatsappUrl = `https://wa.me/918179715455?text=${encodeURIComponent(message)}`;
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Premium Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our carefully curated selection of authentic spice blends, crafted with traditional methods and premium ingredients.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.map((product) => (
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
                
                {/* Eye Icon - View Details */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>

                {/* Price Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <div className="text-lg font-bold">₹{product.price}</div>
                      <div className="text-xs opacity-90">{product.weight}</div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs ml-1">5.0</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                
                {/* Features - Show 2 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.features.slice(0, 2).map((feature: any, index: number) => (
                    <div
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
                    >
                      {getIcon(feature.icon)}
                      <span className="text-xs">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className="mb-3">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
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
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 text-xs shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <ShoppingCart size={14} />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(product.name)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 text-xs shadow-md"
                  >
                    <MessageCircle size={14} />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <Auth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};

export default Products;