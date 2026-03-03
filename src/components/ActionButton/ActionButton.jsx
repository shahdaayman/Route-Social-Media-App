import React from "react";

export default function ActionButton({ icon, text }) {
  return (
    <button className="flex items-center gap-2 hover:text-blue-600 transition">
      {icon}
      {text}
    </button>
  );
}
