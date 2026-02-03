
"use client"
import React, { useEffect, useState } from 'react';
import { authService } from '@/features/auth/api/auth-service';
import { User } from '@/types';
import { Mail, Calendar, Shield, Search } from 'lucide-react';

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await authService.getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-2">View and manage registered users</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full sm:w-64"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-500 font-medium text-sm">Total Users</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{users.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-500 font-medium text-sm">Active Now</p>
                    <h3 className="text-3xl font-bold text-emerald-600 mt-2">-</h3>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <p>No users found matching your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const role = user.role || 'user';
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                                                        <p className="text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail size={12} />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${role === 'admin'
                                                        ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-100'
                                                        : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                                    }`}>
                                                    {role === 'admin' && <Shield size={12} />}
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm">
                                                <button className="text-gray-400 hover:text-emerald-600 font-medium transition-colors">View Details</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
