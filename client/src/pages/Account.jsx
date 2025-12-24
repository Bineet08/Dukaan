import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Account = () => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-600">
        Please log in to view your account.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      {/* Profile */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Name:</span> {user.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>

        <Link
          to="/settings"
          className="inline-block mt-4 text-green-600 font-medium hover:underline"
        >
          Edit Profile →
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/orders"
          className="bg-gray-50 border rounded-lg p-6 hover:shadow transition"
        >
          <h3 className="font-semibold text-lg mb-2">My Orders</h3>
          <p className="text-sm text-gray-600">
            View your order history and order status
          </p>
        </Link>

        <Link
          to="/settings"
          className="bg-gray-50 border rounded-lg p-6 hover:shadow transition"
        >
          <h3 className="font-semibold text-lg mb-2">Account Settings</h3>
          <p className="text-sm text-gray-600">
            Update profile and security settings
          </p>
        </Link>

        {user.isAdmin && (
          <Link
            to="/admin/dashboard"
            className="bg-yellow-50 border rounded-lg p-6 hover:shadow transition"
          >
            <h3 className="font-semibold text-lg mb-2">
              Admin Dashboard
            </h3>
            <p className="text-sm text-gray-600">
              Manage users, orders, and products
            </p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Account;
