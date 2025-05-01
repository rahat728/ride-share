import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/auth/login", form);
      const userData = response.data;
      console.log("Login response:", userData); // Log the response for debugging
      localStorage.setItem("userInfo", JSON.stringify(userData));

      setForm({ email: "", password: "" });
      if (userData.user.role === "user") {
        navigate("/home");
      } else if (userData.user.role === "driver") {
        navigate("/driver");
      } else if (userData.user.role === "admin") {
        navigate("/admin");
      } else {
        setError("Invalid role. Please contact admin.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-gray-950 mb-8">Ride Share</h1>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-950">Login</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
  
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className='bg-[#eeeeee] mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
              
            />
          </div>
  
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className='bg-[#eeeeee] mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
            />
          </div>
  
          <button
            type="submit"
            className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg'
          >
            Login
          </button>
  
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Create new Account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
  
  
}

export default Login;
