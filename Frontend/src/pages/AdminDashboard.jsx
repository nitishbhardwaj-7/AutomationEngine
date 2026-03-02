import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editingProduct, setEditingProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [smartMode, setSmartMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'men',
    sizes: [],
    in_stock: true,
    featured: false
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/products');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/api/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      queryClient.invalidateQueries(['products']);
      resetForm();
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/api/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      queryClient.invalidateQueries(['products']);
      resetForm();
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      queryClient.invalidateQueries(['products']);
    }
  });

  const resetForm = () => {
  setFormData({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'men',
    sizes: [],
    in_stock: true,
    featured: false
  });
  setEditingProduct(null);
  setSmartMode(false);
};

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url,
      category: product.category,
      sizes: product.sizes || [],
      in_stock: product.in_stock,
      featured: product.featured || false
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      price: parseFloat(formData.price)
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSmartSubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: formData.name,
    price: parseFloat(formData.price),
    image_url: formData.image_url
  };

  try {
    await axios.post('/api/products/smart-create', data);

    queryClient.invalidateQueries(['adminProducts']);
    queryClient.invalidateQueries(['products']);

    resetForm();
    setSmartMode(false);
    setDialogOpen(false);
  } catch (error) {
    console.error(error);
    alert('Smart creation failed');
  }
};

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size]
    }));
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {dialogOpen && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">

      {/* Header + Smart Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>

        {!editingProduct && (
          <button
            type="button"
            onClick={() => setSmartMode((prev) => !prev)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
          >
            {smartMode ? 'Switch to Manual' : '⚡ Smart Automation'}
          </button>
        )}
      </div>

      <form
        onSubmit={smartMode ? handleSmartSubmit : handleSubmit}
        className="space-y-4"
      >

        {/* ALWAYS VISIBLE FIELDS */}

        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* MANUAL MODE ONLY FIELDS */}
        {!smartMode && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sizes</label>
              <div className="flex gap-2 flex-wrap">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 border transition-colors ${
                      formData.sizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, in_stock: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">In Stock</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`flex-1 px-4 py-2 rounded text-white ${
              smartMode
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-black hover:bg-gray-800'
            }`}
          >
            {smartMode
              ? 'Generate & Create'
              : editingProduct
              ? 'Update'
              : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 w-full bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-gray-100 flex-shrink-0">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium">${product.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          product.in_stock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditDialog(product)}
                        className="p-2 hover:bg-gray-100 rounded inline-flex"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this product?')) {
                            deleteMutation.mutate(product._id);
                          }
                        }}
                        className="p-2 hover:bg-gray-100 rounded inline-flex"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}