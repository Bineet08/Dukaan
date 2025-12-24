import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useUserStore } from '../stores/useUserStore'

const AdminProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        image: '',
        originalPrice: '',
        newPrice: ''
    })

    const user = useUserStore((state) => state.user)
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${backendUrl}/products`)
            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to fetch products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('Price') ? Number(value) : value
        }))
    }

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            image: '',
            originalPrice: '',
            newPrice: ''
        })
        setEditingProduct(null)
        setShowModal(false)
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(`${backendUrl}/products/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Product added successfully!')
                fetchProducts()
                resetForm()
            } else {
                toast.error(data.error || 'Failed to add product')
            }
        } catch (error) {
            console.error('Error adding product:', error)
            toast.error('Failed to add product')
        }
    }

    const handleEditProduct = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(`${backendUrl}/products/${editingProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Product updated successfully!')
                fetchProducts()
                resetForm()
            } else {
                toast.error(data.error || 'Failed to update product')
            }
        } catch (error) {
            console.error('Error updating product:', error)
            toast.error('Failed to update product')
        }
    }

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const response = await fetch(`${backendUrl}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Product deleted successfully!')
                fetchProducts()
            } else {
                toast.error(data.error || 'Failed to delete product')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to delete product')
        }
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            category: product.category,
            image: product.image || '',
            originalPrice: product.originalPrice,
            newPrice: product.newPrice
        })
        setShowModal(true)
    }

    const openAddModal = () => {
        resetForm()
        setShowModal(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Products</h1>
                        <p className="text-gray-600">Add, edit, or delete products from your store</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        Add Product
                    </button>
                </div>

                {/* Products Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-lg text-gray-600">Loading products...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image && (
                                                    <img className="h-10 w-10 rounded object-cover mr-3" src={product.image} alt={product.name} />
                                                )}
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{product.originalPrice}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            ₹{product.newPrice}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No products found. Add your first product!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Sale Price (₹)</label>
                                    <input
                                        type="number"
                                        name="newPrice"
                                        value={formData.newPrice}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
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

export default AdminProducts
