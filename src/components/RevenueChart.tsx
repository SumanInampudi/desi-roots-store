import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp, Package, DollarSign, Award } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
}

type TimeFilter = 'day' | 'week' | 'month' | 'year';
type ViewType = 'time' | 'product';

const RevenueChart: React.FC<RevenueChartProps> = ({ isOpen, onClose, orders }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [viewType, setViewType] = useState<ViewType>('time');
  const [chartData, setChartData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageRevenue: 0,
    highestRevenue: 0,
    period: ''
  });

  useEffect(() => {
    if (isOpen && orders.length > 0) {
      if (viewType === 'time') {
        generateTimeBasedChart();
      } else {
        generateProductBasedChart();
      }
    }
  }, [isOpen, orders, timeFilter, viewType]);

  const generateTimeBasedChart = () => {
    const now = new Date();
    const dataMap: { [key: string]: number } = {};
    let labels: string[] = [];
    let totalRev = 0;
    let highestRev = 0;

    // Filter orders based on time period
    const filteredOrders = orders.filter(order => {
      if (order.status.toLowerCase() === 'cancelled') return false;
      const orderDate = new Date(order.createdAt);
      
      switch (timeFilter) {
        case 'day':
          // Last 7 days
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return orderDate >= sevenDaysAgo;
        
        case 'week':
          // Last 12 weeks
          const twelveWeeksAgo = new Date(now);
          twelveWeeksAgo.setDate(now.getDate() - 84);
          return orderDate >= twelveWeeksAgo;
        
        case 'month':
          // Last 12 months
          const twelveMonthsAgo = new Date(now);
          twelveMonthsAgo.setMonth(now.getMonth() - 12);
          return orderDate >= twelveMonthsAgo;
        
        case 'year':
          // Last 5 years
          const fiveYearsAgo = new Date(now);
          fiveYearsAgo.setFullYear(now.getFullYear() - 5);
          return orderDate >= fiveYearsAgo;
        
        default:
          return true;
      }
    });

    // Group orders by period
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      let key = '';

      switch (timeFilter) {
        case 'day':
          key = orderDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          break;
        
        case 'week':
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          key = `Week ${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
          break;
        
        case 'month':
          key = orderDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
          break;
        
        case 'year':
          key = orderDate.getFullYear().toString();
          break;
      }

      dataMap[key] = (dataMap[key] || 0) + order.totalAmount;
      totalRev += order.totalAmount;
      highestRev = Math.max(highestRev, dataMap[key]);
    });

    // Sort and prepare data
    labels = Object.keys(dataMap).sort((a, b) => {
      // Sort chronologically
      const dateA = filteredOrders.find(o => {
        const od = new Date(o.createdAt);
        let k = '';
        switch (timeFilter) {
          case 'day':
            k = od.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            break;
          case 'week':
            const ws = new Date(od);
            ws.setDate(od.getDate() - od.getDay());
            k = `Week ${ws.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
            break;
          case 'month':
            k = od.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            break;
          case 'year':
            k = od.getFullYear().toString();
            break;
        }
        return k === a;
      });
      const dateB = filteredOrders.find(o => {
        const od = new Date(o.createdAt);
        let k = '';
        switch (timeFilter) {
          case 'day':
            k = od.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            break;
          case 'week':
            const ws = new Date(od);
            ws.setDate(od.getDate() - od.getDay());
            k = `Week ${ws.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
            break;
          case 'month':
            k = od.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            break;
          case 'year':
            k = od.getFullYear().toString();
            break;
        }
        return k === b;
      });
      return new Date(dateA?.createdAt || 0).getTime() - new Date(dateB?.createdAt || 0).getTime();
    });

    const data = labels.map(label => dataMap[label]);

    setStats({
      totalRevenue: totalRev,
      averageRevenue: labels.length > 0 ? totalRev / labels.length : 0,
      highestRevenue: highestRev,
      period: timeFilter
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(249, 115, 22, 0.9)',
        }
      ]
    });
  };

  const generateProductBasedChart = () => {
    const productRevenueMap: { [key: string]: number } = {};
    let totalRev = 0;
    let highestRev = 0;

    // Calculate revenue per product
    orders.forEach(order => {
      if (order.status.toLowerCase() === 'cancelled') return;
      
      order.items.forEach((item: any) => {
        const revenue = parseFloat(item.price) * item.quantity;
        productRevenueMap[item.productName] = (productRevenueMap[item.productName] || 0) + revenue;
        totalRev += revenue;
        highestRev = Math.max(highestRev, productRevenueMap[item.productName]);
      });
    });

    // Sort by revenue (highest first)
    const sortedProducts = Object.entries(productRevenueMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 products

    const labels = sortedProducts.map(([name]) => name);
    const data = sortedProducts.map(([, revenue]) => revenue);

    setStats({
      totalRevenue: totalRev,
      averageRevenue: labels.length > 0 ? totalRev / labels.length : 0,
      highestRevenue: highestRev,
      period: 'all time'
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data,
          backgroundColor: 'rgba(249, 115, 22, 0.8)',
          borderColor: 'rgba(249, 115, 22, 1)',
          borderWidth: 1,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(239, 68, 68, 0.9)',
        }
      ]
    });
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: viewType === 'time' 
          ? `Revenue by ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`
          : 'Top 10 Products by Revenue',
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          family: 'Inter, system-ui, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Inter, system-ui, sans-serif'
        },
        padding: 12,
        borderColor: 'rgba(249, 115, 22, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value as number).toLocaleString('en-IN');
          },
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          display: false
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[102]" onClick={onClose} />

      {/* Chart Modal */}
      <div className="fixed inset-0 z-[103] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto w-full max-w-6xl">
          <div className="bg-white rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-xl flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Revenue Analytics · Visualize Earnings & Trends</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Filters */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* View Type */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      View By
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewType('time')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          viewType === 'time'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Time Period
                      </button>
                      <button
                        onClick={() => setViewType('product')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          viewType === 'product'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Package className="w-4 h-4 inline mr-1" />
                        Product
                      </button>
                    </div>
                  </div>

                  {/* Time Filter (only for time-based view) */}
                  {viewType === 'time' && (
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Time Period
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                          onClick={() => setTimeFilter('day')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            timeFilter === 'day'
                              ? 'bg-orange-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Daily
                        </button>
                        <button
                          onClick={() => setTimeFilter('week')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            timeFilter === 'week'
                              ? 'bg-orange-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setTimeFilter('month')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            timeFilter === 'month'
                              ? 'bg-orange-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setTimeFilter('year')}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            timeFilter === 'year'
                              ? 'bg-orange-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yearly
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Summary - Professional Icon Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Total Revenue */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-50 transition-colors">
                      <DollarSign className="w-5 h-5 text-white group-hover:text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">For {stats.period}</p>
                    </div>
                  </div>
                </div>

                {/* Average Revenue */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-orange-500 hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-lg group-hover:bg-orange-50 transition-colors">
                      <TrendingUp className="w-5 h-5 text-white group-hover:text-orange-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs text-gray-500 font-medium">Average Revenue</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.averageRevenue)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Per {viewType === 'product' ? 'product' : timeFilter}</p>
                    </div>
                  </div>
                </div>

                {/* Highest Revenue */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-red-500 hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                      <Award className="w-5 h-5 text-white group-hover:text-red-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs text-gray-500 font-medium">Highest Revenue</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.highestRevenue)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Peak performance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div style={{ height: '400px' }}>
                  {chartData && <Bar data={chartData} options={chartOptions} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueChart;

