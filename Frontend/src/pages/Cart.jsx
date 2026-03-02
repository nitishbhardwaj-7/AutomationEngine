import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [cartItems, setCartItems] = useState([]);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get('/api/products');
      return data;
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user && products.length > 0) {
      const cart = user.cart || [];
      const items = cart
        .map((item) => {
          const product = products.find((p) => p._id === item.product_id);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean);
      setCartItems(items);
    }
  }, [user, products]);

  const updateCartMutation = useMutation({
    mutationFn: async (newCart) => {
      await updateUser({ cart: newCart });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    }
  });

  const updateQuantity = (productId, size, delta) => {
    const currentCart = user.cart || [];
    const newCart = currentCart
      .map((item) => {
        if (item.product_id === productId && item.size === size) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
      .filter(Boolean);

    updateCartMutation.mutate(newCart);
  };

  const removeItem = (productId, size) => {
    const currentCart = user.cart || [];
    const newCart = currentCart.filter(
      (item) => !(item.product_id === productId && item.size === size)
    );

    updateCartMutation.mutate(newCart);
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  if (!user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some items to get started</p>
        <Link to="/shop">
          <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded tracking-wide">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="space-y-6 mb-8">
        {cartItems.map((item, index) => (
          <motion.div
            key={`${item.product_id}-${item.size}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex gap-4 border-b border-gray-200 pb-6"
          >
            <Link
              to={`/product/${item.product._id}`}
              className="w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden"
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </Link>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link
                  to={`/product/${item.product._id}`}
                  className="text-lg font-medium hover:text-gray-600 transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                <p className="text-sm font-medium mt-2">${item.product.price}</p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 border border-gray-300">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.size, -1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.size, 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.product_id, item.size)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium">Subtotal</span>
          <span className="text-2xl font-bold">${getTotal().toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Shipping calculated at checkout</p>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full h-14 bg-black hover:bg-gray-800 text-white tracking-wide rounded transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </motion.div>
  );
}