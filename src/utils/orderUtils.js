/**
 * Order utility functions for managing orders
 */

/**
 * Update order status on backend
 * @param {string} orderId - ID of order to update
 * @param {string} status - New status (received, preparing, completed, shipped)
 * @returns {Promise<Object>} Response data
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) throw new Error('Authentication required');

    const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order status');
    }

    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Fetch all orders for admin
 * @returns {Promise<Array>} Array of orders
 */
export const fetchAllOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) return [];

    const response = await fetch(`${apiUrl}/api/orders/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Use 'invoices' as fallback if 'orders' is not present
      return data.data?.orders || data.data?.invoices || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

/**
 * Fetch personal order history for the logged-in user
 * @returns {Promise<Array>} Array of orders
 */
export const fetchUserOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) return [];

    const response = await fetch(`${apiUrl}/api/orders/my-orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.orders || data.data?.invoices || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

/**
 * Fetch detailed information for a specific order
 * @param {string} orderId - ID of order to fetch
 * @returns {Promise<Object>} Order detail object
 */
export const fetchOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) throw new Error('Authentication required');

    const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.order || data.data?.invoice || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

/**
 * Upload delivery confirmation for an order
 * @param {string} orderId - ID of order
 * @param {Object} deliveryData - Delivery details (image, date, time, sender, etc.)
 * @returns {Promise<Object>} Response data
 */
export const uploadDeliveryConfirmation = async (orderId, deliveryData) => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) throw new Error('Authentication required');

    const response = await fetch(`${apiUrl}/api/orders/${orderId}/delivery-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deliveryData),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to upload delivery confirmation');
    }

    return data;
  } catch (error) {
    console.error('Error uploading delivery confirmation:', error);
    throw error;
  }
};

/**
 * Dispatch an order using QR code method
 * @param {string} orderId - ID of order to dispatch
 * @returns {Promise<Object>} Response data containing qr_url and order
 */
export const dispatchOrderWithQR = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
    
    if (!token || !apiUrl) throw new Error('Authentication required');

    const response = await fetch(`${apiUrl}/api/orders/${orderId}/dispatch-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch order with QR');
    }

    return data;
  } catch (error) {
    console.error('Error dispatching order with QR:', error);
    throw error;
  }
};
