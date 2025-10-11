import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomerSupport from './components/CustomerSupport';
import Cart from './components/Cart';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const API_URL = 'http://localhost:3001';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'products', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
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

  if (loading) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Header activeSection={activeSection} onNavClick={handleNavClick} />
          <Hero 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultsCount={filteredProducts.length}
            totalCount={products.length}
            filteredProducts={filteredProducts}
          />
          <Products searchTerm={searchTerm} />
          <Testimonials />
          <About />
          <Contact />
          <Footer />
          <CustomerSupport />
          <Cart />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;