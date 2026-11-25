
import { Search, Bell, ChevronDown } from "lucide-react";

function Navbar() {
  return (
    <header className="top-navbar">
      <div className="navbar-title">
        <h2>StockFlow Inventory Management</h2>
        <p>Manage your inventory with confidence</p>
      </div>

      <div className="navbar-actions">
        <div className="navbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="notification-button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="navbar-profile">
          <div className="profile-avatar">A</div>
          <div className="profile-info">
            <strong>Inventory Admin</strong>
            <span>Administrator</span>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
