import { useContext, type ReactNode, } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext missing. Wrap your app in <AuthProvider>");

  const { user, loading } = auth;

  if (loading) return <p>Loading...</p>; // show spinner if needed
  if (!user) return <Navigate to="/" replace />; // redirect if not authenticated

  return <>{children}</>;
};

export default ProtectedRoute;