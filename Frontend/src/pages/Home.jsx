import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
  const { data } = await axios.get('/api/products?featured=true');
  const products = Array.isArray(data) ? data : data.products; // handle both
  return products?.slice(0, 4) || [];
}
  });

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gray-50">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="Hero"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            VERME.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light tracking-wide">
            Minimal. Modern. Timeless. Redefining contemporary fashion.
          </p>
          <Link to="/shop">
            <button className="bg-white text-black hover:bg-gray-100 font-medium tracking-wide px-8 py-3 rounded transition-colors inline-flex items-center gap-2">
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Featured Collection
          </h2>
          <p className="text-gray-500 text-sm tracking-wide">
            Handpicked pieces for the modern wardrobe
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-3/4 w-full bg-gray-200"></div>
                <div className="h-4 w-3/4 bg-gray-200"></div>
                <div className="h-4 w-1/2 bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No featured products available
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/shop">
            <button className="px-8 py-3 border border-gray-300 rounded hover:bg-gray-100 transition-colors tracking-wide">
              View All Products
            </button>
          </Link>
        </div>
      </section>

      {/* Brand Values */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">✦</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-wide">Premium Quality</h3>
              <p className="text-sm text-gray-600">
                Crafted with the finest materials for lasting comfort and style
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">✧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-wide">Minimal Design</h3>
              <p className="text-sm text-gray-600">
                Clean lines and timeless aesthetics that never go out of style
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">✦</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-wide">Sustainable</h3>
              <p className="text-sm text-gray-600">
                Ethically produced with respect for people and planet
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}