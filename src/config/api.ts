// API Configuration
// This file centralizes all API endpoint configuration
// Uses environment variables for different deployment environments

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to build API endpoints
export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};

export default API_URL;

