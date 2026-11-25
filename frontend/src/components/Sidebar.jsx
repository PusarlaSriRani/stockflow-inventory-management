
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Boxes,
  ChevronRight,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Boxes size={25} />
        </div>

        <div>
          <h2>StockFlow</h2>
          <span>INVENTORY SYSTEM</span>
        </div>
      </div>

      {/* Workspace */}
      <div className="workspace">
        <span className="workspace-dot"></span>
        <span>My Workspace</span>
        <ChevronRight size={15} />
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <p className="sidebar-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">A</div>

          <div className="user-details">
            <strong>Inventory Admin</strong>
            <span>Administrator</span>
          </div>
        </div>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <p className="sidebar-version">StockFlow v1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
