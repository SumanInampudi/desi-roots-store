import React, { useState } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, Package, BarChart3 } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';
import OrderHistory from './OrderHistory';
import AdminDashboard from './AdminDashboard';

interface HeaderProps {
  activeSection: string;
  onNavClick: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { getCartCount, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact Us' }
  ];

  return (
    <>
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-red-800 bg-red-50'
                    : 'text-gray-700 hover:text-red-800 hover:bg-red-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* User/Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block">
                    {user?.name}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminDashboard(true)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-md transition-colors duration-200 shadow-md"
                    title="Admin Dashboard"
                  >
                    <BarChart3 size={18} />
                    <span className="hidden lg:inline">Dashboard</span>
                  </button>
                )}
                <button
                  onClick={() => setShowOrderHistory(true)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
                  title="My Orders"
                >
                  <Package size={18} />
                  <span className="hidden lg:inline">Orders</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-800 transition-colors duration-200 group"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} className="group-hover:scale-110 transition-transform duration-200" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                  {getCartCount()}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile menu button and cart */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-800 transition-colors duration-200"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-red-800 hover:bg-red-50"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavClick(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-red-800 bg-red-50'
                      : 'text-gray-700 hover:text-red-800 hover:bg-red-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile Auth Section */}
              <div className="border-t pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowAdminDashboard(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
                      >
                        <BarChart3 size={18} />
                        <span className="font-medium">Admin Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowOrderHistory(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200"
                    >
                      <Package size={18} />
                      <span className="font-medium">My Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
                  >
                    <User size={18} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Modals - Rendered outside header for proper z-index stacking */}
    {/* Auth Modal */}
    <Auth isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    
    {/* Order History Modal */}
    <OrderHistory isOpen={showOrderHistory} onClose={() => setShowOrderHistory(false)} />
    
    {/* Admin Dashboard Modal */}
    <AdminDashboard isOpen={showAdminDashboard} onClose={() => setShowAdminDashboard(false)} />
    </>
  );
};

export default Header;