
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Package,
  IndianRupee,
  AlertTriangle,
  Boxes
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/products/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(() => setError("Unable to load dashboard data."));
  }, []);

  // Format currency in Indian numbering style
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  const cards = [
    {
      title: "Total Products",
      value: data?.total_products ?? 0,
      icon: Package,
    },
    {
      title: "Total Stock Value",
      value: formatCurrency(data?.total_stock_value),
      icon: IndianRupee,
    },
    {
      title: "Low Stock Items",
      value: data?.low_stock_count ?? 0,
      icon: AlertTriangle,
    },
    {
      title: "Total Inventory",
      value: data?.total_quantity ?? 0,
      icon: Boxes,
    },
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>StockFlow Dashboard</h1>
      <p>Welcome to your inventory overview.</p>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "12px",
                boxShadow: "0 2px 12px #00000012",
              }}
            >
              <Icon size={28} color="#2563eb" />

              <h3>{card.title}</h3>

              <h2>
                {data ? card.value : "Loading..."}
              </h2>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
