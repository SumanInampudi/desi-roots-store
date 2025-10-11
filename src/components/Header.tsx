import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, Package, BarChart3, TrendingUp, Receipt, ChevronDown, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';
import OrderHistory from './OrderHistory';
import AdminDashboard from './AdminDashboard';
import RevenueChart from './RevenueChart';
import ExpenseDashboard from './ExpenseDashboard';
import API_URL from '../config/api';

interface HeaderProps {
  activeSection: string;
  onNavClick: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showRevenueChart, setShowRevenueChart] = useState(false);
  const [showExpenseDashboard, setShowExpenseDashboard] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [orders, setOrders] = useState([]);
  const { getCartCount, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  // Close admin dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    };

    if (showAdminDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAdminDropdown]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserDropdown]);

  // Fetch orders for revenue chart when admin views it
  useEffect(() => {
    if (showRevenueChart && isAdmin) {
      fetchOrders();
    }
  }, [showRevenueChart, isAdmin]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders?_sort=createdAt&_order=desc`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

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

            {/* Admin Menu Dropdown */}
            {isAdmin && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboards</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${showAdminDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showAdminDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setShowAdminDashboard(true);
                          setShowAdminDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                      >
                        <BarChart3 size={18} className="text-red-600" />
                        <div className="text-left">
                          <div className="font-semibold">Admin Dashboard</div>
                          <div className="text-xs text-gray-500">Orders & Analytics</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowRevenueChart(true);
                          setShowAdminDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                      >
                        <TrendingUp size={18} className="text-green-600" />
                        <div className="text-left">
                          <div className="font-semibold">Revenue Analytics</div>
                          <div className="text-xs text-gray-500">Earnings & Trends</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowExpenseDashboard(true);
                          setShowAdminDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Receipt size={18} className="text-orange-600" />
                        <div className="text-left">
                          <div className="font-semibold">Expense Management</div>
                          <div className="text-xs text-gray-500">Track & Analyze Costs</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User/Auth Button */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 border-2 border-gray-300">
                      <User size={18} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block">
                    {user?.name}
                  </span>
                  <ChevronDown size={16} className={`hidden lg:block transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowOrderHistory(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <Package size={18} className="text-orange-600" />
                      <div className="text-left">
                        <div className="font-semibold">My Orders</div>
                        <div className="text-xs text-gray-500">View order history</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut size={18} className="text-red-600" />
                      <div className="text-left">
                        <div className="font-semibold">Logout</div>
                        <div className="text-xs text-gray-500">Sign out of account</div>
                      </div>
                    </button>
                  </div>
                )}
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

              {/* Admin Menu Items - Mobile */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-3 py-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin Tools</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAdminDashboard(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                  >
                    <BarChart3 size={18} className="text-red-600" />
                    <div>
                      <div className="font-semibold">Admin Dashboard</div>
                      <div className="text-xs text-gray-500">Orders & Analytics</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowRevenueChart(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                  >
                    <TrendingUp size={18} className="text-green-600" />
                    <div>
                      <div className="font-semibold">Revenue Analytics</div>
                      <div className="text-xs text-gray-500">Earnings & Trends</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowExpenseDashboard(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Receipt size={18} className="text-orange-600" />
                    <div>
                      <div className="font-semibold">Expense Management</div>
                      <div className="text-xs text-gray-500">Track & Analyze Costs</div>
                    </div>
                  </button>
                </>
              )}

              {/* Mobile Auth Section */}
              <div className="border-t pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 border-2 border-gray-300">
                          <User size={22} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
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
    
    {/* Revenue Chart Modal */}
    {isAdmin && (
      <RevenueChart 
        isOpen={showRevenueChart} 
        onClose={() => setShowRevenueChart(false)}
        orders={orders}
      />
    )}
    
    {/* Expense Dashboard Modal */}
    {isAdmin && (
      <ExpenseDashboard 
        isOpen={showExpenseDashboard} 
        onClose={() => setShowExpenseDashboard(false)}
      />
    )}
    </>
  );
};

export default Header;