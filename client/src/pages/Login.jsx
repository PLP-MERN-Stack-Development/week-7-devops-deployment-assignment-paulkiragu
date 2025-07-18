import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/backend_connection";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await registerUser(username);
    setUser(res.data);
    navigate("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Join Chat</h1>
        <input
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
