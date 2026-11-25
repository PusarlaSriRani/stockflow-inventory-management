
import { useEffect, useState } from "react";
import API from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [editingId, setEditingId] = useState(null);

  const [adjustmentId, setAdjustmentId] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("in");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const [history, setHistory] = useState([]);
  const [historyProduct, setHistoryProduct] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await API.get("/products/");
      setProducts(res.data);
      setError("");
    } catch {
      setError("Unable to load products.");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setSku("");
    setQuantity(0);
    setPrice(0);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const payload = {
      name,
      sku,
      quantity_on_hand: Number(quantity),
      cost_price: Number(price),
      selling_price: Number(price),
    };

    try {
      if (editingId !== null) {
        await API.put(`/products/${editingId}`, payload);
        setMessage("Product updated successfully!");
      } else {
        await API.post("/products/", payload);
        setMessage("Product added successfully!");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save product."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setSku(product.sku);
    setQuantity(product.quantity_on_hand);
    setPrice(product.cost_price ?? 0);

    setAdjustmentId(null);
    setHistoryProduct(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await API.delete(`/products/${id}`);
      setMessage("Product deleted successfully!");
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete product."
      );
    }
  };

  const openAdjustment = (product, type) => {
    setAdjustmentId(product.id);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setReason("");
    setEditingId(null);
    setHistoryProduct(null);
    setMessage("");
    setError("");
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const qty = Number(adjustmentQuantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Enter a valid quantity greater than zero.");
      return;
    }

    if (reason.trim().length < 3) {
      setError("Please enter a reason of at least 3 characters.");
      return;
    }

    setLoading(true);

    try {
      await API.post(
        `/products/${adjustmentId}/stock-adjustment`,
        {
          quantity_change: adjustmentType === "in" ? qty : -qty,
          reason: reason.trim(),
        }
      );

      setMessage(
        adjustmentType === "in"
          ? "Stock added successfully!"
          : "Stock removed successfully!"
      );

      setAdjustmentId(null);
      setAdjustmentQuantity(1);
      setReason("");

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Stock adjustment failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHistory = async (product) => {
    setError("");
    setMessage("");
    setHistory([]);
    setHistoryProduct(product);
    setAdjustmentId(null);

    try {
      const res = await API.get(
        `/products/${product.id}/stock-history`
      );

      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load stock history."
      );
      setHistoryProduct(null);
    }
  };

  const closePanels = () => {
    setAdjustmentId(null);
    setHistoryProduct(null);
    setHistory([]);
  };

  return (
    <div className="products-page">

      {/* Page heading */}
      <div className="products-heading">
        <div>
          <h1>Products</h1>
          <p>Manage your products and inventory stock.</p>
        </div>

        <span className="product-count">
          {products.length} Products
        </span>
      </div>

      {/* Notifications */}
      {error && (
        <div className="product-alert error-alert">
          {error}
        </div>
      )}

      {message && (
        <div className="product-alert success-alert">
          {message}
        </div>
      )}

      {/* Add / Edit form */}
      <section className="product-section">
        <div className="section-heading">
          <h2>{editingId !== null ? "Edit Product" : "Add New Product"}</h2>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-field">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={150}
              required
            />
          </div>

          <div className="product-field">
            <label>SKU</label>
            <input
              type="text"
              placeholder="Enter SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="product-field">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              required
            />
          </div>

          <div className="product-field">
            <label>Cost Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="product-form-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : editingId !== null
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Products table */}
      <section className="product-section">
        <div className="section-heading">
          <h2>Product List</h2>
          <span>{products.length} items</span>
        </div>

        <div className="product-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Cost Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="product-name-cell">
                    {product.name}
                  </td>

                  <td>{product.sku}</td>

                  <td>
                    <span className="quantity-value">
                      {product.quantity_on_hand}
                    </span>
                  </td>

                  <td>
                    ₹{Number(product.cost_price ?? 0).toFixed(2)}
                  </td>

                  <td>
                    <div className="product-actions">
                      <button
                        className="small-action edit-action"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>

                      <button
                        className="small-action delete-action"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="small-action stock-action"
                        onClick={() => openAdjustment(product, "in")}
                      >
                        Stock In
                      </button>

                      <button
                        className="small-action stock-out-action"
                        onClick={() => openAdjustment(product, "out")}
                      >
                        Stock Out
                      </button>

                      <button
                        className="small-action history-action"
                        onClick={() => handleHistory(product)}
                      >
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-products">
                    No products found. Add your first product above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stock adjustment */}
      {adjustmentId !== null && (
        <section className="product-section detail-panel">
          <div className="section-heading">
            <h2>
              {adjustmentType === "in" ? "Stock In" : "Stock Out"}
            </h2>
            <button className="text-button" onClick={closePanels}>
              Close
            </button>
          </div>

          <form
            className="adjustment-form"
            onSubmit={handleStockAdjustment}
          >
            <div className="product-field">
              <label>Adjustment Type</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
            </div>

            <div className="product-field">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) =>
                  setAdjustmentQuantity(e.target.value)
                }
                required
              />
            </div>

            <div className="product-field">
              <label>Reason</label>
              <input
                type="text"
                placeholder="Enter reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minLength={3}
                maxLength={200}
                required
              />
            </div>

            <div className="product-form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Adjustment"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closePanels}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Stock history */}
      {historyProduct && (
        <section className="product-section detail-panel">
          <div className="section-heading">
            <div>
              <h2>Stock History</h2>
              <p>{historyProduct.name} — {historyProduct.sku}</p>
            </div>

            <button className="text-button" onClick={closePanels}>
              Close History
            </button>
          </div>

          <div className="product-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Previous Qty</th>
                  <th>Change</th>
                  <th>New Qty</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{item.previous_quantity}</td>
                    <td>
                      {item.quantity_change > 0 ? "+" : ""}
                      {item.quantity_change}
                    </td>
                    <td>{item.new_quantity}</td>
                    <td>{item.reason}</td>
                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-products">
                      No stock history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}

export default Products;
