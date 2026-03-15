import { useState, useEffect } from "react";
import axios from "../../api/axios";
import "../AppStyles.css";

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  appliedAt: string;
}

const ManageApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/applications");
      setApplications(res.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await axios.patch(`/admin/applications/${appId}`, { status: newStatus });
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const filteredApps = filter === "all" 
    ? applications 
    : applications.filter(app => app.status === filter);

  const stats = {
    pending: applications.filter(a => a.status === "pending").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="admin-applications">
      <h1 className="page-title">Manage Applications</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <p className="stat-label">Accepted</p>
            <p className="stat-value">{stats.accepted}</p>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">✗</div>
          <div className="stat-content">
            <p className="stat-label">Rejected</p>
            <p className="stat-value">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-container">
        <div className="filter-buttons">
          {["all", "pending", "accepted", "rejected"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-button ${filter === status ? 'filter-active' : ''}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {filteredApps.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state">No applications found</p>
          </div>
        ) : (
          filteredApps.map(app => (
            <div key={app._id} className="application-card">
              <div className="application-content">
                <div className="application-info">
                  <h3 className="application-name">{app.user?.name}</h3>
                  <p className="application-email">{app.user?.email}</p>
                  <p className="application-details">
                    Applied for: <span className="font-medium">{app.job?.title}</span> at {app.job?.company}
                  </p>
                  <p className="application-date">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="application-actions">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className={`status-select status-${app.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accept</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageApplications;