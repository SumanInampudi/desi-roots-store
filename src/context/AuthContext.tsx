import React, { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../config/api';

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message: string }>;
  continueAsGuest: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('desiRootsUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('desiRootsUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('desiRootsUser');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Fetch all users and find matching credentials
      const response = await fetch(`${API_URL}/users?email=${email}`);
      const users = await response.json();

      if (users.length === 0) {
        return { success: false, message: 'User not found. Please register first.' };
      }

      const foundUser = users[0];

      // In production, passwords should be hashed and compared securely
      if (foundUser.password !== password) {
        return { success: false, message: 'Invalid password. Please try again.' };
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);

      return { success: true, message: 'Login successful!' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user already exists
      const checkResponse = await fetch(`${API_URL}/users?email=${email}`);
      const existingUsers = await checkResponse.json();

      if (existingUsers.length > 0) {
        return { success: false, message: 'Email already registered. Please login instead.' };
      }

      // Create new user
      const newUser = {
        name,
        email,
        password, // In production, this should be hashed
        role: 'customer',
        phone,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        return { success: false, message: 'Registration failed. Please try again.' };
      }

      const createdUser = await response.json();
      const { password: _, ...userWithoutPassword } = createdUser;
      setUser(userWithoutPassword);

      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('desiRootsUser');
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@desiproots.com',
      role: 'guest',
      phone: '',
      createdAt: new Date().toISOString(),
      isGuest: true
    };
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        continueAsGuest,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

