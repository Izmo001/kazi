import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../pages/AppStyles.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: "/admin", icon: "📊", label: "Dashboard" },
    { path: "/admin/jobs", icon: "💼", label: "Manage Jobs" },
    { path: "/admin/applications", icon: "📋", label: "Applications" },
    { path: "/admin/analytics", icon: "📈", label: "Analytics" }, // ADD THIS LINE
    { path: "/admin/users", icon: "👥", label: "Users" },
    { path: "/admin/settings", icon: "⚙️", label: "Settings" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h1 className="sidebar-title">Admin Panel</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;