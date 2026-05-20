import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../../lib/axios";
import { productService } from "../services/productService";
import { handleApiError } from "../../../lib/errorHandler";
import { useUserStore } from "../../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { ADMIN_PRODUCT_CATEGORIES } from "../../../constants";

const AdminProductsPage = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imageMode, setImageMode] = useState("upload");
    const [imageUrlInput, setImageUrlInput] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        originalPrice: "",
        newPrice: "",
    });

    /* =========================
       ADMIN GUARD
       ========================= */
    useEffect(() => {
        if (!user) return navigate("/login");
        if (!user.isAdmin) {
            toast.error("Admin access required");
            navigate("/");
        }
    }, [user, navigate]);

    /* =========================
       FETCH PRODUCTS
       ========================= */
    const fetchProducts = async (signal) => {
        try {
            setLoading(true);
            // FIX BUG-10: was passing "" (string) which Object.entries() can't handle correctly
            const data = await productService.getProducts({}, signal);
            setProducts(data.products || []);
        } catch (err) {
            if (err.name === "CanceledError" || err.name === "AbortError") {
                return;
            }
            handleApiError(err, "Failed to fetch products");
        } finally {
            if (!signal || !signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) return;

        const controller = new AbortController();
        fetchProducts(controller.signal);

        return () => {
            controller.abort();
        };
    }, [user]);

    /* =========================
       IMAGE HELPERS
       ========================= */
    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

    const uploadImage = async (file) => {
        const base64 = await toBase64(file);
        const { data } = await axiosInstance.post("/upload", { image: base64 });
        return data.url || "";
    };

    /* =========================
       FORM HELPERS
       ========================= */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes("Price") || name === "stock" ? Number(value) : value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            originalPrice: "",
            newPrice: "",
            stock: "",
        });
        setImageFile(null);
        setImageUrlInput("");
        setImageMode("upload");
        setEditingProduct(null);
        setShowModal(false);
    };

    /* =========================
       CREATE / UPDATE PRODUCT
       ========================= */
    const submitProduct = async (e) => {
        e.preventDefault();

        try {
            let finalImage = "";

            // URL has priority
            if (imageMode === "url" && imageUrlInput.trim()) {
                finalImage = imageUrlInput.trim();
            } else if (imageMode === "upload" && imageFile) {
                finalImage = await uploadImage(imageFile);
            } else if (editingProduct?.image) {
                // Preserve existing image when no new one is provided
                finalImage = editingProduct.image;
            }

            const payload = {
                ...formData,
                image: finalImage,
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct._id, payload);
                toast.success("Product updated");
            } else {
                await productService.addProduct(payload);
                toast.success("Product added");
            }

            // FIX BUG-09: use an AbortController so in-flight request is cancelled on unmount
            const fetchController = new AbortController();
            await fetchProducts(fetchController.signal);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    /* =========================
       DELETE PRODUCT
       ========================= */
    const deleteProduct = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        const previousProducts = products;
        setProducts(prev => prev.filter(p => p._id !== id));
        try {
            await productService.deleteProduct(id);
            toast.success("Product deleted");
        } catch (err) {
            setProducts(previousProducts);
            handleApiError(err, "Delete failed");
        }
    };

    /* =========================
       EDIT PRODUCT
       ========================= */
    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            originalPrice: product.originalPrice,
            newPrice: product.newPrice,
            stock: product.stock ?? 0,
        });

        setImageUrlInput(product.image || "");
        setImageMode(product.image ? "url" : "upload");
        setImageFile(null);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-5 py-2 rounded cursor-pointer"
                >
                    + Add Product
                </button>
            </div>

            <table className="w-full bg-white shadow rounded">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <tr key={i} className="border-t border-slate-100">
                                <td className="p-3 flex items-center gap-2">
                                    <div className="h-8 w-8 rounded shimmer" />
                                    <div className="h-5 w-32 rounded shimmer" />
                                </td>
                                <td className="p-3">
                                    <div className="h-5 w-20 rounded shimmer mx-auto" />
                                </td>
                                <td className="p-3">
                                    <div className="h-5 w-16 rounded shimmer mx-auto" />
                                </td>
                                <td className="p-3 text-right">
                                    <div className="h-5 w-24 rounded shimmer ml-auto" />
                                </td>
                            </tr>
                        ))
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-6 text-center text-gray-500">
                                No products found
                            </td>
                        </tr>
                    ) : (
                        products.map((p) => (
                            <tr key={p._id} className="border-t">
                                <td className="p-3 flex items-center gap-2">
                                    {p.image && (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="h-8 w-8 rounded object-cover"
                                        />
                                    )}
                                    {p.name}
                                </td>
                                <td className="p-3">{p.category}</td>
                                <td className="p-3">₹{p.newPrice}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                        p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                                    }`}>
                                        {p.stock ?? 0}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => openEditModal(p)}
                                        className="text-blue-600 mr-4 cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(p._id)}
                                        className="text-red-600 cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        onClick={resetForm}
                    />

                    {/* Panel */}
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                                    {editingProduct ? "Edit Product" : "New Product"}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {editingProduct ? "Update the product details below" : "Fill in the details to add a new product"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form id="admin-product-form" onSubmit={submitProduct} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    Product Name
                                </label>
                                <input
                                    name="name"
                                    placeholder="e.g. Amul Gold Milk 500ml"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>Select category</option>
                                    {ADMIN_PRODUCT_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                        MRP (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        placeholder="100"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                        Sale (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="newPrice"
                                        placeholder="80"
                                        value={formData.newPrice}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        placeholder="50"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Discount preview badge */}
                            {formData.originalPrice && formData.newPrice && Number(formData.newPrice) < Number(formData.originalPrice) && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl">
                                    <span className="text-green-700 text-xs font-extrabold">
                                        {Math.round(((Number(formData.originalPrice) - Number(formData.newPrice)) / Number(formData.originalPrice)) * 100)}% OFF
                                    </span>
                                    <span className="text-green-600 text-xs">
                                        Customer saves ₹{Number(formData.originalPrice) - Number(formData.newPrice)}
                                    </span>
                                </div>
                            )}

                            {/* Image Section */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                    Product Image
                                </label>

                                {/* Radio Pill Toggle */}
                                <div className="flex bg-slate-100 rounded-xl p-1 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setImageMode("upload")}
                                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition cursor-pointer ${
                                            imageMode === "upload"
                                                ? "bg-white text-slate-800 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        📁 Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageMode("url")}
                                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition cursor-pointer ${
                                            imageMode === "url"
                                                ? "bg-white text-slate-800 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        🔗 Paste URL
                                    </button>
                                </div>

                                {/* Upload input */}
                                {imageMode === "upload" && (
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-green-300 transition cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer cursor-pointer"
                                        />
                                        {imageFile && (
                                            <p className="text-[10px] text-green-600 mt-2 font-semibold">
                                                ✓ {imageFile.name} selected
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* URL input */}
                                {imageMode === "url" && (
                                    <input
                                        type="url"
                                        placeholder="https://example.com/product-image.jpg"
                                        value={imageUrlInput ?? ""}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                                    />
                                )}

                                {/* Image preview */}
                                {(imageUrlInput && imageMode === "url") || (editingProduct?.image && !imageFile) ? (
                                    <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <img
                                            src={imageMode === "url" && imageUrlInput ? imageUrlInput : editingProduct?.image}
                                            alt="Preview"
                                            className="h-12 w-12 rounded-lg object-cover bg-white"
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />
                                        <span className="text-xs text-slate-500 truncate flex-1">Image preview</span>
                                    </div>
                                ) : null}
                            </div>
                        </form>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="product-form-fallback"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector("#admin-product-form")?.requestSubmit();
                                }}
                                className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                {editingProduct ? "Update Product" : "Add Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;
