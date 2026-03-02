import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('all');

 const { data: products = [], isLoading, isError } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const res = await axios.get('/api/products');
    if (!Array.isArray(res.data)) {
      // Something went wrong (e.g. backend error)
      return [];
    }
    return res.data;
  },
});
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'unisex', label: 'Unisex' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Shop</h1>
        <p className="text-gray-500 text-sm tracking-wide">
          Discover our complete collection
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-6 py-2 text-sm tracking-wide whitespace-nowrap transition-all ${
              selectedCategory === category.value
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-3/4 w-full bg-gray-200"></div>
              <div className="h-4 w-3/4 bg-gray-200"></div>
              <div className="h-4 w-1/2 bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
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
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-sm">No products found in this category</p>
        </div>
      )}
    </div>
  );
}