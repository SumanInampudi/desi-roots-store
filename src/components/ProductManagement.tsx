import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Edit2, Trash2, Search, Filter, Save, Upload, AlertCircle, CheckCircle, Check, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';

interface ProductManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string | number;
  name: string;
  price: string;
  weight: string;
  description: string;
  image: string;
  category: string;
  searchKeywords: string[];
  features: {
    text: string;
    icon: string;
    color: string;
  }[];
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  createdAt: string;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editFormData, setEditFormData] = useState<Product | null>(null);
  
  console.log('ProductManagement render:', { isOpen, user, productsCount: products.length, loading, filteredCount: filteredProducts.length });

  const categories = ['Powders', 'Veg-pickles', 'Non-veg pickles', 'Others'];
  const iconOptions = ['Leaf', 'Shield', 'Award', 'Star'];
  const colorOptions = [
    'bg-green-100 text-green-800',
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-amber-100 text-amber-800',
    'bg-red-100 text-red-800',
    'bg-orange-100 text-orange-800',
    'bg-yellow-100 text-yellow-800',
  ];

  // Form state
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    price: '',
    weight: '',
    description: '',
    image: '',
    category: 'Powders',
    searchKeywords: [],
    features: [
      { text: '', icon: 'Leaf', color: 'bg-green-100 text-green-800' },
      { text: '', icon: 'Shield', color: 'bg-blue-100 text-blue-800' },
      { text: '', icon: 'Award', color: 'bg-purple-100 text-purple-800' },
      { text: '', icon: 'Star', color: 'bg-amber-100 text-amber-800' },
    ],
    inStock: true,
    stockQuantity: 100,
    lowStockThreshold: 10,
    createdAt: new Date().toISOString(),
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchProducts();
    }
  }, [isOpen, isAdmin]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, stockFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter(product => product.inStock && (product.stockQuantity || 0) > (product.lowStockThreshold || 10));
    } else if (stockFilter === 'low-stock') {
      filtered = filtered.filter(product => product.inStock && (product.stockQuantity || 0) <= (product.lowStockThreshold || 10) && (product.stockQuantity || 0) > 0);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter(product => !product.inStock || (product.stockQuantity || 0) === 0);
    }

    setFilteredProducts(filtered);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const triggerProductsRefresh = () => {
    // Dispatch custom event to notify other components to refresh
    window.dispatchEvent(new Event('productsUpdated'));
  };

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditFormData({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    try {
      const response = await fetch(`${API_URL}/products/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        showNotification('success', 'Product updated successfully');
        setEditingProductId(null);
        setEditFormData(null);
        fetchProducts();
        triggerProductsRefresh();
      } else {
        showNotification('error', 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('error', 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string | number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'Product deleted successfully');
        fetchProducts();
        triggerProductsRefresh();
      } else {
        showNotification('error', 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('error', 'Failed to delete product');
    }
  };

  const handleCreateNewProduct = async () => {
    if (!formData.name || !formData.price || !formData.weight) {
      showNotification('error', 'Please fill in required fields (Name, Price, Weight)');
      return;
    }

    try {
      const productData = {
        ...formData,
        id: Date.now().toString(),
        searchKeywords: formData.searchKeywords.length > 0 
          ? formData.searchKeywords 
          : formData.name.toLowerCase().split(' '),
      };

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        showNotification('success', 'Product created successfully');
        setShowNewProductForm(false);
        setFormData({
          id: '',
          name: '',
          price: '',
          weight: '',
          description: '',
          image: '',
          category: 'Powders',
          searchKeywords: [],
          features: [
            { text: '100% Natural', icon: 'Leaf', color: 'bg-green-100 text-green-800' },
            { text: 'No Preservatives', icon: 'Shield', color: 'bg-blue-100 text-blue-800' },
            { text: 'Premium Quality', icon: 'Award', color: 'bg-purple-100 text-purple-800' },
            { text: 'Traditional Recipe', icon: 'Star', color: 'bg-amber-100 text-amber-800' },
          ],
          inStock: true,
          stockQuantity: 100,
          lowStockThreshold: 10,
          createdAt: new Date().toISOString(),
        });
        fetchProducts();
        triggerProductsRefresh();
      } else {
        showNotification('error', 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showNotification('error', 'An error occurred while creating the product');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNewProduct: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server/cloud storage
      // For now, create a local URL
      const imageUrl = `/uploads/${file.name}`;
      
      if (isNewProduct) {
        setFormData({ ...formData, image: imageUrl });
      } else if (editFormData) {
        setEditFormData({ ...editFormData, image: imageUrl });
      }
      
      showNotification('success', 'Image selected (Note: Upload to server not implemented)');
    }
  };

  const handleUpdateStock = async (productId: string | number, newQuantity: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const updatedProduct = {
        ...product,
        stockQuantity: newQuantity,
        inStock: newQuantity > 0,
      };

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        showNotification('success', 'Stock updated successfully');
        fetchProducts();
        triggerProductsRefresh();
      } else {
        showNotification('error', 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('error', 'Failed to update stock');
    }
  };

  const getStockStatusColor = (product: Product) => {
    const stock = product.stockQuantity || 0;
    const threshold = product.lowStockThreshold || 10;

    if (!product.inStock || stock === 0) return 'bg-red-100 text-red-800 border-red-300';
    if (stock <= threshold) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getStockStatusText = (product: Product) => {
    const stock = product.stockQuantity || 0;
    const threshold = product.lowStockThreshold || 10;

    if (!product.inStock || stock === 0) return 'Out of Stock';
    if (stock <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-6">You don't have admin privileges to access this module.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />

      {/* Main Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto w-full max-w-7xl">
          <div className="bg-white rounded-2xl shadow-2xl w-full my-8 transform transition-all duration-300 max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Product Management</h2>
                  <p className="text-sm text-white/90">{products.length} total products</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : (
                <>
                  {/* Filters and Add New Product */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
                    <div className="flex flex-col md:flex-row gap-3 mb-3">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      {/* Category Filter */}
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Stock Filter */}
                      <div className="relative">
                        <select
                          value={stockFilter}
                          onChange={(e) => setStockFilter(e.target.value)}
                          className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                        >
                          <option value="all">All Stock Levels</option>
                          <option value="in-stock">In Stock</option>
                          <option value="low-stock">Low Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    {/* Add New Product Toggle */}
                    {!showNewProductForm && (
                      <button
                        onClick={() => setShowNewProductForm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all duration-200"
                      >
                        <Plus className="w-5 h-5" />
                        Add New Product
                      </button>
                    )}
                  </div>

                  {/* New Product Form */}
                  {showNewProductForm && (
                    <div className="bg-white rounded-lg border-2 border-green-500 p-4 mb-4 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-green-600" />
                          New Product
                        </h3>
                        <button
                          onClick={() => setShowNewProductForm(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Product Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Price (₹) *"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Weight *"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Stock Quantity"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            className="hidden"
                            id="new-product-image"
                          />
                          <label
                            htmlFor="new-product-image"
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Image
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleCreateNewProduct}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Create Product
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Stock</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredProducts.map((product) => {
                            const isEditing = editingProductId === product.id;
                            const displayProduct = isEditing && editFormData ? editFormData : product;
                            
                            return (
                              <tr key={product.id} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                                {/* Product Name */}
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={displayProduct.name}
                                        onChange={(e) => setEditFormData({ ...editFormData!, name: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Weight (e.g., 500gm)"
                                        value={displayProduct.weight}
                                        onChange={(e) => setEditFormData({ ...editFormData!, weight: e.target.value })}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                      <textarea
                                        placeholder="Description"
                                        value={displayProduct.description}
                                        onChange={(e) => setEditFormData({ ...editFormData!, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                      />
                                      
                                      {/* Features Editor */}
                                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <label className="text-xs font-semibold text-gray-700">Features:</label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newFeatures = [...(editFormData?.features || []), {
                                                text: '',
                                                icon: 'Leaf',
                                                color: 'bg-green-100 text-green-800'
                                              }];
                                              setEditFormData({ ...editFormData!, features: newFeatures });
                                            }}
                                            className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                            title="Add feature"
                                          >
                                            <Plus className="w-3 h-3 inline" />
                                          </button>
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                          {displayProduct.features?.map((feature, idx) => (
                                            <div key={idx} className="flex gap-1 items-center">
                                              <input
                                                type="text"
                                                placeholder="Feature text"
                                                value={feature.text}
                                                onChange={(e) => {
                                                  const newFeatures = [...(editFormData?.features || [])];
                                                  newFeatures[idx] = { ...newFeatures[idx], text: e.target.value };
                                                  setEditFormData({ ...editFormData!, features: newFeatures });
                                                }}
                                                className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded"
                                              />
                                              <select
                                                value={feature.icon}
                                                onChange={(e) => {
                                                  const newFeatures = [...(editFormData?.features || [])];
                                                  newFeatures[idx] = { ...newFeatures[idx], icon: e.target.value };
                                                  setEditFormData({ ...editFormData!, features: newFeatures });
                                                }}
                                                className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded"
                                              >
                                                {iconOptions.map(icon => (
                                                  <option key={icon} value={icon}>{icon}</option>
                                                ))}
                                              </select>
                                              <select
                                                value={feature.color}
                                                onChange={(e) => {
                                                  const newFeatures = [...(editFormData?.features || [])];
                                                  newFeatures[idx] = { ...newFeatures[idx], color: e.target.value };
                                                  setEditFormData({ ...editFormData!, features: newFeatures });
                                                }}
                                                className="w-20 px-1 py-0.5 text-xs border border-gray-300 rounded"
                                              >
                                                {colorOptions.map(color => (
                                                  <option key={color} value={color}>
                                                    {color.split(' ')[0].replace('bg-', '').replace('-100', '')}
                                                  </option>
                                                ))}
                                              </select>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newFeatures = (editFormData?.features || []).filter((_, i) => i !== idx);
                                                  setEditFormData({ ...editFormData!, features: newFeatures });
                                                }}
                                                className="p-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                title="Remove feature"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                                      <div className="text-xs text-gray-500">{product.weight}</div>
                                      {product.description && (
                                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</div>
                                      )}
                                      {product.features && product.features.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {product.features.slice(0, 3).map((feature, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                              {feature.text}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Category */}
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <select
                                      value={displayProduct.category}
                                      onChange={(e) => setEditFormData({ ...editFormData!, category: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 text-xs font-semibold rounded-full">
                                      {product.category}
                                    </span>
                                  )}
                                </td>

                                {/* Price */}
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={displayProduct.price}
                                      onChange={(e) => setEditFormData({ ...editFormData!, price: e.target.value })}
                                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  ) : (
                                    <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                                  )}
                                </td>

                                {/* Stock */}
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={displayProduct.stockQuantity || 0}
                                      onChange={(e) => setEditFormData({ ...editFormData!, stockQuantity: parseInt(e.target.value) || 0 })}
                                      className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleUpdateStock(product.id, (product.stockQuantity || 0) - 10)}
                                        className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                        disabled={(product.stockQuantity || 0) <= 0}
                                        title="Decrease stock by 10"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-sm font-semibold text-gray-900 min-w-[40px] text-center">
                                        {product.stockQuantity || 0}
                                      </span>
                                      <button
                                        onClick={() => handleUpdateStock(product.id, (product.stockQuantity || 0) + 10)}
                                        className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                        title="Increase stock by 10"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(product)}`}>
                                    {getStockStatusText(product)}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={handleSaveEdit}
                                          className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                          title="Save changes"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                                          title="Cancel"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                        <div className="relative">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, false)}
                                            className="hidden"
                                            id={`edit-image-${product.id}`}
                                          />
                                          <label
                                            htmlFor={`edit-image-${product.id}`}
                                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer inline-block"
                                            title="Upload image"
                                          >
                                            <Upload className="w-4 h-4" />
                                          </label>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleStartEdit(product)}
                                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                          title="Edit product"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(product.id)}
                                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                          title="Delete product"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No products found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-[104] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
    </>
  );
};

export default ProductManagement;

