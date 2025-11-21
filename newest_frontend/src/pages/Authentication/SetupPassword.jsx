import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

export default function SetupPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pwd = (password || "").trim();

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(pwd)) {
      return Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 8 characters long, contain one uppercase letter, and one special character.",
      });
    }

    if (pwd !== confirm) {
      return Swal.fire({
        icon: "warning",
        title: "Mismatch",
        text: "Passwords do not match.",
      });
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/set-password/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Set",
          text: data.message || "Password set successfully. OTP sent to your email.",
        });
        navigate(`/verify-otp/${encodeURIComponent(token)}`);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to set password.",
        });
      }
    } catch (err) {
      console.error("Network error:", err);
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
        <h2 className="text-xl font-semibold mb-2">Set Your Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          Create a secure password with at least one uppercase letter, one special character, and minimum 8 characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Field */}
          <div className="relative flex items-center">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
              placeholder="New Password"
            />
            {/* Lock icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#bbb"
              stroke="#bbb"
              className="w-[18px] h-[18px] absolute left-4"
              viewBox="0 0 24 24"
            >
              <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
            </svg>

            {/* Eye toggle */}
            <svg
              onClick={() => setShowPassword(!showPassword)}
              xmlns="http://www.w3.org/2000/svg"
              fill="#bbb"
              stroke="#bbb"
              className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
              viewBox="0 0 128 128"
            >
              {showPassword ? (
                <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24z" />
              ) : (
                <path d="M2 2l124 124-6 6L89.9 100.9C82.8 103 74.8 104 64 104 22.1 104 1.4 67.5.5 65.9a4 4 0 0 1 0-3.9c.7-1.3 13.4-23 38-33.4L8 8l6-6zm36.5 36.5l7.4 7.4C43.3 50.2 40 56.7 40 64c0 13.2 10.8 24 24 24 7.3 0 13.8-3.3 18.1-8.4l7.4 7.4C84 93.5 74.8 96 64 96 32 96 13.4 71.2 8.7 64 13.5 56.8 32 32 64 32c10.8 0 20 2.5 26.5 6.5z" />
              )}
            </svg>
          </div>

          {/* Confirm Password Field */}
          <div className="relative flex items-center">
            <input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
              placeholder="Confirm Password"
            />
            {/* Lock icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#bbb"
              stroke="#bbb"
              className="w-[18px] h-[18px] absolute left-4"
              viewBox="0 0 24 24"
            >
              <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
            </svg>

            {/* Eye toggle */}
            <svg
              onClick={() => setShowConfirm(!showConfirm)}
              xmlns="http://www.w3.org/2000/svg"
              fill="#bbb"
              stroke="#bbb"
              className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
              viewBox="0 0 128 128"
            >
              {showConfirm ? (
                <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24z" />
              ) : (
                <path d="M2 2l124 124-6 6L89.9 100.9C82.8 103 74.8 104 64 104 22.1 104 1.4 67.5.5 65.9a4 4 0 0 1 0-3.9c.7-1.3 13.4-23 38-33.4L8 8l6-6zm36.5 36.5l7.4 7.4C43.3 50.2 40 56.7 40 64c0 13.2 10.8 24 24 24 7.3 0 13.8-3.3 18.1-8.4l7.4 7.4C84 93.5 74.8 96 64 96 32 96 13.4 71.2 8.7 64 13.5 56.8 32 32 64 32c10.8 0 20 2.5 26.5 6.5z" />
              )}
            </svg>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
