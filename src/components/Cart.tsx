import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, MessageCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Checkout from './Checkout';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount, isCartOpen, toggleCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    const items = cart.map(item => 
      `${item.quantity}x ${item.name} (${item.weight}) - ₹${item.price}`
    ).join('%0A');
    
    const total = getCartTotal();
    const message = `Hi! I'd like to place an order:%0A%0A${items}%0A%0ATotal: ₹${total}%0A%0APlease confirm availability and delivery details.`;
    const whatsappUrl = `https://wa.me/918179715455?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={toggleCart}
      ></div>

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <p className="text-sm text-white/90">{getCartCount()} item{getCartCount() !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious spices to get started!</p>
              <button
                onClick={toggleCart}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500">{item.weight}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded transition-colors duration-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded transition-colors duration-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{parseFloat(item.price) * item.quantity}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">₹{item.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {/* Delivery Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                🚚 Free delivery on orders above ₹500
              </p>
              {getCartTotal() < 500 && (
                <p className="text-xs text-blue-600 mt-1">
                  Add ₹{500 - getCartTotal()} more for free delivery
                </p>
              )}
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-2xl font-bold text-gray-900">₹{getCartTotal()}</span>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <CreditCard className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </button>

            {/* WhatsApp Checkout (Alternative) */}
            <button
              onClick={handleCheckout}
              className="w-full mt-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Or Order via WhatsApp</span>
            </button>

            {/* Continue Shopping */}
            <button
              onClick={toggleCart}
              className="w-full mt-3 text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <Checkout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </>
  );
};

export default Cart;

