/**
 * Authentication utility functions
 * Handles token expiration, validation, and user warnings
 */

import { notifyError, notifyInfo } from './notificationUtils';

/**
 * Check if token is expired by decoding it (without verification)
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode token without verification (just to check expiration)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    
    // Check if token has expiration
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, assume expired
  }
};

/**
 * Handle token expiration - clear storage and show warning
 * @param {boolean} showWarning - Whether to show warning to user
 * @param {Function} redirectCallback - Optional callback to redirect (e.g., router.push)
 */
export const handleTokenExpiration = (showWarning = true, redirectCallback = null) => {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  if (showWarning) {
    notifyError(
      'Session Expired',
      'Your session has expired. Please log in again to continue.'
    );
  }
  
  // Redirect to login if callback provided
  if (redirectCallback && typeof redirectCallback === 'function') {
    // Small delay to let notification show
    setTimeout(() => {
      redirectCallback('/registration/LoginPage');
    }, 1500);
  }
};

/**
 * Check token before making API call and handle expiration
 * @param {Function} apiCall - The API call function
 * @param {Function} redirectCallback - Optional redirect callback
 * @returns {Promise} The API call result
 */
export const checkTokenAndCall = async (apiCall, redirectCallback = null) => {
  const token = localStorage.getItem('token');
  
  // Check if token exists
  if (!token) {
    if (redirectCallback) {
      redirectCallback('/registration/LoginPage');
    }
    throw new Error('No token found. Please log in.');
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    handleTokenExpiration(true, redirectCallback);
    throw new Error('Token expired. Please log in again.');
  }
  
  try {
    const response = await apiCall();
    
    // Check for 401 response (token expired on server)
    if (response && response.status === 401) {
      handleTokenExpiration(true, redirectCallback);
      throw new Error('Session expired. Please log in again.');
    }
    
    return response;
  } catch (error) {
    // If it's already a token expiration error, re-throw it
    if (error.message.includes('expired') || error.message.includes('token')) {
      throw error;
    }
    
    // For other errors, check if it's a 401
    if (error.response && error.response.status === 401) {
      handleTokenExpiration(true, redirectCallback);
      throw new Error('Session expired. Please log in again.');
    }
    
    throw error;
  }
};

/**
 * Wrapper for fetch that automatically handles token expiration
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @param {Function} redirectCallback - Optional redirect callback
 * @returns {Promise<Response>} Fetch response
 */
export const fetchWithAuth = async (url, options = {}, redirectCallback = null) => {
  const token = localStorage.getItem('token');
  
  // Add token to headers if it exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    
    // Check if token is expired before making request
    if (isTokenExpired(token)) {
      handleTokenExpiration(true, redirectCallback);
      throw new Error('Token expired. Please log in again.');
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 response
  if (response.status === 401) {
    handleTokenExpiration(true, redirectCallback);
    throw new Error('Session expired. Please log in again.');
  }
  
  return response;
};

