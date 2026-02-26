import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setMessage("All fields are required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      setMessage("Account created successfully 🎉");

      // redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

return (
  <div className="container">
    <h2>Register</h2>

    {message && <p>{message}</p>}

    <input
      type="text"
      placeholder="Enter Name"
      onChange={(e) => setName(e.target.value)}
    />

    <input
      type="email"
      placeholder="Enter Email"
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Enter Password"
      onChange={(e) => setPassword(e.target.value)}
    />

    <button onClick={handleRegister}>Register</button>

    <p>
      Already have an account?{" "}
      <span className="link" onClick={() => navigate("/login")}>
        Login
      </span>
    </p>
  </div>
);

};

export default Register;
