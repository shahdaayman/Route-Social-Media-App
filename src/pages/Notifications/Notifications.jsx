import React, { useState } from "react";
import { Check } from "lucide-react";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6 pt-30">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-gray-200">
        <div className="p-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Notifications
            </h2>
            <p className="text-gray-500 mt-2">
              Realtime updates for likes, comments, shares, and follows.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveTab("unread")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition">
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="p-8">
          <div className="w-full rounded-xl border border-gray-200 bg-gray-50 py-16 flex items-center justify-center text-gray-500">
            No notifications yet.
          </div>
        </div>
      </div>
    </div>
  );
}