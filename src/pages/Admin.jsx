import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/home");
    }
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/items/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load items");
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">Admin Panel</div>
      </header>
      <main className="content">
        <h1 className="page-title">All Listings</h1>
        <p className="page-subtitle">
          Manage all items created in the marketplace.
        </p>
        {error && <div className="alert-error">{error}</div>}
        <table style={{ width: "100%", marginTop: 16, fontSize: 13 }}>
          <thead>
            <tr>
              <th align="left">Title</th>
              <th align="left">Seller</th>
              <th align="left">Price</th>
              <th align="left">Status</th>
              <th align="left">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.seller?.email}</td>
                <td>₹{item.price}</td>
                <td>{item.status}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Admin;

