import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_URL from '../config/api';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  loading: true,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !user.isGuest) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/${user?.id}`);
      if (response.ok) {
        const userData = await response.json();
        setFavorites(userData.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated || !user || user.isGuest) {
      alert('Please login to add favorites');
      return;
    }

    const isFav = favorites.includes(productId);
    const newFavorites = isFav
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];

    // Optimistic update
    setFavorites(newFavorites);

    try {
      // Update on server
      const response = await fetch(`${API_URL}/users/${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        const updatedUser = {
          ...userData,
          favorites: newFavorites
        };

        await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser)
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert on error
      setFavorites(favorites);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

