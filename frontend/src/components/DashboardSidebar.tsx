import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const DashboardSidebar = ({ isOpen, onClose, userRole }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊", path: "/dashboard" },
    { id: "jobs", label: "Browse Jobs", icon: "💼", path: "/dashboard/jobs" },
    { id: "applications", label: "My Applications", icon: "📝", path: "/dashboard/applications" },
    { id: "recommended", label: "Recommended", icon: "⭐", path: "/dashboard/recommended" },
    { id: "profile", label: "My Profile", icon: "👤", path: "/profile" },
  ];

  const adminItems = [
    { id: "admin", label: "Admin Dashboard", icon: "⚙️", path: "/admin" },
    { id: "manage-jobs", label: "Manage Jobs", icon: "📋", path: "/admin/jobs" },
    { id: "manage-apps", label: "Applications", icon: "📊", path: "/admin/applications" },
  ];

  const handleItemClick = () => {
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay - only visible on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Vertical Layout */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50
        transition-all duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-indigo-600 text-white">
          <span className={`font-bold text-lg ${!isOpen && 'md:hidden'}`}>
            {isOpen ? 'Menu' : 'JP'}
          </span>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-md md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items - VERTICAL LAYOUT */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Menu - Vertical */}
          <div className="space-y-1 px-2">
            {menuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleItemClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${location.pathname === item.path 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`text-sm font-medium ${!isOpen && 'md:hidden'}`}>
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t mx-2" />

          {/* Admin Menu - Vertical (only for admins) */}
          {userRole === "ADMIN" && (
            <div className="space-y-1 px-2">
              <p className={`text-xs font-semibold text-gray-400 uppercase px-3 mb-2 ${!isOpen && 'md:hidden'}`}>
                Admin
              </p>
              {adminItems.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={handleItemClick}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${location.pathname === item.path 
                      ? 'bg-yellow-50 text-yellow-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`text-sm font-medium ${!isOpen && 'md:hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer - User Info */}
        <div className="border-t p-4 bg-gray-50">
          <div className={`flex items-center gap-3 ${!isOpen && 'md:justify-center'}`}>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              👤
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">User</p>
                <p className="text-xs text-gray-500 truncate">View Profile</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;