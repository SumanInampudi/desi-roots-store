import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, CreditCard, User, Loader2, CheckCircle } from 'lucide-react';
import API_URL from '../config/api';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
  onSuccess: () => void;
}

interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  vendor: string;
  createdAt?: string;
  updatedAt?: string;
}

const categories = [
  { value: 'raw_materials', label: 'Raw Materials' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'logistics', label: 'Logistics & Transport' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'rent', label: 'Rent & Lease' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'taxes', label: 'Taxes & Fees' },
  { value: 'other', label: 'Other' }
];

const paymentMethods = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Online',
  'Cheque'
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, expense, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Expense>({
    title: '',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    vendor: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData(expense);
    } else {
      setFormData({
        title: '',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        vendor: ''
      });
    }
    setError('');
    setSuccess(false);
  }, [expense, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please enter expense title');
      return false;
    }
    if (formData.amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.date) {
      setError('Please select a date');
      return false;
    }
    if (!formData.paymentMethod) {
      setError('Please select payment method');
      return false;
    }
    if (!formData.vendor.trim()) {
      setError('Please enter vendor name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const expenseData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        ...(expense?.id ? {} : { createdAt: new Date().toISOString() })
      };

      const url = expense?.id
        ? `${API_URL}/expenses/${expense.id}`
        : `${API_URL}/expenses`;

      const method = expense?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        throw new Error('Failed to save expense');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 1500);

    } catch (err) {
      setError('Failed to save expense. Please try again.');
      console.error('Expense save error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Form Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 transform transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{expense?.id ? 'Edit Expense' : 'Add New Expense'}</h2>
              <p className="text-sm text-white/90 mt-0.5">Track your business expenses</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Expense Saved!</h3>
              <p className="text-gray-600">Your expense has been recorded successfully</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Expense Title *
                    </div>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Raw Materials Purchase"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Amount (₹) *
                      </div>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date *
                      </div>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Category *
                      </div>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method *
                      </div>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Select Method</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Vendor/Supplier *
                    </div>
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., ABC Suppliers"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Additional details about this expense..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{expense?.id ? 'Update' : 'Save'} Expense</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpenseForm;

