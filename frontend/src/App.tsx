import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ProfilePage from "./pages/Profile";
import SubscriptionPage from "./pages/SubscriptionPage";
import AnalyticsDashboard from "./pages/admin/analyticsDashboard";
// Admin Pages
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageApplications from "./pages/admin/ManageApplications";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminSettings from "./pages/admin/AdminSettings";

// Layout wrapper for pages that need navbar
const WithNavbar = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - No Navbar */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes - With Navbar */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <WithNavbar>
                    <UserDashboard />
                  </WithNavbar>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <WithNavbar>
                    <ProfilePage />
                  </WithNavbar>
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <WithNavbar>
                    <SubscriptionPage />
                  </WithNavbar>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Use AdminLayout (which has its own sidebar) */}
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
              <Route path="analytics" element={<AnalyticsDashboard />} /> {/* ADD THIS */}
              <Route path="users" element={<ManageUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-6xl font-bold mb-4">404</h1>
                    <p className="text-xl mb-8">Page not found</p>
                    <a
                      href="/"
                      className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;