import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/register", form);
      alert("Registration successful! Please login.");
      setForm({ name: "", email: "", password: "", role: "user" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-gray-950 mb-8">
          Ride Share
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-950">Register</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="bg-gray-100 mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="bg-gray-100 mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="bg-gray-100 mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
            required
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Select your role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-[#eeeeee] text-gray-900 text-lg px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold rounded-lg px-4 py-2 w-full text-lg"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
