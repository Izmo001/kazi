import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, token, loading } = useContext(AuthContext)!;

  // Log for debugging
  console.log("AdminRoute Check:", { 
    hasToken: !!token, 
    user: user, 
    role: user?.role,
    loading 
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!token) {
    console.log("No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    console.log(`User role is ${user.role}, not ADMIN, redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Admin access granted");
  return <>{children}</>;
};

export default AdminRoute;