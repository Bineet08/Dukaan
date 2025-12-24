import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";

const AdminProducts = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imageMode, setImageMode] = useState("upload"); // upload | url
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
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get("/products");
            setProducts(data.products || []);
        } catch {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
            [name]: name.includes("Price") ? Number(value) : value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            originalPrice: "",
            newPrice: "",
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
            }

            const payload = {
                ...formData,
                image: finalImage,
            };

            if (editingProduct) {
                await axiosInstance.put(`/products/${editingProduct._id}`, payload);
                toast.success("Product updated");
            } else {
                await axiosInstance.post("/products/add", payload);
                toast.success("Product added");
            }

            fetchProducts();
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
        try {
            await axiosInstance.delete(`/products/${id}`);
            toast.success("Product deleted");
            fetchProducts();
        } catch {
            toast.error("Delete failed");
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
                    className="bg-green-600 text-white px-5 py-2 rounded"
                >
                    + Add Product
                </button>
            </div>

            {loading ? (
                <p className="text-center py-20">Loading...</p>
            ) : (
                <table className="w-full bg-white shadow rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Product</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
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
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => openEditModal(p)}
                                        className="text-blue-600 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(p._id)}
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </h2>

                        <form onSubmit={submitProduct} className="space-y-3">
                            <input
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border py-2 px-5 rounded-2xl w-full "
                                required
                            />
                            <input
                                name="category"
                                placeholder="Category"
                                value={formData.category}
                                onChange={handleChange}
                                className="border py-2 px-5 rounded-2xl w-full "
                                required
                            />
                            <input
                                type="number"
                                name="originalPrice"
                                placeholder="Original Price"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                className="border py-2 px-5 rounded-2xl w-full "
                                required
                            />
                            <input
                                type="number"
                                name="newPrice"
                                placeholder="Sale Price"
                                value={formData.newPrice}
                                onChange={handleChange}
                                className="border py-2 px-5 rounded-2xl w-full "
                                required
                            />

                            {/* IMAGE MODE */}
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 ">
                                    <input
                                        type="radio"
                                        checked={imageMode === "upload"}
                                        onChange={() => setImageMode("upload")}
                                    />
                                    Upload Image
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={imageMode === "url"}
                                        onChange={() => setImageMode("url")}
                                    />
                                    Image URL
                                </label>
                            </div>

                            {imageMode === "upload" ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="border p-2 rounded-2xl w-full "
                                />
                            ) : (
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    className="border p-2 rounded-2xl w-full "
                                />
                            )}

                            <div className="flex gap-3 pt-2">
                                <button className="bg-green-600 text-white px-4 py-2 rounded flex-1">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-300 px-4 py-2 rounded flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
