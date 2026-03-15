import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AppStyles.css";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  requiredSkills: string[];
  salary?: { min: number; max: number; currency: string };
  type: string;
  createdAt: string;
}

interface Application {
  _id: string;
  job: Job;
  status: string;
  appliedAt: string;
}

const UserDashboard = () => {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError("");
      
      const [jobsRes, appsRes] = await Promise.all([
        axios.get("/jobs"),
        axios.get("/applications/me")
      ]);
      
      setJobs(jobsRes.data);
      setApplications(appsRes.data.applications || []);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      setApplying(jobId);
      setError("");
      setSuccess("");

      await axios.post(`/applications/apply/${jobId}`, {});

      const appsRes = await axios.get("/applications/me");
      setApplications(appsRes.data.applications || []);
      
      setSuccess("Application submitted successfully!");
      setShowJobModal(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  const appliedJobIds = applications.map(app => app.job?._id).filter(Boolean);
  const availableJobs = jobs.filter(job => !appliedJobIds.includes(job._id));
  const userSkills = user?.skills || [];
  
  const recommendedJobs = availableJobs.filter(job => 
    userSkills.some((skill: string) => 
      job.requiredSkills?.some((reqSkill: string) => 
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );

  const otherJobs = availableJobs.filter(job => !recommendedJobs.includes(job));

  const stats = {
    totalJobs: jobs.length,
    applied: applications.length,
    available: availableJobs.length,
    recommended: recommendedJobs.length
  };

  if (loading) {
    return (
      <div className="dashboard-body">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="welcome-header">
          <h1 className="welcome-title">
            Welcome back, <span className="welcome-name">{user?.name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="welcome-subtitle">Find your next great opportunity</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <p className="stat-label">Total Jobs</p>
              <p className="stat-value">{stats.totalJobs}</p>
            </div>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <p className="stat-label">Applied</p>
              <p className="stat-value">{stats.applied}</p>
            </div>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <p className="stat-label">Available</p>
              <p className="stat-value">{stats.available}</p>
            </div>
          </div>

          <div className="stat-card stat-yellow">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <p className="stat-label">Recommended</p>
              <p className="stat-value">{stats.recommended}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={() => fetchData()} className="action-button refresh-action">
            <span className="action-icon">🔄</span>
            <span className="action-text">Refresh Jobs</span>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-success">
            <span>{success}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'jobs' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              💼 All Jobs
            </button>
            <button 
              className={`tab-button ${activeTab === 'recommended' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              ⭐ Recommended
            </button>
            <button 
              className={`tab-button ${activeTab === 'applications' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              📝 My Applications
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="recent-grid">
              {/* Recent Jobs */}
              <div className="recent-card">
                <h2 className="recent-title">Recent Jobs</h2>
                {jobs.slice(0, 5).length === 0 ? (
                  <p className="empty-state">No jobs available</p>
                ) : (
                  <div className="recent-list">
                    {jobs.slice(0, 5).map(job => (
                      <div key={job._id} className="recent-item">
                        <p className="recent-item-title">{job.title}</p>
                        <p className="recent-item-subtitle">{job.company}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="recent-link"
                >
                  View All Jobs <span className="recent-link-arrow">→</span>
                </button>
              </div>

              {/* Recent Applications */}
              <div className="recent-card">
                <h2 className="recent-title">Recent Applications</h2>
                {applications.slice(0, 5).length === 0 ? (
                  <p className="empty-state">No applications yet</p>
                ) : (
                  <div className="recent-list">
                    {applications.slice(0, 5).map(app => (
                      <div key={app._id} className="recent-item">
                        <p className="recent-item-title">{app.job?.title}</p>
                        <p className="recent-item-subtitle">{app.job?.company}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setActiveTab('applications')}
                  className="recent-link"
                >
                  View All Applications <span className="recent-link-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="jobs-grid">
              {otherJobs.length === 0 ? (
                <div className="empty-state-container">
                  <p className="empty-state">No jobs available</p>
                </div>
              ) : (
                otherJobs.map(job => (
                  <div key={job._id} className="job-card">
                    <div className="job-card-header">
                      <h3 className="job-card-title">{job.title}</h3>
                      <span className="job-card-company">{job.company}</span>
                    </div>
                    <p className="job-card-location">📍 {job.location}</p>
                    <p className="job-card-description">{job.description.substring(0, 100)}...</p>
                    <div className="job-card-footer">
                      <button 
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobModal(true);
                        }}
                        className="job-card-button view-button"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleApply(job._id)}
                        disabled={applying === job._id}
                        className="job-card-button apply-button"
                      >
                        {applying === job._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'recommended' && (
            <div className="jobs-grid">
              {recommendedJobs.length === 0 ? (
                <div className="empty-state-container">
                  <p className="empty-state">No recommended jobs</p>
                  <p className="empty-state-sub">Add skills to your profile to get recommendations</p>
                </div>
              ) : (
                recommendedJobs.map(job => (
                  <div key={job._id} className="job-card recommended-card">
                    <div className="job-card-header">
                      <h3 className="job-card-title">{job.title}</h3>
                      <span className="job-card-company">{job.company}</span>
                    </div>
                    <p className="job-card-location">📍 {job.location}</p>
                    <p className="job-card-description">{job.description.substring(0, 100)}...</p>
                    <div className="job-skills">
                      {job.requiredSkills?.slice(0, 3).map(skill => (
                        <span key={skill} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                    <div className="job-card-footer">
                      <button 
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobModal(true);
                        }}
                        className="job-card-button view-button"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleApply(job._id)}
                        disabled={applying === job._id}
                        className="job-card-button apply-button"
                      >
                        {applying === job._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-list">
              {applications.length === 0 ? (
                <div className="empty-state-container">
                  <p className="empty-state">No applications yet</p>
                  <p className="empty-state-sub">Browse jobs and start applying!</p>
                </div>
              ) : (
                applications.map(app => (
                  <div key={app._id} className="application-card">
                    <div className="application-content">
                      <div className="application-info">
                        <h3 className="application-name">{app.job?.title}</h3>
                        <p className="application-company">{app.job?.company}</p>
                        <p className="application-date">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="application-actions">
                        <span className={`status-badge status-${app.status}`}>
                          {app.status}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedJob(app.job);
                            setShowJobModal(true);
                          }}
                          className="view-details-button"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Job Details Modal */}
        {showJobModal && selectedJob && (
          <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{selectedJob.title}</h2>
                <button onClick={() => setShowJobModal(false)} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <div className="job-detail-company">{selectedJob.company}</div>
                <div className="job-detail-location">📍 {selectedJob.location}</div>
                {selectedJob.salary && (
                  <div className="job-detail-salary">
                    💰 {selectedJob.salary.currency} {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max.toLocaleString()}
                  </div>
                )}
                
                <div className="job-detail-section">
                  <h3 className="job-detail-section-title">Description</h3>
                  <p className="job-detail-text">{selectedJob.description}</p>
                </div>

                <div className="job-detail-section">
                  <h3 className="job-detail-section-title">Requirements</h3>
                  <p className="job-detail-text">{selectedJob.requirements}</p>
                </div>

                <div className="job-detail-section">
                  <h3 className="job-detail-section-title">Required Skills</h3>
                  <div className="job-skills">
                    {selectedJob.requiredSkills?.map(skill => (
                      <span key={skill} className="skill-badge">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    onClick={() => handleApply(selectedJob._id)}
                    disabled={applying === selectedJob._id || appliedJobIds.includes(selectedJob._id)}
                    className={`apply-button ${appliedJobIds.includes(selectedJob._id) ? 'applied' : ''}`}
                  >
                    {appliedJobIds.includes(selectedJob._id) 
                      ? 'Already Applied' 
                      : applying === selectedJob._id 
                        ? 'Applying...' 
                        : 'Apply Now'}
                  </button>
                  <button onClick={() => setShowJobModal(false)} className="close-button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;