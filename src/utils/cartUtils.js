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

/**
 * addToCart - เพิ่มสินค้าลงตะกร้า
 * @param {object} product - ข้อมูลสินค้า
 * @param {number} quantityToAdd - จำนวนที่จะเพิ่ม
 * @param {object|null} sellingOption - { label, unit, price } สำหรับสินค้าที่มีตัวเลือกการขาย เช่น กล้วย
 *   ถ้าเป็น null จะใช้ unit/price จาก product ตามปกติ
 */
export const addToCart = (product, quantityToAdd = 1, sellingOption = null) => {
  try {
    const cart = getCart();

    // ถ้ามี sellingOption ให้ใช้ cartKey = id_unit เพื่อแยกรายการในตะกร้า
    const cartKey = sellingOption
      ? `${product.id}_${sellingOption.unit}`
      : `${product.id}_default`;

    const existingItemIndex = cart.findIndex(item => item.cartKey === cartKey);

    if (existingItemIndex >= 0) {
      // มีอยู่แล้ว เพิ่มจำนวน
      cart[existingItemIndex].quantity += quantityToAdd;
    } else {
      // เพิ่มรายการใหม่
      cart.push({
        cartKey,
        id: product.id,
        name: product.name,
        // ถ้ามี sellingOption ใช้ราคาและหน่วยจาก option
        price: sellingOption ? sellingOption.price : product.price,
        image: product.image,
        stock: product.stock,
        unit: sellingOption ? sellingOption.unit : (product.unit || 'kg'),
        selected_label: sellingOption ? sellingOption.label : null,
        quantity: quantityToAdd
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return getCart();
  }
};

export const removeFromCart = (cartKey) => {
  try {
    const cart = getCart();
    // รองรับทั้ง cartKey ใหม่ และ id เดิม (backward compatibility)
    const updatedCart = cart.filter(item => item.cartKey !== cartKey && item.id !== cartKey);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCart();
  }
};

export const updateCartItemQuantity = (cartKey, quantity) => {
  try {
    const cart = getCart();
    // รองรับทั้ง cartKey ใหม่ และ id เดิม
    const itemIndex = cart.findIndex(item => item.cartKey === cartKey || item.id === cartKey);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        return removeFromCart(cartKey);
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
  // Count the number of unique items in the cart (not total weight/quantity)
  return cart.length;
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};
