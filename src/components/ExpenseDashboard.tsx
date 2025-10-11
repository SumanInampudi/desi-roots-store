import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign, TrendingUp, Calendar, Tag, Search, Filter, Edit2, Trash2, Eye, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from './ExpenseForm';
import API_URL from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

interface ExpenseDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalExpenses: number;
  monthlyExpenses: number;
  todayExpenses: number;
  averageExpense: number;
  highestExpense: number;
  expenseCount: number;
}

const categoryLabels: { [key: string]: string } = {
  raw_materials: 'Raw Materials',
  packaging: 'Packaging',
  utilities: 'Utilities',
  salaries: 'Salaries & Wages',
  logistics: 'Logistics & Transport',
  marketing: 'Marketing & Advertising',
  rent: 'Rent & Lease',
  maintenance: 'Maintenance & Repairs',
  office: 'Office Supplies',
  insurance: 'Insurance',
  taxes: 'Taxes & Fees',
  other: 'Other'
};

const ExpenseDashboard: React.FC<ExpenseDashboardProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showCharts, setShowCharts] = useState(false);

  const [stats, setStats] = useState<Stats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    todayExpenses: 0,
    averageExpense: 0,
    highestExpense: 0,
    expenseCount: 0
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchExpenses();
    }
  }, [isOpen, isAdmin]);

  useEffect(() => {
    filterExpenses();
  }, [searchTerm, categoryFilter, dateFilter, expenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expenses?_sort=date&_order=desc`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (expensesData: Expense[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newStats: Stats = {
      totalExpenses: 0,
      monthlyExpenses: 0,
      todayExpenses: 0,
      averageExpense: 0,
      highestExpense: 0,
      expenseCount: expensesData.length
    };

    expensesData.forEach(expense => {
      newStats.totalExpenses += expense.amount;
      newStats.highestExpense = Math.max(newStats.highestExpense, expense.amount);

      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);

      if (expenseDate.getTime() === today.getTime()) {
        newStats.todayExpenses += expense.amount;
      }

      if (expenseDate >= thisMonth) {
        newStats.monthlyExpenses += expense.amount;
      }
    });

    newStats.averageExpense = expensesData.length > 0 ? newStats.totalExpenses / expensesData.length : 0;

    setStats(newStats);
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(term) ||
        expense.vendor.toLowerCase().includes(term) ||
        expense.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'today':
            return expenseDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return expenseDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return expenseDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            return expenseDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    setFilteredExpenses(filtered);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Chart data - Category wise expenses
  const getCategoryChartData = () => {
    const categoryTotals: { [key: string]: number } = {};
    filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedCategories.map(([cat]) => categoryLabels[cat] || cat),
      datasets: [{
        label: 'Expenses by Category',
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  // Monthly trend chart
  const getMonthlyTrendData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    filteredExpenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + exp.amount;
    });

    const sortedMonths = Object.entries(monthlyTotals).sort();
    const labels = sortedMonths.map(([month]) => {
      const [year, m] = month.split('-');
      return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    });

    return {
      labels,
      datasets: [{
        label: 'Monthly Expenses (₹)',
        data: sortedMonths.map(([, amount]) => amount),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 8
      }]
    };
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[100]" onClick={onClose} />

      {/* Dashboard Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto w-full max-w-7xl">
          <div className="bg-white rounded-xl shadow-2xl w-full my-8 transform transition-all duration-300 max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Expense Management · Track & Analyze Costs</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showCharts ? 'Hide' : 'Show'} Charts
                </button>
                <button
                  onClick={() => {
                    setSelectedExpense(null);
                    setShowExpenseForm(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
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
                  <p className="text-gray-600">Loading expenses...</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    {/* Total Expenses */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-red-500 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                          <DollarSign className="w-5 h-5 text-white group-hover:text-red-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Total Expenses</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Expenses */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-orange-500 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg group-hover:bg-orange-50 transition-colors">
                          <Calendar className="w-5 h-5 text-white group-hover:text-orange-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">This Month</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.monthlyExpenses)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Today's Expenses */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-500 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500 p-2 rounded-lg group-hover:bg-amber-50 transition-colors">
                          <DollarSign className="w-5 h-5 text-white group-hover:text-amber-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Today</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.todayExpenses)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Average Expense */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <TrendingUp className="w-5 h-5 text-white group-hover:text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Average</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.averageExpense)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Highest Expense */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-500 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-500 p-2 rounded-lg group-hover:bg-purple-50 transition-colors">
                          <TrendingUp className="w-5 h-5 text-white group-hover:text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Highest</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.highestExpense)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Count */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-50 transition-colors">
                          <Tag className="w-5 h-5 text-white group-hover:text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Count</p>
                          <p className="text-sm font-bold text-gray-900">{stats.expenseCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  {showCharts && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      {/* Category Pie Chart */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Expenses by Category</h3>
                        <div style={{ height: '300px' }}>
                          <Pie 
                            data={getCategoryChartData()} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'right',
                                  labels: { font: { size: 11 } }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Monthly Trend Bar Chart */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Monthly Trend</h3>
                        <div style={{ height: '300px' }}>
                          <Bar 
                            data={getMonthlyTrendData()} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: function(value) {
                                      return '₹' + (value as number).toLocaleString('en-IN');
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search expenses..."
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
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date Filter */}
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">Last Week</option>
                          <option value="month">Last Month</option>
                          <option value="year">Last Year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                                {formatDate(expense.date)}
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-gray-900">{expense.title}</p>
                                <p className="text-xs text-gray-500">{expense.paymentMethod}</p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {categoryLabels[expense.category]}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                                {expense.vendor}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">
                                {formatCurrency(expense.amount)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedExpense(expense);
                                      setShowExpenseDetail(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedExpense(expense);
                                      setShowExpenseForm(true);
                                    }}
                                    className="text-orange-600 hover:text-orange-800 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredExpenses.length === 0 && (
                      <div className="text-center py-12">
                        <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No expenses found</p>
                        <button
                          onClick={() => setShowExpenseForm(true)}
                          className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Add your first expense
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm 
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onSuccess={fetchExpenses}
      />

      {/* Expense Detail Modal */}
      {showExpenseDetail && selectedExpense && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[102]" onClick={() => setShowExpenseDetail(false)} />
          <div className="fixed inset-0 z-[103] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl">
              <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                  <h3 className="text-xl font-bold">Expense Details</h3>
                  <button
                    onClick={() => setShowExpenseDetail(false)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{selectedExpense.title}</h4>
                    <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">{categoryLabels[selectedExpense.category]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedExpense.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="font-semibold text-gray-900">{selectedExpense.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="font-semibold text-gray-900">{selectedExpense.vendor}</p>
                    </div>
                  </div>

                  {selectedExpense.description && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedExpense.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ExpenseDashboard;

