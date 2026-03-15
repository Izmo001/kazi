import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import "../AppStyles.css";

interface DashboardStats {
  totalJobs: number;
  totalUsers: number;
  totalApplications: number;
  pendingApplications: number;
  recentJobs: any[];
  recentApplications: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentJobs: [],
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const jobsRes = await axios.get("/jobs");
      const jobs = jobsRes.data;
      
      const appsRes = await axios.get("/admin/applications");
      const applications = appsRes.data;
      
      let totalUsers = 0;
      try {
        const usersRes = await axios.get("/admin/users");
        totalUsers = usersRes.data.length;
      } catch (error) {
        console.log("Users endpoint not available");
      }

      setStats({
        totalJobs: jobs.length,
        totalUsers: totalUsers,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === "pending").length,
        recentJobs: jobs.slice(0, 5),
        recentApplications: applications.slice(0, 5)
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <p className="stat-label">Total Jobs</p>
            <p className="stat-value">{stats.totalJobs}</p>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <p className="stat-label">Total Applications</p>
            <p className="stat-value">{stats.totalApplications}</p>
          </div>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pendingApplications}</p>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="recent-grid">
        {/* Recent Jobs */}
        <div className="recent-card">
          <h2 className="recent-title">Recent Jobs</h2>
          {stats.recentJobs.length === 0 ? (
            <p className="empty-state">No jobs posted yet</p>
          ) : (
            <div className="recent-list">
              {stats.recentJobs.map((job: any) => (
                <div key={job._id} className="recent-item">
                  <p className="recent-item-title">{job.title}</p>
                  <p className="recent-item-subtitle">{job.company}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/jobs" className="recent-link">
            View All Jobs <span className="recent-link-arrow">→</span>
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="recent-card">
          <h2 className="recent-title">Recent Applications</h2>
          {stats.recentApplications.length === 0 ? (
            <p className="empty-state">No applications yet</p>
          ) : (
            <div className="recent-list">
              {stats.recentApplications.map((app: any) => (
                <div key={app._id} className="recent-item">
                  <p className="recent-item-title">{app.user?.name || "Unknown"}</p>
                  <p className="recent-item-subtitle">{app.job?.title || "Unknown Job"}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/applications" className="recent-link">
            View All Applications <span className="recent-link-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;