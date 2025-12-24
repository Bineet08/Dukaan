import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useUserStore } from '../stores/useUserStore'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const usersPerPage = 10

    const user = useUserStore((state) => state.user)
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // Fetch users
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true)
            const response = await fetch(`${backendUrl}/auth?page=${page}&limit=${usersPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const data = await response.json()

            if (response.ok) {
                setUsers(data.users || [])
                setCurrentPage(data.page)
                setTotalPages(data.totalPages)
                setTotalUsers(data.totalUsers)
            } else {
                toast.error('Failed to fetch users')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers(currentPage)
    }, [currentPage])

    const handleToggleAdmin = async (userId, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'remove admin privileges from' : 'grant admin privileges to'} this user?`)) {
            return
        }

        try {
            const response = await fetch(`${backendUrl}/auth/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ isAdmin: !currentStatus })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(`User admin status updated`)
                fetchUsers()
            } else {
                toast.error(data.error || 'Failed to update user')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update user')
        }
    }

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return
        }

        // Prevent deleting yourself
        if (userId === user._id) {
            toast.error('You cannot delete your own account')
            return
        }

        try {
            const response = await fetch(`${backendUrl}/auth/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('User deleted successfully')
                fetchUsers()
            } else {
                toast.error(data.error || 'Failed to delete user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
        }
    }

    const openEditModal = (userToEdit) => {
        setEditingUser(userToEdit)
        setShowModal(true)
    }

    const closeModal = () => {
        setEditingUser(null)
        setShowModal(false)
    }

    const handleEditUser = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const email = formData.get('email')

        try {
            const response = await fetch(`${backendUrl}/auth/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ name, email })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('User updated successfully')
                fetchUsers()
                closeModal()
            } else {
                toast.error(data.error || 'Failed to update user')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update user')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
                    <p className="text-gray-600">View and manage user accounts</p>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-lg text-gray-600">Loading users...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u._id} className={`hover:bg-gray-50 ${u._id === user._id ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {u.name}
                                                    {u._id === user._id && (
                                                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isAdmin
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {u.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(u)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                                                className="text-purple-600 hover:text-purple-900 mr-3"
                                                disabled={u._id === user._id}
                                            >
                                                {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={u._id === user._id}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No users found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Admin Users</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {users.filter(u => u.isAdmin).length}
                                </p>
                            </div>
                            <div className="text-4xl">🔧</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Regular Users</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {users.filter(u => !u.isAdmin).length}
                                </p>
                            </div>
                            <div className="text-4xl">👤</div>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {showModal && editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit User</h2>
                            <form onSubmit={handleEditUser}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={editingUser.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={editingUser.email}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Update User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminUsers
