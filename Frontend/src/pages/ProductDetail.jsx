import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (user && product) {
      setIsWishlisted(user.wishlist?.includes(product._id) || false);
    }
  }, [user, product]);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const currentWishlist = user.wishlist || [];
      const newWishlist = isWishlisted
        ? currentWishlist.filter((pid) => pid !== product._id)
        : [...currentWishlist, product._id];
      
      await updateUser({ wishlist: newWishlist });
      return newWishlist;
    },
    onSuccess: () => {
      setIsWishlisted(!isWishlisted);
      queryClient.invalidateQueries(['user']);
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const currentCart = user.cart || [];
      const existingItem = currentCart.find(
        (item) => item.product_id === product._id && item.size === selectedSize
      );

      let newCart;
      if (existingItem) {
        newCart = currentCart.map((item) =>
          item.product_id === product._id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...currentCart, { product_id: product._id, quantity: 1, size: selectedSize }];
      }

      await updateUser({ cart: newCart });
      return newCart;
    },
    onSuccess: () => {
      alert('Added to cart!');
      queryClient.invalidateQueries(['user']);
    }
  });

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleWishlistMutation.mutate();
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    addToCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-3/4 w-full bg-gray-200"></div>
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-gray-200"></div>
            <div className="h-6 w-1/4 bg-gray-200"></div>
            <div className="h-24 w-full bg-gray-200"></div>
            <div className="h-12 w-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500">Product not found</p>
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
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 hover:bg-gray-100 px-3 py-2 rounded transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-3/4 bg-gray-100 overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <div key={index} className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-light">${product.price}</p>
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3 tracking-wide">
                Select Size
              </label>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 border transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || addToCartMutation.isPending}
              className="w-full h-14 bg-black hover:bg-gray-800 text-white tracking-wide rounded transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {addToCartMutation.isPending ? (
                'Adding...'
              ) : !product.in_stock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={toggleWishlistMutation.isPending}
              className="w-full h-14 tracking-wide border border-gray-300 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? 'fill-black' : ''}`}
              />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Product Details */}
          <div className="pt-8 border-t border-gray-200 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 tracking-wide">Category</h3>
              <p className="text-sm text-gray-600 capitalize">{product.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2 tracking-wide">Details</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Premium quality materials</li>
                <li>• Machine washable</li>
                <li>• Free shipping on orders over $100</li>
                <li>• 30-day return policy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}