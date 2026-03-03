import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../../components/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { authContext } from "../../contexts/authContext";

/*========Zod Schema===============*/
const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUserToken } = useContext(authContext);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function handleLogin(values) {
    setApiError("");
    setIsLoading(true);

    const identifier = values.identifier.trim();
    const payload = identifier.includes("@")
      ? { email: identifier, password: values.password }
      : { username: identifier.toLowerCase(), password: values.password };

    try {
      const resp = await axios.post(
        "https://route-posts.routemisr.com/users/signin",
        payload,
      );

      const token = resp?.data?.data?.token;
      const user = resp?.data?.data?.user;

      if (!token) {
        throw new Error("No token returned from API");
      }

      localStorage.setItem("token", token);
      setUserToken(token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors[0]
          : "Invalid email/username or password");

      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Log in to Route Posts
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Log in and continue your social journey.
      </p>

      {apiError && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mb-4">
          {apiError}
        </div>
      )}

      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(handleLogin)}
      >
        <Input
          type="text"
          placeholder="Email or username"
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="text-red-800 text-sm">{errors.identifier.message}</p>
        )}

        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-800 text-sm">{errors.password.message}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p
        className="text-center text-blue-900 text-sm mt-6 cursor-pointer hover:underline"
        onClick={() => navigate("/forgot-password")}
      >
        Forgot password?
      </p>
    </>
  );
}
