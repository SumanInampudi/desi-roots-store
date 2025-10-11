import { useState, useEffect } from 'react';
import API_URL from '../config/api';

interface Review {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductRating {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export const useProductReviews = (productId: string | null) => {
  const [productRating, setProductRating] = useState<ProductRating>({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/reviews?productId=${productId}&_sort=createdAt&_order=desc`);
        if (response.ok) {
          const reviews: Review[] = await response.json();
          
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const avgRating = totalRating / reviews.length;
            
            setProductRating({
              averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
              totalReviews: reviews.length,
              reviews
            });
          } else {
            setProductRating({
              averageRating: 0,
              totalReviews: 0,
              reviews: []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching product reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return { productRating, loading };
};

// Hook to fetch all product ratings at once (for product lists)
export const useAllProductRatings = (productIds: string[]) => {
  const [ratings, setRatings] = useState<Record<string, { averageRating: number; totalReviews: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAllRatings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/reviews`);
        if (response.ok) {
          const allReviews: Review[] = await response.json();
          
          // Group reviews by product ID and calculate ratings
          const ratingsMap: Record<string, { averageRating: number; totalReviews: number }> = {};
          
          productIds.forEach(productId => {
            const productReviews = allReviews.filter(review => review.productId === productId);
            
            if (productReviews.length > 0) {
              const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
              const avgRating = totalRating / productReviews.length;
              
              ratingsMap[productId] = {
                averageRating: Math.round(avgRating * 10) / 10,
                totalReviews: productReviews.length
              };
            } else {
              ratingsMap[productId] = {
                averageRating: 0,
                totalReviews: 0
              };
            }
          });
          
          setRatings(ratingsMap);
        }
      } catch (error) {
        console.error('Error fetching all product ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRatings();
  }, [JSON.stringify(productIds)]);

  return { ratings, loading };
};

