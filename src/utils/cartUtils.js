// Cart utility functions for managing cart in localStorage

export const getCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

export const addToCart = (product) => {
  try {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // If item already exists, increase quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return getCart();
  }
};

export const removeFromCart = (productId) => {
  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCart();
  }
};

export const updateCartItemQuantity = (productId, quantity) => {
  try {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return removeFromCart(productId);
      }
      cart[itemIndex].quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    return cart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return getCart();
  }
};

export const clearCart = () => {
  try {
    localStorage.removeItem('cart');
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    return getCart();
  }
};

export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

