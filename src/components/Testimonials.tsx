import React, { useEffect, useState } from 'react';
import { Star, Quote, ShoppingBag } from 'lucide-react';
import API_URL from '../config/api';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  customerName?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  userLocation?: string;
}

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials every 15 seconds
  useEffect(() => {
    if (testimonials.length <= 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move to next pair of testimonials
        const nextIndex = prevIndex + 2;
        // Loop back to start if we've shown all
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      });
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      
      // Fetch reviews
      const reviewsResponse = await fetch(`${API_URL}/reviews?_sort=createdAt&_order=desc&_limit=6`);
      const reviews = await reviewsResponse.json();
      
      // Fetch users to get location data
      const usersResponse = await fetch(`${API_URL}/users`);
      const users = await usersResponse.json();
      
      // Enrich reviews with user location
      const enrichedReviews = reviews.map((review: Review) => {
        const user = users.find((u: any) => u.id === review.userId);
        const customerName = review.customerName || review.userName || 'Customer';
        const location = user?.shippingAddress 
          ? `${user.shippingAddress.city}, ${user.shippingAddress.state}`
          : 'India';
        
        return {
          ...review,
          customerName,
          userLocation: location
        };
      });
      
      setTestimonials(enrichedReviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-amber-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Generate avatar with initials
  const getAvatarInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent color for avatar based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customer reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No customer reviews yet. Be the first to share your experience!</p>
          </div>
        </div>
      </section>
    );
  }

  // Get current 2 testimonials to display
  const displayedTestimonials = testimonials.slice(currentIndex, currentIndex + 2);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">
                {testimonials.length}+ Happy Customers
              </span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-orange-600 bg-clip-text text-transparent mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real reviews from customers who love our authentic spice blends
          </p>
        </div>

        {/* Testimonials Cards - Shows 2 at a time */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {displayedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2"
            >
              {/* Top gradient accent */}
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>
              
              <div className="p-8">
                {/* Rating with Stars */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-1">
                    {renderStars(testimonial.rating)}
                    <span className="ml-2 text-sm font-bold text-gray-900">{testimonial.rating}.0</span>
                  </div>
                  <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    {formatDate(testimonial.createdAt)}
                  </div>
                </div>

                {/* Product Badge */}
                {testimonial.productName && (
                  <div className="mb-5">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-md">
                      <ShoppingBag className="w-4 h-4 text-white mr-2" />
                      <span className="text-sm font-bold text-white">
                        {testimonial.productName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Testimonial Quote */}
                <div className="relative mb-8">
                  <Quote className="absolute -left-2 -top-2 w-10 h-10 text-orange-200 opacity-50" />
                  <blockquote className="relative text-gray-700 text-lg leading-relaxed pl-8 font-medium">
                    "{testimonial.comment.replace(/^["']|["']$/g, '')}"
                  </blockquote>
                  <Quote className="absolute -right-2 bottom-0 w-10 h-10 text-red-200 opacity-50 transform rotate-180" />
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {/* Avatar with gradient */}
                      <div className={`w-14 h-14 rounded-full ${getAvatarColor(testimonial.customerName || 'User')} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white group-hover:ring-orange-100 transition-all duration-300`}>
                        {getAvatarInitials(testimonial.customerName || 'User')}
                      </div>
                      
                      {/* Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 border-3 border-white rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">
                        {testimonial.customerName}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {testimonial.userLocation}
                      </p>
                    </div>
                  </div>

                  {/* Verified Customer Badge */}
                  <div className="hidden sm:flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold text-green-700">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center space-x-2">
          {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 2)}
              className={`transition-all duration-300 ${
                currentIndex === index * 2
                  ? 'w-8 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full'
                  : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonials ${index * 2 + 1} and ${index * 2 + 2}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;