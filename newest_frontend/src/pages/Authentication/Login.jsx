// Login.jsx
import { useState } from 'react';
import {NavLink, useNavigate} from 'react-router-dom'
import { useStore } from '../../contexts/storecontexts';
import Swal from 'sweetalert2';

const Login = () => {
  const [FormData, setFormData] = useState({email:"",password:""})
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const { login, getUser } = useStore();
  const BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:5050";

  const onchange=(e)=>{
    const {name,value}=e.target;
    setFormData({...FormData,[name]:value})
  }

  const onSubmit = () => {
    if (!FormData.email || !FormData.password) {
      alert("Please fill in all fields.");
      return;
    }
    handleLogin(FormData.email, FormData.password);
  };



const handleLogin = async (email, password) => {

  try {
    const response = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    
    if (response.ok && data.message === "Login successful") {
      
      login({ token: data.token, user: data.user });

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome, ${data.user.name}!`,
        timer: 2000,
        showConfirmButton: false,
      });

       await getUser();


        if (data?.user?.role === "admin") {
           navigate("/admin/management");
        } else {
          navigate("/management");
        }
      
      
    } else if (data.message === "Invalid credentials") {
      Swal.fire({
        icon: "error",
        title: "Invalid Credentials",
        text: "Please check your email or password.",
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Unexpected Error",
        text: data.message || "Something went wrong.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Unable to connect to the server. Please try again later.",
    });
  }
};


  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-0"> {/* Added padding for small screens, removed for larger */}
      <div className="grid md:grid-cols-2 rounded-4xl items-stretch max-w-7xl w-full bg-white shadow-lg overflow-hidden"> {/* Combined background, shadow, and rounded corners for the whole container to remove gaps */}
        {/* Left (Form) Section */}
        <div className="p-8 w-full"> {/* No need for max-w-md or mx-auto here, grid handles width */}
          <form className="space-y-6 lg:p-24 p-0" onSubmit={(e) => e.preventDefault()}>
            <div className="mb-8 text-center md:text-left">
              <img src={'/logo.png'} alt="IoTify Logo" className="h-10 mx-auto md:mx-0 mb-4" />
              <h3 className="text-slate-900 text-2xl font-semibold">Log in to your Account</h3>
              <p className="text-slate-500 text-sm mt-2">
                Welcome Back! Select method to log in
              </p>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={FormData.email}
                  onChange={onchange}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-4 py-3 rounded-lg outline-blue-600"
                  placeholder="Email"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute left-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 12c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm0-10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
                    data-original="#000000"
                  />
                </svg>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  value={FormData.password}
                  onChange={onchange}
                  className="w-full text-sm text-slate-800 border border-slate-300 pl-10 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Password"
                />
               {/* Lock icon (left) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#bbb"
          stroke="#bbb"
          className="w-[18px] h-[18px] absolute left-4"
          viewBox="0 0 24 24"
        >
          <path d="M17 9v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5v2h-3v14h16v-14h-3zm-9 0v-2c0-2.209 1.791-4 4-4s4 1.791 4 4v2h-8zm12 12h-12v-10h12v10z" />
        </svg>

        {/* Eye icon (right) */}
        <svg
          onClick={() => setShowPassword(!showPassword)} // 👈 toggle visibility
          xmlns="http://www.w3.org/2000/svg"
          fill="#bbb"
          stroke="#bbb"
          className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
          viewBox="0 0 128 128"
        >
          {showPassword ? (
              <path
                d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                data-original="#000000"
              />
          ) : (
            // 🙈 "Hidden" icon (with slash)
            <path d="M2 2l124 124-6 6L89.9 100.9C82.8 103 74.8 104 64 104 22.1 104 1.4 67.5.5 65.9a4 4 0 0 1 0-3.9c.7-1.3 13.4-23 38-33.4L8 8l6-6zm36.5 36.5l7.4 7.4C43.3 50.2 40 56.7 40 64c0 13.2 10.8 24 24 24 7.3 0 13.8-3.3 18.1-8.4l7.4 7.4C84 93.5 74.8 96 64 96 32 96 13.4 71.2 8.7 64 13.5 56.8 32 32 64 32c10.8 0 20 2.5 26.5 6.5z" />
          )}
        </svg>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-4">
              
              <div className="text-sm">
               
                <NavLink to="/forgot-password" className="text-blue-600 hover:underline font-medium">Forgot Password</NavLink>
                
              </div>
            </div>
            <div className="!mt-12">
              <button
                type="button"
                className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                onClick={onSubmit}
             >
                Log In
              </button>
            </div>
          </form>
        </div>

        {/* Right (Images) Section */}
        <div style={{backgroundColor:'#EAEAEA'}} className=" h-full hidden md:flex flex-col items-center justify-between p-4"> {/* Changed to flex-col and justify-between for image placement */}
          {/* Top Image */}
          <div className="w-full flex justify-end p-4"> {/* Aligned to top right */}
            <img
              src={'login-right-top-image.png'}
              className="h-16 w-auto object-contain" 
              alt="Top Right Illustration"
            />
          </div>

          {/* Main Image */}
          <div className="flex-grow flex items-center justify-center p-4"> {/* Takes remaining space */}
            <img
              src={'/login-image.png'}
              className="w-full h-auto object-contain"
              alt="IoT HVAC Control"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
