// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import InputField from "../../components/Inputs/InputField";

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

// export default function VerifyOtp() {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     if (!otp) return Swal.fire({ icon: "warning", title: "Missing", text: "Please enter the OTP sent to your email." });

//     setLoading(true);
//     try {
//       const res = await fetch(`${BASE}/auth/verify-otp/${encodeURIComponent(token)}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ otp: otp.trim() }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.ok) {
//         Swal.fire({ icon: "success", title: "Verified", text: data.message || "Account verified — you can now log in." });
//         navigate("/"); // go to login
//       } else {
//         Swal.fire({ icon: "error", title: "Invalid", text: data.message || "Invalid or expired OTP" });
//         console.error("verify-otp failed:", res.status, data);
//       }
//     } catch (err) {
//       console.error("Network error:", err);
//       Swal.fire({ icon: "error", title: "Error", text: "Network error while verifying OTP." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
//       <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
//         <h2 className="text-xl font-semibold mb-2">Verify OTP</h2>
//         <p className="text-sm text-gray-600 mb-4">Enter the 1-time OTP sent to your email to activate your account.</p>

//         <form onSubmit={handleVerify} className="space-y-4">
//           <InputField
//             id="otp"
//             name="otp"
//             type="text"
//             label="OTP"
//             value={otp}
//             onchange={(e) => setOtp(e.target.value)}
//             placeholder="Enter OTP"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 rounded-md text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
//           >
//             {loading ? "Verifying..." : "Verify OTP"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }





// src/pages/auth/VerifyOtp.jsx
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-0">
      <div className="grid md:grid-cols-2 rounded-4xl items-stretch max-w-7xl w-full bg-white shadow-lg overflow-hidden">
        {/* Left (Form) Section */}
        <div className="p-8 w-full">
          <form className="space-y-6 lg:p-24 p-0" onSubmit={handleVerify}>
            <div className="mb-8 text-center md:text-left">
              <img src={'/logo.png'} alt="IoTify Logo" className="h-10 mx-auto md:mx-0 mb-4" />
              <h3 className="text-slate-900 text-2xl font-semibold">Verify OTP</h3>
              <p className="text-slate-500 text-sm mt-2">
                Enter the 1-time OTP sent to your email to activate your account.
              </p>
            </div>

            <div>
              <InputField
                id="otp"
                name="otp"
                type="text"
                label="OTP"
                value={otp}
                onchange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>

            <div className="!mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        </div>

        {/* Right (Images) Section */}
        <div style={{ backgroundColor: "#EAEAEA" }} className="h-full hidden md:flex flex-col items-center justify-between p-4">
          {/* Top Image */}
          <div className="w-full flex justify-end p-4">
            <img src={'/login-right-top-image.png'} className="h-16 w-auto object-contain" alt="Top Right Illustration" />
          </div>

          {/* Main Image */}
          <div className="flex-grow flex items-center justify-center p-4">
            <img src={'/login-image.png'} className="w-full h-auto object-contain" alt="Illustration" />
          </div>
        </div>
      </div>
    </div>
  );
}
