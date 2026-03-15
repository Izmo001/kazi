import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ProfilePage from "./pages/Profile";

// Admin Pages
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageApplications from "./pages/admin/ManageApplications";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - NO NAVBAR */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* User Dashboard - WITH NAVBAR */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <UserDashboard />
                </>
              </ProtectedRoute>
            }
          />

          {/* Profile Page - WITH NAVBAR */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <ProfilePage />
                </>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - NO NAVBAR (using AdminLayout instead) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="applications" element={<ManageApplications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;