import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useUserStore((state) => state.login);
  const loading = useUserStore((state) => state.loading);

  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Invalid email or password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
          Sign in
        </h2>

        <p className="text-center text-sm text-gray-600 mb-6">
          Or{" "}
          <Link
            to="/register"
            state={{ from }}
            className="text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
