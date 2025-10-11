import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, XCircle, Truck, RefreshCw, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: string;
  weight: string;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/orders?userId=${user?.id}&_sort=createdAt&_order=desc`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    
    // Fetch full product details and add to cart
    try {
      for (const item of order.items) {
        const productResponse = await fetch(`http://localhost:3001/products/${item.productId}`);
        if (productResponse.ok) {
          const product = await productResponse.json();
          // Add each item the specified number of times
          for (let i = 0; i < item.quantity; i++) {
            addToCart(product);
          }
        }
      }
      
      // Show success message briefly
      setTimeout(() => {
        setReorderingId(null);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error reordering:', error);
      setReorderingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Order History Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 transform transition-all duration-300 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Order History</h2>
                <p className="text-sm text-white/90 mt-1">View and manage your orders</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-20 h-20 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  const isReordering = reorderingId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      {/* Order Header */}
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600">Order ID:</span>
                            <span className="text-sm font-bold text-gray-900 font-mono">#{order.id}</span>
                          </div>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="text-sm font-semibold capitalize">{order.status}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-4 h-4" />
                              <span>{order.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-600">Total: </span>
                            <span className="text-lg font-bold text-orange-600">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Summary */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{order.items.length}</span> item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <button
                            onClick={() => toggleOrderExpand(order.id)}
                            className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Collapsed View - Show first item */}
                        {!isExpanded && (
                          <div className="text-sm text-gray-700">
                            {order.items[0].quantity}x {order.items[0].productName}
                            {order.items.length > 1 && <span className="text-gray-500"> and {order.items.length - 1} more...</span>}
                          </div>
                        )}

                        {/* Expanded View - Show all details */}
                        {isExpanded && (
                          <div className="space-y-4 mt-4">
                            {/* Items List */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2">Order Items:</h4>
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-900">{item.productName}</span>
                                    <span className="text-gray-500 ml-2">({item.weight})</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-600">Qty: {item.quantity}</span>
                                    <span className="font-semibold text-gray-900 min-w-[80px] text-right">
                                      ₹{parseFloat(item.price) * item.quantity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                Shipping Address:
                              </h4>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p>{order.shippingAddress.addressLine1}</p>
                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reorder Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleReorder(order)}
                            disabled={isReordering}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                          >
                            {isReordering ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Adding to Cart...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-5 h-5" />
                                <span>Reorder Items</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;

