import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Edit2, Save, X, Shield, ShieldAlert, Users as UsersIcon, Mail, Phone, Calendar, Filter } from 'lucide-react';
import API_URL from '../config/api';

interface User {
  id: number | string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  createdAt: string;
  favorites?: string[];
}

interface UserManagementProps {
  onClose?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<string | number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone && user.phone.includes(term))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (userId: string | number) => {
    try {
      const userToUpdate = users.find((u) => u.id === userId);
      if (!userToUpdate) return;

      const updatedUser = {
        ...userToUpdate,
        ...editFormData,
      };

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        await fetchUsers();
        setEditingUser(null);
        setEditFormData({});
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'customer':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'guest':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'customer':
        return <UserCheck className="w-4 h-4" />;
      case 'guest':
        return <UserX className="w-4 h-4" />;
      default:
        return <UsersIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    customers: users.filter((u) => u.role === 'customer').length,
    guests: users.filter((u) => u.role === 'guest').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">User Management</h3>
        <p className="text-gray-600">Manage user accounts and permissions</p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">User updated successfully!</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-red-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold text-red-600">{stats.admins}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Admins</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">{stats.customers}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Customers</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <UserX className="w-8 h-8 text-gray-600" />
            <span className="text-3xl font-bold text-gray-600">{stats.guests}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Guests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const isEditing = editingUser === user.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {/* User Info */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                          />
                          <input
                            type="tel"
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                            placeholder="Phone"
                          />
                        </div>
                      ) : (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-700">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editFormData.role || user.role}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                          className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="guest">Guest</option>
                        </select>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(user.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Delete"
                            disabled={user.role === 'admin'}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No users found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

