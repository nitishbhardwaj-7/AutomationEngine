import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
 
export default function Wishlist() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { data: products = [], isLoading } = useQuery({
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

  const wishlistProducts = products.filter((p) =>
    user?.wishlist?.includes(p._id)
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-10 w-48 bg-gray-200 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] w-full bg-gray-200"></div>
              <div className="h-4 w-3/4 bg-gray-200"></div>
              <div className="h-4 w-1/2 bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8">Save your favorite items here</p>
        <Link to="/shop">
          <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded tracking-wide">
            Start Shopping
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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {wishlistProducts.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}