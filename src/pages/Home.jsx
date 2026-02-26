import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user, logout } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("buy"); // buy | sell
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    price: "",
    category: "",
  });

  const isAdmin = user?.role === "admin";

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search) params.append("q", search);

      const res = await fetch(
        `http://localhost:5000/api/items?${params.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to load items");
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      description: "",
      price: "",
      category: "",
    });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.price || !form.category) {
      setError("All item fields are required.");
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
      };

      const url = form.id
        ? `http://localhost:5000/api/items/${form.id}`
        : "http://localhost:5000/api/items";
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save item");
      }

      resetForm();
      fetchItems();
      setMode("buy");
    } catch (err) {
      setError(err.message || "Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setMode("sell");
    setForm({
      id: item._id,
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete item");
      }

      fetchItems();
    } catch (err) {
      setError(err.message || "Failed to delete item");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">Marketplace</div>
        <div className="header-right">
          <span className="user-pill">
            {user?.name || "Guest"}
          </span>
          <button className="btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="content">
        <section className="toolbar">
          <div>
            <h1 className="page-title">Buy &amp; Sell Items</h1>
            <p className="page-subtitle">
              Browse items for sale or list your own.
            </p>
          </div>

          <div className="mode-toggle">
            <button
              className={mode === "buy" ? "chip chip-active" : "chip"}
              onClick={() => setMode("buy")}
            >
              Buy
            </button>
            <button
              className={mode === "sell" ? "chip chip-active" : "chip"}
              onClick={() => setMode("sell")}
            >
              Sell
            </button>
          </div>
        </section>

        <section className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search items by name, category, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {mode === "sell" && (
            <button
              className="btn-primary"
              type="button"
              onClick={resetForm}
            >
              + New Item
            </button>
          )}
        </section>

        {mode === "sell" && (
          <section className="auth-form" style={{ marginTop: 18 }}>
            <form onSubmit={handleCreateOrUpdate} className="auth-form">
              <div className="toolbar">
                <div>
                  <h2 className="page-title">
                    {form.id ? "Edit Listing" : "Create Listing"}
                  </h2>
                  <p className="page-subtitle">
                    {form.id
                      ? "Update your existing item details."
                      : "Add a new item for sale."}
                  </p>
                </div>
              </div>

              {error && (
                <div className="alert-error">{error}</div>
              )}

              <label className="field-label">
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Used Laptop"
                />
              </label>

              <label className="field-label">
                Description
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short description of the item"
                />
              </label>

              <div className="search-row" style={{ marginTop: 10 }}>
                <label className="field-label" style={{ flex: 1 }}>
                  Price (₹)
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 5000"
                    min="0"
                  />
                </label>

                <label className="field-label" style={{ flex: 1 }}>
                  Category
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="e.g. electronics, books"
                  />
                </label>
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <button type="submit" className="btn-primary">
                  {form.id ? "Save Changes" : "Create Listing"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {loading && (
          <div className="empty-state">Loading items...</div>
        )}

        <section className="grid">
          {filteredItems.length === 0 && !loading ? (
            <div className="empty-state">
              No items found. Try a different search.
            </div>
          ) : (
            filteredItems.map((item) => (
              <article key={item._id} className="card">
                <div className="card-badge">{item.category}</div>
                <h2 className="card-title">{item.title}</h2>
                <p className="card-description">
                  {item.description}
                </p>
                <div className="card-footer">
                  <span className="price">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {mode === "buy" ? (
                    <button className="btn-primary-sm">
                      Buy Now
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-outline-sm"
                        type="button"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-outline-sm"
                        type="button"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;

