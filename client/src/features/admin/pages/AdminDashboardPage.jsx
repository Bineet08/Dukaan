import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../../stores/useUserStore";
import { productService } from "../../products/services/productService";
import { orderService } from "../../orders/services/orderService";
import { authService } from "../../auth/services/authService";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  ShieldAlert,
  ClipboardList,
  Mail
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell
} from "recharts";

// Static mock metrics for charts
const salesData = [
  { name: "Mon", sales: 4200 },
  { name: "Tue", sales: 5800 },
  { name: "Wed", sales: 8100 },
  { name: "Thu", sales: 7400 },
  { name: "Fri", sales: 9500 },
  { name: "Sat", sales: 12500 },
  { name: "Sun", sales: 11000 },
];

const categoryDistribution = [
  { name: "Grocery", value: 35, color: "#10b981" },
  { name: "Beauty", value: 20, color: "#ec4899" },
  { name: "Medicine", value: 25, color: "#ef4444" },
  { name: "Home", value: 15, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#6366f1" },
];

const AdminDashboardPage = () => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    revenue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    const controller = new AbortController();

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch products, orders, and users counts
        const [productsData, ordersData, usersData] = await Promise.all([
          productService.getProducts({ limit: 100 }, controller.signal),
          orderService.getAllOrders(1, 10, controller.signal),
          authService.getAllUsers(controller.signal)
        ]);

        const allProducts = productsData.products || [];
        const allOrders = ordersData.orders || [];
        const allUsers = usersData.users || [];

        // FIX BUG-23: use the frozen item.price (captured at purchase time)
        // instead of item.product?.newPrice (which is the current live price)
        const totalRevenue = allOrders.reduce((sum, order) => {
          const orderTotal = order.totalAmount || order.items?.reduce((oSum, item) => {
            return oSum + (item.price || 0) * (item.qty || 1);
          }, 0) || 0;
          return sum + orderTotal;
        }, 0);

        setMetrics({
          productsCount: allProducts.length,
          ordersCount: allOrders.length,
          usersCount: allUsers.length,
          revenue: totalRevenue,
        });

        // Filter low stock items (stock <= 5)
        const lowStock = allProducts.filter(p => p.stock <= 5);
        setLowStockProducts(lowStock);

        // Capture top 5 recent orders
        setRecentOrders(allOrders.slice(0, 5));

      } catch (err) {
        console.error("Dashboard hydration error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      controller.abort();
    };
  }, [user, navigate]);

  const stats = [
    { title: "Total Products", value: metrics.productsCount, icon: Package, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Total Orders", value: metrics.ordersCount, icon: ShoppingBag, color: "text-green-600 bg-green-50 border-green-100" },
    { title: "Registered Users", value: metrics.usersCount, icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { title: "Estimated Revenue", value: `₹${metrics.revenue.toLocaleString()}`, icon: IndianRupee, color: "text-amber-600 bg-amber-50 border-amber-100" },
  ];

  const quickActions = [
    { title: "Manage Catalog", path: "/admin/products", icon: Package, description: "Add, edit, or delete products", color: "border-slate-100 hover:border-blue-100" },
    { title: "Customer Orders", path: "/admin/orders", icon: ClipboardList, description: "Manage & dispatch orders", color: "border-slate-100 hover:border-green-100" },
    { title: "User Accounts", path: "/admin/users", icon: Users, description: "Review user permissions", color: "border-slate-100 hover:border-purple-100" },
    { title: "Feedback Messages", path: "/admin/messages", icon: Mail, description: "Check customer contact tickets", color: "border-slate-100 hover:border-pink-100" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white border border-slate-100 rounded-2xl" />
          <div className="h-80 bg-white border border-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-green-600" /> Admin Console
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Welcome back, {user?.name || "Administrator"}! Here is what's happening at your store.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
          <Clock className="h-3.5 w-3.5" />
          Live updates active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-soft transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Weekly Sales Trend</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Est. transaction sales volume over 7 days</p>
            </div>
            <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +14.2%
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                  labelStyle={{ fontWeight: "bold", fontSize: "11px" }}
                  itemStyle={{ fontSize: "12px", color: "#34d399" }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-card flex flex-col">
          <div className="mb-6">
            <h3 className="font-extrabold text-slate-800 text-sm">Category Share</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sales distribution percentages</p>
          </div>

          <div className="h-44 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical" barSize={10} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Low Stock Alert & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-extrabold text-slate-800 text-sm">Inventory Alerts</h3>
            </div>
            <span className="bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {lowStockProducts.length} low stock items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-60 space-y-3.5">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                All products stock levels are normal.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">{p.category}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                    p.stock === 0 
                      ? "bg-red-50 border-red-100 text-red-700" 
                      : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}>
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} Left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Log */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
            <h3 className="font-extrabold text-slate-800 text-sm">Recent Activity</h3>
            <Link 
              to="/admin/orders" 
              className="text-[10px] text-green-600 hover:text-green-700 font-extrabold flex items-center gap-0.5 hover:underline"
            >
              Manage Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto max-h-60 space-y-3.5">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No orders activity logged recently.
              </div>
            ) : (
              recentOrders.map((ord) => {
                const itemNames = ord.items?.map(i => i.product?.name).filter(Boolean).join(", ") || "Products";
                const totalAmount = ord.totalAmount || ord.items?.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0) || 0;
                
                return (
                  <div key={ord._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate">{itemNames}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        By <strong className="text-slate-600">{ord.phoneNumber}</strong> • ₹{totalAmount}
                      </p>
                    </div>
                    {/* FIX BUG-24: Order schema uses capitalized values: "Delivered", "Cancelled" */}
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      ord.status === "Delivered" 
                        ? "bg-green-50 text-green-700" 
                        : ord.status === "Cancelled"
                        ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700 animate-pulse"
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Quick Action grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => {
            const ActionIcon = action.icon;
            return (
              <Link
                key={idx}
                to={action.path}
                className={`bg-white rounded-2xl border p-5 shadow-card hover:shadow-soft transition-all group duration-200 flex flex-col justify-between ${action.color}`}
              >
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl w-fit group-hover:bg-green-50 transition duration-200">
                    <ActionIcon className="h-5 w-5 text-slate-600 group-hover:text-green-600 transition" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-green-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-semibold leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className="mt-4 text-[10px] font-bold text-green-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform duration-200">
                  Open Tab <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
