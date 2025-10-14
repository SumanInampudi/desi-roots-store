import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Clock, CheckCircle, TrendingUp, Search, Filter, ChevronDown, Eye, Edit2, Trash2, User, Phone, Mail, MapPin, BarChart3, ArrowUpDown, ArrowUp, ArrowDown, LayoutDashboard, ShoppingCart, LineChart, AlertCircle, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RevenueChart from './RevenueChart';
import API_URL from '../config/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: string;
    weight: string;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayRevenue: number;
  todayOrders: number;
  pendingOverdue: number;
  processingOverdue: number;
  shippedOverdue: number;
  totalProfit: number;
  totalShipping: number;
  todayProfit: number;
  todayShipping: number;
  totalExpenses: number;
  netProfit: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    todayRevenue: 0,
    todayOrders: 0,
    pendingOverdue: 0,
    processingOverdue: 0,
    shippedOverdue: 0,
    totalProfit: 0,
    totalShipping: 0,
    todayProfit: 0,
    todayShipping: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showRevenueChart, setShowRevenueChart] = useState(false);
  const [overdueFilter, setOverdueFilter] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<'id' | 'customerName' | 'createdAt' | 'totalAmount' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeView, setActiveView] = useState<'overview' | 'orders' | 'analytics' | 'alerts'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchOrders();
    }
  }, [isOpen, isAdmin]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders, overdueFilter, sortColumn, sortDirection]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders and expenses in parallel
      const [ordersResponse, expensesResponse] = await Promise.all([
        fetch(`${API_URL}/orders?_sort=createdAt&_order=desc`),
        fetch(`${API_URL}/expenses`)
      ]);
      
      if (ordersResponse.ok && expensesResponse.ok) {
        const ordersData = await ordersResponse.json();
        const expensesData = await expensesResponse.json();
        setOrders(ordersData);
        calculateStats(ordersData, expensesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: Order[], expensesData: any[] = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const newStats: Stats = {
      totalRevenue: 0,
      totalOrders: ordersData.length,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      todayRevenue: 0,
      todayOrders: 0,
      pendingOverdue: 0,
      processingOverdue: 0,
      shippedOverdue: 0,
      totalProfit: 0,
      totalShipping: 0,
      todayProfit: 0,
      todayShipping: 0,
      totalExpenses: 0,
      netProfit: 0
    };

    ordersData.forEach(order => {
      const isCancelled = order.status.toLowerCase() === 'cancelled';
      
      // Total revenue (exclude cancelled)
      if (!isCancelled) {
        newStats.totalRevenue += order.totalAmount || 0;
        newStats.totalProfit += order.profit || 0;
        newStats.totalShipping += order.shippingCharges || 0;
      }

      // Status counts
      const status = order.status.toLowerCase();
      const updatedAt = new Date(order.updatedAt);
      
      if (status === 'pending') {
        newStats.pendingOrders++;
        if (updatedAt < twoDaysAgo) newStats.pendingOverdue++;
      } else if (status === 'processing') {
        newStats.processingOrders++;
        if (updatedAt < twoDaysAgo) newStats.processingOverdue++;
      } else if (status === 'shipped') {
        newStats.shippedOrders++;
        if (updatedAt < twoDaysAgo) newStats.shippedOverdue++;
      } else if (status === 'delivered') {
        newStats.deliveredOrders++;
      } else if (status === 'cancelled') {
        newStats.cancelledOrders++;
      }

      // Today's stats
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      if (orderDate.getTime() === today.getTime()) {
        newStats.todayOrders++;
        if (!isCancelled) {
          newStats.todayRevenue += order.totalAmount || 0;
          newStats.todayProfit += order.profit || 0;
          newStats.todayShipping += order.shippingCharges || 0;
        }
      }
    });

    // Calculate expenses
    expensesData.forEach(expense => {
      newStats.totalExpenses += expense.amount || 0;
    });

    // Calculate net profit (gross profit - expenses)
    newStats.netProfit = newStats.totalProfit - newStats.totalExpenses;

    setStats(newStats);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Overdue filter (takes priority)
    if (overdueFilter) {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      filtered = filtered.filter(order => {
        const updatedAt = new Date(order.updatedAt);
        return order.status.toLowerCase() === overdueFilter.toLowerCase() && updatedAt < twoDaysAgo;
      });
    } else {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(order =>
          order.id.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term) ||
          order.customerEmail.toLowerCase().includes(term) ||
          order.customerPhone.includes(term)
        );
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => 
          order.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredOrders(filtered);
  };

  const handleSort = (column: 'id' | 'customerName' | 'createdAt' | 'totalAmount' | 'status') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with desc as default
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;

      const updatedOrder = {
        ...orderToUpdate,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder)
      });

      if (response.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-6">You don't have admin privileges to access this dashboard.</p>
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

      {/* Dashboard Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-2 md:p-4">
        <div className="w-full h-full md:h-[95vh] max-w-[1800px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">Admin Dashboard</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Layout: Sidebar + Content */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar */}
            <div className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0 transition-transform duration-300
              w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0
              absolute md:relative inset-y-0 left-0 z-20 md:z-auto
              flex flex-col
            `}>
              {/* Mobile overlay */}
              {sidebarOpen && (
                <div 
                  className="md:hidden fixed inset-0 bg-black/20 -z-10"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              
              {/* Menu Items */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <button
                  onClick={() => {
                    setActiveView('overview');
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${activeView === 'overview'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('orders');
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${activeView === 'orders'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Orders</span>
                  {stats.totalOrders > 0 && (
                    <span className={`
                      ml-auto px-2 py-0.5 rounded-full text-xs font-bold
                      ${activeView === 'orders' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}
                    `}>
                      {stats.totalOrders}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveView('analytics');
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${activeView === 'analytics'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <LineChart className="w-5 h-5" />
                  <span>Analytics</span>
                </button>

                {(stats.pendingOverdue > 0 || stats.processingOverdue > 0 || stats.shippedOverdue > 0) && (
                  <button
                    onClick={() => {
                      setActiveView('alerts');
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${activeView === 'alerts'
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-md animate-pulse'
                      }
                    `}
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>Alerts</span>
                    <span className={`
                      ml-auto px-2 py-0.5 rounded-full text-xs font-bold
                      ${activeView === 'alerts' ? 'bg-white/20' : 'bg-red-200 text-red-800'}
                    `}>
                      {stats.pendingOverdue + stats.processingOverdue + stats.shippedOverdue}
                    </span>
                  </button>
                )}
              </nav>

              {/* User Info in Sidebar */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                  <p className="text-gray-600">Loading dashboard data...</p>
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  
                  {/* Overview View */}
                  {activeView === 'overview' && (
                    <div className="space-y-6">
                      {/* Welcome Header */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user?.name}!</h3>
                        <p className="text-gray-600">Here's what's happening with your store today.</p>
                      </div>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Revenue */}
                      <button
                        onClick={() => setShowRevenueChart(true)}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-50 transition-colors">
                            <DollarSign className="w-5 h-5 text-white group-hover:text-green-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                          </div>
                        </div>
                      </button>

                      {/* Total Profit */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-50 transition-colors">
                            <TrendingUp className="w-5 h-5 text-white group-hover:text-emerald-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Total Profit</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.totalProfit)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Total Shipping */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-cyan-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-cyan-500 p-2 rounded-lg group-hover:bg-cyan-50 transition-colors">
                            <Package className="w-5 h-5 text-white group-hover:text-cyan-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Shipping</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.totalShipping)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Total Orders */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-orange-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 p-2 rounded-lg group-hover:bg-orange-50 transition-colors">
                            <Package className="w-5 h-5 text-white group-hover:text-orange-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                            <p className="text-sm font-bold text-gray-900">{stats.totalOrders}</p>
                          </div>
                        </div>
                      </div>

                      {/* Total Expenses */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-red-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-500 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                            <DollarSign className="w-5 h-5 text-white group-hover:text-red-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Total Expenses</p>
                            <p className="text-sm font-bold text-red-700">{formatCurrency(stats.totalExpenses)}</p>
                          </div>
                        </div>
                      </div>

                        {/* Net Profit */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-200 group">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {formatCurrency(stats.netProfit)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Net Profit</p>
                          <p className="text-xs text-gray-500 mt-1">After expenses</p>
                        </div>

                        {/* Today's Revenue */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-200 group">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-teal-600">
                              {formatCurrency(stats.todayRevenue)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Today's Revenue</p>
                          <p className="text-xs text-gray-500 mt-1">{stats.todayOrders} orders today</p>
                        </div>
                      </div>

                      {/* Order Status Row */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Order Status</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {/* Pending Orders */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500 p-2 rounded-lg group-hover:bg-amber-50 transition-colors">
                            <Clock className="w-5 h-5 text-white group-hover:text-amber-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Pending</p>
                            <p className="text-sm font-bold text-gray-900">{stats.pendingOrders}</p>
                          </div>
                        </div>
                      </div>

                      {/* Processing Orders */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Package className="w-5 h-5 text-white group-hover:text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Processing</p>
                            <p className="text-sm font-bold text-gray-900">{stats.processingOrders}</p>
                          </div>
                        </div>
                      </div>

                      {/* Shipped Orders */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-500 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                            <TrendingUp className="w-5 h-5 text-white group-hover:text-indigo-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Shipped</p>
                            <p className="text-sm font-bold text-gray-900">{stats.shippedOrders}</p>
                          </div>
                        </div>
                      </div>

                      {/* Delivered Orders */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-50 transition-colors">
                            <CheckCircle className="w-5 h-5 text-white group-hover:text-green-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 font-medium">Delivered</p>
                            <p className="text-sm font-bold text-gray-900">{stats.deliveredOrders}</p>
                          </div>
                        </div>
                      </div>

                        {/* Cancelled Orders */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-red-500 hover:shadow-lg transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-500 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                              <X className="w-5 h-5 text-white group-hover:text-red-600" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs text-gray-500 font-medium">Cancelled</p>
                              <p className="text-sm font-bold text-gray-900">{stats.cancelledOrders}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  )}

                  {/* Orders View */}
                  {activeView === 'orders' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Order Management</h3>
                        <p className="text-gray-600">View and manage all your orders</p>
                      </div>

                  {/* Actionable Items - Orders Overdue */}
                  {(stats.pendingOverdue > 0 || stats.processingOverdue > 0 || stats.shippedOverdue > 0) && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
                          <span className="text-red-600 text-xs font-bold">!</span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">Action Required - Orders Over 2 Days</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Pending Overdue */}
                        {stats.pendingOverdue > 0 && (
                          <button
                            onClick={() => {
                              setOverdueFilter('pending');
                              setStatusFilter('all');
                              setSearchTerm('');
                            }}
                            className={`bg-gradient-to-r from-amber-50 to-amber-100 border-2 rounded-lg p-3 hover:shadow-lg transition-all duration-200 text-left ${
                              overdueFilter === 'pending' ? 'border-amber-600 ring-2 ring-amber-300' : 'border-amber-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-amber-500 p-1.5 rounded-lg">
                                  <Clock className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-amber-900">Pending Too Long</span>
                              </div>
                              <span className="text-lg font-bold text-amber-700">{stats.pendingOverdue}</span>
                            </div>
                            <p className="text-xs text-amber-700">Click to view pending orders</p>
                          </button>
                        )}

                        {/* Processing Overdue */}
                        {stats.processingOverdue > 0 && (
                          <button
                            onClick={() => {
                              setOverdueFilter('processing');
                              setStatusFilter('all');
                              setSearchTerm('');
                            }}
                            className={`bg-gradient-to-r from-blue-50 to-blue-100 border-2 rounded-lg p-3 hover:shadow-lg transition-all duration-200 text-left ${
                              overdueFilter === 'processing' ? 'border-blue-600 ring-2 ring-blue-300' : 'border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-blue-500 p-1.5 rounded-lg">
                                  <Package className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-blue-900">Processing Delayed</span>
                              </div>
                              <span className="text-lg font-bold text-blue-700">{stats.processingOverdue}</span>
                            </div>
                            <p className="text-xs text-blue-700">Click to view delayed orders</p>
                          </button>
                        )}

                        {/* Shipped Overdue */}
                        {stats.shippedOverdue > 0 && (
                          <button
                            onClick={() => {
                              setOverdueFilter('shipped');
                              setStatusFilter('all');
                              setSearchTerm('');
                            }}
                            className={`bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 rounded-lg p-3 hover:shadow-lg transition-all duration-200 text-left ${
                              overdueFilter === 'shipped' ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-indigo-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-indigo-500 p-1.5 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-indigo-900">Shipping Delayed</span>
                              </div>
                              <span className="text-lg font-bold text-indigo-700">{stats.shippedOverdue}</span>
                            </div>
                            <p className="text-xs text-indigo-700">Click to view shipping delays</p>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Filter Banner */}
                  {overdueFilter && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-500 p-2 rounded-lg">
                            <Filter className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-red-900">
                              Showing {overdueFilter.charAt(0).toUpperCase() + overdueFilter.slice(1)} Orders Over 2 Days Old
                            </p>
                            <p className="text-xs text-red-700">
                              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} require{filteredOrders.length === 1 ? 's' : ''} attention
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setOverdueFilter(null)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filters and Search */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search by order ID, customer name, email, or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          disabled={!!overdueFilter}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          disabled={!!overdueFilter}
                          className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th 
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('id')}
                            >
                              <div className="flex items-center gap-1">
                                Order ID {getSortIcon('id')}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('customerName')}
                            >
                              <div className="flex items-center gap-1">
                                Customer {getSortIcon('customerName')}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('createdAt')}
                            >
                              <div className="flex items-center gap-1">
                                Date {getSortIcon('createdAt')}
                              </div>
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th 
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('totalAmount')}
                            >
                              <div className="flex items-center gap-1">
                                Amount {getSortIcon('totalAmount')}
                              </div>
                            </th>
                            <th 
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('status')}
                            >
                              <div className="flex items-center gap-1">
                                Status {getSortIcon('status')}
                              </div>
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs font-mono font-medium text-gray-900">#{order.id}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-xs">
                                  <p className="font-medium text-gray-900">{order.customerName}</p>
                                  <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-gray-600">{formatDate(order.createdAt)}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-gray-900">{order.items.length} item(s)</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer ${getStatusColor(order.status)}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDetail(true);
                                  }}
                                  className="text-orange-600 hover:text-red-700 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No orders found matching your criteria</p>
                      </div>
                    )}
                  </div>
                    </div>
                  )}

                  {/* Analytics View */}
                  {activeView === 'analytics' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Analytics & Insights</h3>
                        <p className="text-gray-600">Detailed financial metrics and trends</p>
                      </div>

                      {/* Financial Deep Dive */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Financial Overview</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Total Revenue Card */}
                          <button
                            onClick={() => setShowRevenueChart(true)}
                            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <DollarSign className="w-10 h-10" />
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</p>
                            <p className="text-green-100 text-sm">Total Revenue</p>
                            <p className="text-xs text-green-100/80 mt-2">Click to view chart</p>
                          </button>

                          {/* Total Profit Card */}
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                              <TrendingUp className="w-10 h-10" />
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Profit</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{formatCurrency(stats.totalProfit)}</p>
                            <p className="text-blue-100 text-sm">Gross Profit</p>
                            <p className="text-xs text-blue-100/80 mt-2">Before expenses</p>
                          </div>

                          {/* Net Profit Card */}
                          <div className={`bg-gradient-to-br ${stats.netProfit >= 0 ? 'from-purple-500 to-pink-600' : 'from-red-500 to-orange-600'} rounded-xl p-6 text-white shadow-xl`}>
                            <div className="flex items-center justify-between mb-4">
                              <TrendingUp className="w-10 h-10" />
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Net</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{formatCurrency(stats.netProfit)}</p>
                            <p className="text-white/90 text-sm">Net Profit</p>
                            <p className="text-xs text-white/70 mt-2">After expenses</p>
                          </div>
                        </div>
                      </div>

                      {/* Today vs Total */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Today's Performance</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                            <p className="text-gray-600 text-xs mb-1">Revenue</p>
                            <p className="text-xl font-bold text-teal-600">{formatCurrency(stats.todayRevenue)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                            <p className="text-gray-600 text-xs mb-1">Profit</p>
                            <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.todayProfit)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                            <p className="text-gray-600 text-xs mb-1">Shipping</p>
                            <p className="text-xl font-bold text-sky-600">{formatCurrency(stats.todayShipping)}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                            <p className="text-gray-600 text-xs mb-1">Orders</p>
                            <p className="text-xl font-bold text-orange-600">{stats.todayOrders}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expenses */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Expenses</h4>
                        <div className="bg-white rounded-xl p-6 border-2 border-red-200">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
                              <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alerts View */}
                  {activeView === 'alerts' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                          <AlertCircle className="w-7 h-7 text-red-600" />
                          Action Required
                        </h3>
                        <p className="text-gray-600">Orders that need your immediate attention</p>
                      </div>

                      {/* Overdue Alerts */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Pending Overdue */}
                        {stats.pendingOverdue > 0 && (
                          <button
                            onClick={() => {
                              setActiveView('orders');
                              setOverdueFilter('pending');
                              setStatusFilter('all');
                              setSearchTerm('');
                            }}
                            className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                              </div>
                              <span className="text-4xl font-bold">{stats.pendingOverdue}</span>
                            </div>
                            <p className="text-lg font-bold mb-1">Pending Too Long</p>
                            <p className="text-sm text-amber-100">Orders pending over 2 days</p>
                            <p className="text-xs text-amber-100/80 mt-3">Click to view →</p>
                          </button>
                        )}

                        {/* Processing Overdue */}
                        {stats.processingOverdue > 0 && (
                          <button
                            onClick={() => {
                              setActiveView('orders');
                              setOverdueFilter('processing');
                              setStatusFilter('all');
                              setSearchTerm('');
                            }}
                            className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6" />
                              </div>
                              <span className="text-4xl font-bold">{stats.processingOverdue}</span>
                            </div>
                            <p className="text-lg font-bold mb-1">Processing Delayed</p>
                            <p className="text-sm text-blue-100">Orders processing over 2 days</p>
                            <p className="text-xs text-blue-100/80 mt-3">Click to view →</p>
                          </button>
                        )}

                        {/* Shipped Overdue */}
                        {stats.shippedOverdue > 0 && (
                          <button
                            onClick={() => {
                              setActiveView('orders');
                              setOverdueFilter('shipped');
                              setStatusFilter('all');
                              setSearchTerm('');
                            }}
                            className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                              </div>
                              <span className="text-4xl font-bold">{stats.shippedOverdue}</span>
                            </div>
                            <p className="text-lg font-bold mb-1">Shipping Delayed</p>
                            <p className="text-sm text-purple-100">Orders shipped over 2 days</p>
                            <p className="text-xs text-purple-100/80 mt-3">Click to view →</p>
                          </button>
                        )}
                      </div>

                      {/* Info box */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-blue-900 mb-1">About Alerts</p>
                            <p className="text-sm text-blue-800">
                              These alerts show orders that haven't been updated in over 2 days. 
                              Click on any alert to view and manage those specific orders.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[102]" onClick={() => setShowOrderDetail(false)} />
          <div className="fixed inset-0 z-[103] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
            <div className="pointer-events-auto w-full max-w-3xl">
              <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-xl flex items-center justify-between sticky top-0">
                  <div>
                    <h3 className="text-xl font-bold">Order Details</h3>
                    <p className="text-white/90 text-xs">#{selectedOrder.id}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetail(false)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Customer Info */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-blue-600" />
                      Customer Information
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-2 text-gray-500" />
                        <span className="font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-2 text-gray-500" />
                        <span className="text-gray-700">{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-2 text-gray-500" />
                        <span className="text-gray-700">{selectedOrder.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 text-green-600" />
                      Shipping Address
                    </h4>
                    <div className="text-xs text-gray-700 space-y-0.5">
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>PIN: {selectedOrder.shippingAddress.pincode}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Order Items</h4>
                    <div className="space-y-1.5">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-xs">{item.productName}</p>
                            <p className="text-xs text-gray-500">Weight: {item.weight}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            <p className="font-bold text-sm text-gray-900">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                      <div className="border-t border-orange-300 pt-2 mt-2 flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-orange-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Revenue Chart Modal */}
      <RevenueChart 
        isOpen={showRevenueChart} 
        onClose={() => setShowRevenueChart(false)} 
        orders={orders}
      />
    </>
  );
};

export default AdminDashboard;

