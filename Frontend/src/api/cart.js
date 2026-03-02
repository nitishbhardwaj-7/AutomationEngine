import axios from './axios';

export const cartAPI = {
  getCart: async () => {
    const { data } = await axios.get('/cart');
    return data;
  },

  addToCart: async (product_id, quantity, size) => {
    const { data } = await axios.post('/cart/add', {
      product_id,
      quantity,
      size
    });
    return data;
  },

  updateCartItem: async (product_id, size, quantity) => {
    const { data } = await axios.put('/cart/update', {
      product_id,
      size,
      quantity
    });
    return data;
  },

  removeFromCart: async (product_id, size) => {
    const { data } = await axios.delete('/cart/remove', {
      data: { product_id, size }
    });
    return data;
  },

  clearCart: async () => {
    const { data } = await axios.delete('/cart/clear');
    return data;
  }
};