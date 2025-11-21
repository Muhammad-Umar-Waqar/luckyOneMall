// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import InputField from "../../components/Inputs/InputField"; 

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const em = (email || "").trim();
    if (!em) {
      return Swal.fire({ icon: "warning", title: "Enter email" });
    }

    // basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      return Swal.fire({ icon: "warning", title: "Enter a valid email" });
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.message==="Password reset link sent to your email") {
        await Swal.fire({
          icon: "success",
          title: "Reset link sent",
          html:
            data.message ||
            "If the email exists, a password reset link has been sent. Check your inbox.",
        });
        setEmail("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to send reset link",
        });
      }
    } catch (err) {
      console.error("Forgot password network error:", err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Unable to connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter your account email — we’ll send a reset link that expires in 15 minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="email"
            name="email"
            type="email"
            value={email}
            onchange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            label="Email"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
