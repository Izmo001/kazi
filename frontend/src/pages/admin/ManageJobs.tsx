import { useState, useEffect } from "react";
import axios from "../../api/axios";
import "../AppStyles.css";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
}

const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    status: "OPEN"
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/jobs");
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await axios.put(`/admin/jobs/${editingJob._id}`, formData);
      } else {
        await axios.post("/admin/jobs", formData);
      }
      fetchJobs();
      setShowForm(false);
      setEditingJob(null);
      resetForm();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      description: "",
      status: "OPEN"
    });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      status: job.status
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`/admin/jobs/${jobId}`);
        fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await axios.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
      fetchJobs();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="admin-jobs">
      <div className="page-header">
        <h1 className="page-title">Manage Jobs</h1>
        <button
          onClick={() => {
            setEditingJob(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Add New Job
        </button>
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingJob ? "Edit Job" : "Add New Job"}</h2>
              <button onClick={() => setShowForm(false)} className="modal-close">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingJob ? "Update" : "Save"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="table-container">
        {jobs.length === 0 ? (
          <div className="empty-state-container">
            <p className="empty-state">No jobs found</p>
            <p className="empty-state-sub">Click "Add New Job" to create your first job posting</p>
          </div>
        ) : (
          <table className="data-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Title</th>
                <th className="table-header-cell">Company</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {jobs.map((job) => (
                <tr key={job._id} className="table-row">
                  <td className="table-cell font-medium">{job.title}</td>
                  <td className="table-cell">{job.company}</td>
                  <td className="table-cell">{job.location}</td>
                  <td className="table-cell">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job._id, e.target.value)}
                      className={`status-badge status-${job.status.toLowerCase()}`}
                    >
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="table-cell">
                    <button onClick={() => handleEdit(job)} className="action-button edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(job._id)} className="action-button delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;