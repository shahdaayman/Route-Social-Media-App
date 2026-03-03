import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../components/Input/Input";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addToast } from "@heroui/react";

/*===========Zod Schema=================*/
const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Full Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(30, "Name can be maximum 30 characters"),

    username: z
      .string()
      .nonempty("Username is required")
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be maximum 30 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and _",
      ),

    email: z
      .string()
      .nonempty("Email is required")
      .email("Please enter a valid email address."),

    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Gender is required" }),
    }),

    dateOfBirth: z.coerce
      .date({
        invalid_type_error: "Date is required",
      })
      .refine((birthDate) => {
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        if (
          today.getMonth() < birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 18;
      }, "You must be at least 18 years old")
      .transform((date) => {
        return date.toISOString().split("T")[0];
      }),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must include uppercase, lowercase, number, and special character.",
      ),

    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  function myHandleFunction(values) {
    setLoading(true);
    const payload = {
      ...values,
      username: values.username.trim().toLowerCase(),
      gender: values.gender?.toLowerCase().trim(),
    };

    axios
      .post("https://route-posts.routemisr.com/users/signup", payload)
      .then((resp) => {
        console.log("resp", resp.data);
        navigate("/login");
        addToast({
          title: "Success",
          description: "Account Created Successfully!",
          color: "success",
        });
      })
      .catch((error) => {
        const message =
          error.response?.data?.message?.toLowerCase() ||
          "something went wrong";

        if (message.includes("username")) {
          setError("username", {
            type: "server",
            message: "Username already exists",
          });
        } else if (message.includes("email")) {
          setError("email", {
            type: "server",
            message: "Email already exists",
          });
        } else {
          setApiError(message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">Create a new account</h2>
      <p className="text-sm text-gray-500 mb-6">It is quick and easy.</p>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-xl text-sm text-center shadow-sm mb-5">
          {apiError}
        </div>
      )}

      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(myHandleFunction)}
      >
        {/* Full Name */}
        <Input placeholder="Full name" {...register("name")} />
        {errors.name && (
          <p className="text-red-800 text-sm">{errors.name.message}</p>
        )}

        {/* Username */}
        <Input placeholder="Username" {...register("username")} />
        {errors.username && (
          <p className="text-red-800 text-sm">{errors.username.message}</p>
        )}

        {/* Email */}
        <Input
          type="email"
          placeholder="Email address"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-800 text-sm">{errors.email.message}</p>
        )}

        {/* Gender */}
        <select
          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900"
          {...register("gender")}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.gender && (
          <p className="text-red-800 text-sm">{errors.gender.message}</p>
        )}

        {/* Date of Birth */}
        <Input type="date" {...register("dateOfBirth")} />
        {errors.dateOfBirth && (
          <p className="text-red-800 text-sm">{errors.dateOfBirth.message}</p>
        )}

        {/* Password */}
        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-800 text-sm">{errors.password.message}</p>
        )}

        {/* Confirm Password */}
        <Input
          type="password"
          placeholder="Confirm password"
          {...register("rePassword")}
        />
        {errors.rePassword && (
          <p className="text-red-800 text-sm">{errors.rePassword.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-900 text-white py-3 rounded-xl font-semibold transition ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Creating..." : "Create New Account"}
        </button>
      </form>
    </>
  );
}
