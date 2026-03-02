import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: '',
    phone: '',
    payment_method: 'card'
  });

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
      if (cart.length === 0) {
        navigate('/cart');
      }
      const items = cart
        .map((item) => {
          const product = products.find((p) => p._id === item.product_id);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean);
      setCartItems(items);
      setFormData((prev) => ({ ...prev, full_name: user.full_name || '' }));
    }
  }, [user, products, navigate]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const { data } = await axios.post('/api/orders', orderData);
      return data;
    },
    onSuccess: async () => {
      await updateUser({ cart: [] });
      setOrderComplete(true);
    }
  });

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderItems = cartItems.map((item) => ({
      product_id: item.product._id,
      product_name: item.product.name,
      product_image: item.product.image_url,
      quantity: item.quantity,
      size: item.size,
      price: item.product.price
    }));

    createOrderMutation.mutate({
      items: orderItems,
      total: getTotal(),
      shipping_address: {
        full_name: formData.full_name,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        phone: formData.phone
      },
      payment_method: formData.payment_method,
      status: 'pending'
    });
  };

  if (orderComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your order. You'll receive a confirmation email shortly.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded tracking-wide"
        >
          Continue Shopping
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 tracking-wide">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 tracking-wide">Payment Method</h2>
            <div className="p-4 border border-gray-200 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                Payment processing is simulated for this demo.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white tracking-wide rounded transition-colors disabled:bg-gray-400"
          >
            {createOrderMutation.isPending ? 'Processing...' : `Place Order - $${getTotal().toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <div className="border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 tracking-wide">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.product_id}-${item.size}`} className="flex gap-3">
                  <div className="w-16 h-20 bg-gray-100 flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-500 text-xs">Size: {item.size}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    <p className="font-medium mt-1">${item.product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}