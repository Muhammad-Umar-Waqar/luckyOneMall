import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import InputField from "../../components/Inputs/InputField";

const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

export default function VerifyOtp() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return Swal.fire({ icon: "warning", title: "Missing", text: "Please enter the OTP sent to your email." });

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/verify-otp/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: otp.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Verified", text: data.message || "Account verified — you can now log in." });
        navigate("/"); // go to login
      } else {
        Swal.fire({ icon: "error", title: "Invalid", text: data.message || "Invalid or expired OTP" });
        console.error("verify-otp failed:", res.status, data);
      }
    } catch (err) {
      console.error("Network error:", err);
      Swal.fire({ icon: "error", title: "Error", text: "Network error while verifying OTP." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the 1-time OTP sent to your email to activate your account.</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <InputField
            id="otp"
            name="otp"
            type="text"
            label="OTP"
            value={otp}
            onchange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
