import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, XCircle, Truck, RefreshCw, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';

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
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<Record<string, { hasReviewed: boolean; rating: number }>>({});
  const [hoveredStar, setHoveredStar] = useState<{ key: string; rating: number } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders?userId=${user?.id}&_sort=createdAt&_order=desc`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        
        // Check which products have been reviewed
        checkReviewedProducts(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewedProducts = async (orders: Order[]) => {
    try {
      // Check reviews for this user
      const reviewResponse = await fetch(`${API_URL}/reviews?userId=${user?.id}`);
      if (reviewResponse.ok) {
        const reviews = await reviewResponse.json();
        const reviewedMap: Record<string, { hasReviewed: boolean; rating: number }> = {};
        
        reviews.forEach((review: any) => {
          const key = `${review.productId}-${review.orderId}`;
          reviewedMap[key] = {
            hasReviewed: true,
            rating: review.rating
          };
        });
        
        setProductReviews(reviewedMap);
      }
    } catch (error) {
      console.error('Error checking reviewed products:', error);
    }
  };

  const handleStarClick = async (productId: string, productName: string, orderId: string, rating: number) => {
    try {
      const review = {
        productId,
        productName,
        orderId,
        userId: user?.id,
        customerName: user?.name || 'Anonymous',
        rating,
        comment: '', // No comment, just rating
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      if (response.ok) {
        // Update local state
        const key = `${productId}-${orderId}`;
        setProductReviews(prev => ({
          ...prev,
          [key]: { hasReviewed: true, rating }
        }));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    
    // Fetch full product details and add to cart
    try {
      for (const item of order.items) {
        const productResponse = await fetch(`${API_URL}/products/${item.productId}`);
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
              <div className="space-y-3">
                {orders.map((order) => {
                  const isReordering = reorderingId === order.id;
                  const canReview = order.status.toLowerCase() === 'delivered';

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-orange-300 transition-all"
                    >
                      {/* Compact Order Header - Single Line */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-semibold text-gray-900">#{order.id}</span>
                          <span className="text-gray-400">•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="text-sm font-bold text-orange-600">
                          ₹{order.totalAmount}
                        </div>
                      </div>

                      {/* Compact Items List */}
                      <div className="space-y-1.5 mb-2">
                        {order.items.map((item, index) => {
                          const reviewKey = `${item.productId}-${order.id}`;
                          const reviewData = productReviews[reviewKey];
                          const userRating = reviewData?.rating || 0;

                          return (
                            <div key={index} className="flex items-center justify-between text-xs">
                              {/* Item info - inline */}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-gray-900 font-medium">{item.quantity}x</span>
                                <span className="text-gray-700 truncate">{item.productName}</span>
                                <span className="text-gray-500">({item.weight})</span>
                              </div>
                              
                              {/* Price and inline stars */}
                              <div className="flex items-center gap-3 ml-2">
                                <span className="font-semibold text-gray-900">₹{parseFloat(item.price) * item.quantity}</span>
                                
                                {/* Inline Star Rating - Only for delivered */}
                                {canReview && (
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const isHovered = hoveredStar?.key === reviewKey && hoveredStar.rating >= star;
                                      const isFilled = userRating >= star;
                                      const isActive = isHovered || isFilled;
                                      
                                      return (
                                        <button
                                          key={star}
                                          onClick={() => handleStarClick(item.productId, item.productName, order.id, star)}
                                          onMouseEnter={() => setHoveredStar({ key: reviewKey, rating: star })}
                                          onMouseLeave={() => setHoveredStar(null)}
                                          className="transition-transform hover:scale-125"
                                          disabled={reviewData?.hasReviewed}
                                          title={reviewData?.hasReviewed ? `Rated ${userRating} stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                          <Star 
                                            className={`w-4 h-4 transition-colors ${
                                              isActive 
                                                ? 'text-yellow-500 fill-yellow-500' 
                                                : 'text-gray-300'
                                            } ${reviewData?.hasReviewed ? 'cursor-default' : 'cursor-pointer'}`}
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reorder Button - Bottom */}
                      <button
                        onClick={() => handleReorder(order)}
                        disabled={isReordering}
                        className="w-full mt-2 py-1.5 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {isReordering ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            <span>Reorder</span>
                          </>
                        )}
                      </button>
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

