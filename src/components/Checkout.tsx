import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Mail, Home, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(true);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Load saved shipping address when component mounts
  useEffect(() => {
    if (isOpen && user && !user.isGuest) {
      loadSavedAddress();
    }
  }, [isOpen, user]);

  const loadSavedAddress = async () => {
    // Skip for guest users
    if (user?.isGuest) return;
    
    try {
      setLoadingAddress(true);
      const response = await fetch(`${API_URL}/users/${user?.id}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.shippingAddress) {
          setShippingAddress({
            fullName: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            addressLine1: userData.shippingAddress.addressLine1 || '',
            addressLine2: userData.shippingAddress.addressLine2 || '',
            city: userData.shippingAddress.city || '',
            state: userData.shippingAddress.state || '',
            pincode: userData.shippingAddress.pincode || ''
          });
        } else {
          // Set user's basic info if no saved address
          setShippingAddress(prev => ({
            ...prev,
            fullName: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
          }));
        }
      }
    } catch (err) {
      console.error('Error loading address:', err);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate shipping charges
  const calculateShipping = (subtotal: number) => {
    if (subtotal >= 1000) {
      return 0; // Free shipping
    } else if (subtotal >= 500) {
      return Math.round(subtotal * 0.05); // 5% of subtotal
    } else {
      return 50; // Flat ₹50
    }
  };

  const subtotal = getCartTotal();
  const shippingCharges = calculateShipping(subtotal);
  const totalAmount = subtotal + shippingCharges;

  const validateForm = () => {
    if (!shippingAddress.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!shippingAddress.email.trim() || !shippingAddress.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!shippingAddress.phone.trim() || shippingAddress.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!shippingAddress.addressLine1.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!shippingAddress.state.trim()) {
      setError('Please enter your state');
      return false;
    }
    if (!shippingAddress.pincode.trim() || shippingAddress.pincode.length < 6) {
      setError('Please enter a valid pincode');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create order object
      const orderSubtotal = getCartTotal();
      const orderShipping = calculateShipping(orderSubtotal);
      const orderTotal = orderSubtotal + orderShipping;
      const orderProfit = Math.round(orderSubtotal * 0.30); // 30% profit margin on product cost
      
      const order = {
        userId: user?.id,
        customerName: shippingAddress.fullName,
        customerEmail: shippingAddress.email,
        customerPhone: shippingAddress.phone,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight
        })),
        subtotal: orderSubtotal,
        shippingCharges: orderShipping,
        totalAmount: orderTotal,
        profit: orderProfit,
        paymentMethod: 'Cash on Delivery',
        status: 'pending',
        shippingAddress: {
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save order to backend
      const orderResponse = await fetch('${API_URL}/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to place order');
      }

      // Update user's shipping address (skip for guest users)
      if (!user?.isGuest) {
        const userResponse = await fetch(`${API_URL}/users/${user?.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const updatedUser = {
            ...userData,
            shippingAddress: {
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              pincode: shippingAddress.pincode
            }
          };

          await fetch(`${API_URL}/users/${user?.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser)
          });
        }
      }

      // Show success state
      setSuccess(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
        setSuccess(false);
        onClose();
      }, 2500);

    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Checkout Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 transform transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Checkout</h2>
              <p className="text-sm text-white/90 mt-1">Cash on Delivery</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-1">Thank you for your order</p>
              <p className="text-sm text-gray-500">You will receive a confirmation call shortly</p>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {loadingAddress ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-orange-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={shippingAddress.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={shippingAddress.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={shippingAddress.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                        Shipping Address
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            name="addressLine1"
                            value={shippingAddress.addressLine1}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="House/Flat No., Street Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            name="addressLine2"
                            value={shippingAddress.addressLine2}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Landmark, Area"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={shippingAddress.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Hyderabad"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={shippingAddress.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Telangana"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              name="pincode"
                              value={shippingAddress.pincode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="500001"
                              maxLength={6}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name} ({item.weight})
                            </span>
                            <span className="font-semibold text-gray-900">
                              ₹{parseFloat(item.price) * item.quantity}
                            </span>
                          </div>
                        ))}
                        
                        <div className="border-t border-gray-300 pt-2 mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold text-gray-900">₹{subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping Charges:</span>
                            <span className="font-semibold text-gray-900">
                              {shippingCharges === 0 ? (
                                <span className="text-green-600">FREE</span>
                              ) : (
                                `₹${shippingCharges}`
                              )}
                            </span>
                          </div>
                          {subtotal < 1000 && (
                            <p className="text-xs text-gray-500 italic">
                              {subtotal < 500 
                                ? `Add ₹${500 - subtotal} more for 5% shipping (instead of ₹50)`
                                : `Add ₹${1000 - subtotal} more for FREE shipping!`
                              }
                            </p>
                          )}
                        </div>
                        
                        <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-gray-900 text-base">Total Amount:</span>
                          <span className="font-bold text-orange-600 text-lg">₹{totalAmount}</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-green-600 font-medium pt-2">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Cash on Delivery
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loadingAddress && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Place Order (₹{totalAmount})</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;

