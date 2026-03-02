import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (user && product) {
      setIsWishlisted(user.wishlist?.includes(product._id) || false);
    }
  }, [user, product]);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const currentWishlist = user.wishlist || [];
      const newWishlist = isWishlisted
        ? currentWishlist.filter((id) => id !== product._id)
        : [...currentWishlist, product._id];

      await updateUser({ wishlist: newWishlist });
      return newWishlist;
    },
    onSuccess: () => {
      setIsWishlisted(!isWishlisted);
      queryClient.invalidateQueries(['user']);
    }
  });

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    toggleWishlistMutation.mutate();
  };

  return (
    <Link to={`/product/${product._id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group cursor-pointer"
      >
        <div className="relative aspect-3/4 bg-gray-100 overflow-hidden mb-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium tracking-wide">OUT OF STOCK</span>
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            disabled={toggleWishlistMutation.isPending}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted ? 'fill-black text-black' : 'text-black'
              }`}
            />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium tracking-wide group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">${product.price}</p>
        </div>
      </motion.div>
    </Link>
  );
}