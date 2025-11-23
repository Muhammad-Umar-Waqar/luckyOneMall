// // src/pages/auth/ForgotPassword.jsx
// import React, { useState } from "react";
// import Swal from "sweetalert2";
// import InputField from "../../components/Inputs/InputField"; 

// const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const em = (email || "").trim();
//     if (!em) {
//       return Swal.fire({ icon: "warning", title: "Enter email" });
//     }

//     // basic email check
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(em)) {
//       return Swal.fire({ icon: "warning", title: "Enter a valid email" });
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${BASE}/auth/forgot-password`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: em }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.ok && data?.message==="Password reset link sent to your email") {
//         await Swal.fire({
//           icon: "success",
//           title: "Reset link sent",
//           html:
//             data.message ||
//             "If the email exists, a password reset link has been sent. Check your inbox.",
//         });
//         setEmail("");
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: data.message || "Failed to send reset link",
//         });
//       }
//     } catch (err) {
//       console.error("Forgot password network error:", err);
//       Swal.fire({
//         icon: "error",
//         title: "Network Error",
//         text: "Unable to connect to the server.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
//       <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
//         <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
//         <p className="text-sm text-gray-600 mb-4">
//           Enter your account email — we’ll send a reset link that expires in 15 minutes.
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <InputField
//             id="email"
//             name="email"
//             type="email"
//             value={email}
//             onchange={(e) => setEmail(e.target.value)}
//             placeholder="Your email"
//             label="Email"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 rounded-md text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
//           >
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }










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

      if (res.ok && data?.message === "Password reset link sent to your email") {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-0">
      <div className="grid md:grid-cols-2 rounded-4xl items-stretch max-w-7xl w-full bg-white shadow-lg overflow-hidden">
        {/* Left (Form) Section */}
        <div className="p-8 w-full">
          <form className="space-y-6 lg:p-24 p-0" onSubmit={handleSubmit}>
            <div className="mb-8 text-center md:text-left">
              <img src={'/logo.png'} alt="IoTify Logo" className="h-10 mx-auto md:mx-0 mb-4" />
              <h3 className="text-slate-900 text-2xl font-semibold">Forgot Password</h3>
              <p className="text-slate-500 text-sm mt-2">
                Enter your account email — we’ll send a reset link that expires in 15 minutes.
              </p>
            </div>

            <div>
              <InputField
                id="email"
                name="email"
                type="email"
                value={email}
                onchange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                label="Email"
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
                {loading ? "Sending..." : "Send Reset Link"}
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
