"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 const handleLogin = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // ❗ required
      },
      body: JSON.stringify(form),
      credentials: "include", // ❗ required for cookies
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    // ✅ redirect correctly
    if (data.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard"); // 🔥 FIX HERE
    }

  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Sign In
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-sm">{error}</p>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-sm mt-4 text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}