import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-lg">
        
        <h1 className="text-9xl font-extrabold text-gray-200 select-none">
          404
        </h1>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 -mt-6">
          Page Not Found
        </h2>

        <p className="text-gray-500 mt-4 text-lg">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl shadow-md transition duration-300"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}