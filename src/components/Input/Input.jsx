import { forwardRef } from "react";

const Input = forwardRef(({ type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900"
      {...props}
    />
  );
});

export default Input;