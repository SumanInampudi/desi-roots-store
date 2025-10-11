import React, { useMemo, useEffect, useState } from 'react';
import { MessageCircle, Award, Leaf, Shield, Star, ShoppingCart } from 'lucide-react';
import NoResults from './NoResults';
import { useCart } from '../context/CartContext';
import Auth from './Auth';

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
  const { addToCart } = useCart();

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative"
            >
              {/* Ultra Compact Price Tag */}
              <div className="absolute top-3 right-0 z-10">
                <div className="relative">
                  {/* Main banner - ultra compact */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 py-1 shadow-lg">
                    <div className="flex items-center space-x-1">
                      <div className="text-center">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Price</div>
                        <div className="text-sm font-bold">₹{product.price}</div>
                      </div>
                    </div>
                    {/* Arrow point - smaller */}
                    <div className="absolute left-0 top-0 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[6px] border-t-transparent border-b-transparent border-r-orange-500 -translate-x-1.5"></div>
                  </div>
                  {/* Weight tag - ultra compact */}
                  <div className="bg-gray-800 text-white px-1.5 py-0.5 text-xs font-semibold text-center">
                    {product.weight}
                  </div>
                </div>
              </div>

              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 pr-12">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature: any, index: number) => (
                      <div
                        key={index}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${feature.color} border border-opacity-20 hover:scale-105 transition-transform duration-200`}
                      >
                        {getIcon(feature.icon)}
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      addToCart(product, () => setShowAuthModal(true));
                    }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform duration-200" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(product.name)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 group shadow-lg"
                  >
                    <MessageCircle size={20} className="group-hover:animate-pulse" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <Auth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  );
};

export default Products;