import React, { useState, useContext } from "react";
import { Key } from "lucide-react";
import { authContext } from "../../contexts/authContext";
import { apiServices } from "../../services/api";

export default function ChangePassword() {
  const { userToken, setUserToken } = useContext(authContext);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userToken) return alert("Please login first");

    if (form.newPassword !== form.confirmPassword) {
      return alert("New password and confirmation do not match");
    }

    try {
      setLoading(true);

      apiServices.setToken(userToken);

      const resp = await apiServices.changePassword(
        form.currentPassword,
        form.newPassword,
      );

      const newToken = resp?.data?.token || resp?.token;

      if (newToken) {
        localStorage.setItem("token", newToken);
        apiServices.setToken(newToken);
        setUserToken(newToken);
      } else {
        localStorage.removeItem("token");
        setUserToken(null);
        alert("Password changed. Please login again.");
        return;
      }

      alert("Password updated successfully");

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors[0]
          : error.message);

      alert("Failed to change password: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-gray-100 p-4 min-h-screen pt-30">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Key className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Change Password
            </h2>
            <p className="text-gray-500 text-sm">
              Keep your account secure by using a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm new password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition duration-200 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
