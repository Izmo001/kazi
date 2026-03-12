import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

interface Job {
  _id: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  salary?: string;
  type?: string;
}

interface Application {
  _id: string;
  job: Job;
  status: string;
  appliedAt: string;
}

const UserDashboard = () => {
  const { token } = useContext(AuthContext)!;
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        
        const jobsRes = await axios.get<Job[]>("/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const appsRes = await axios.get<Application[]>("/applications/my", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setJobs(jobsRes.data);
        setApplications(appsRes.data);
      } catch (error: any) {
        console.error("Dashboard error:", error);
        setError(error.response?.data?.message || "Failed to load dashboard");
        
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleApply = async (jobId: string) => {
    try {
      setApplying(jobId);
      setError("");
      setSuccess("");

      await axios.post(
        `/applications/apply/${jobId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const appsRes = await axios.get<Application[]>("/applications/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setApplications(appsRes.data);
      setSuccess("Application submitted successfully!");
      setTimeout(() => setSuccess(""), 3000);

    } catch (error: any) {
      console.error("Apply error:", error);
      setError(error.response?.data?.message || "Failed to apply for job");
    } finally {
      setApplying(null);
    }
  };

  const appliedJobIds = applications.map(app => app.job?._id).filter(Boolean);
  const availableJobs = jobs.filter(job => !appliedJobIds.includes(job._id));

  if (loading) {
    return (
      <div className="dashboard-container text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container max-w-6xl mx-auto p-6">
      {/* ========== HEADER SECTION ========== */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Edit Profile
        </button>
      </div>

      {/* ========== MESSAGES SECTION ========== */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* ========== STATISTICS SECTION ========== */}
      <div className="stats-section mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">📊 Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm mb-2 uppercase tracking-wide">Total Jobs</h3>
            <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
          </div>

          <div className="stat-card bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm mb-2 uppercase tracking-wide">Applied Jobs</h3>
            <p className="text-3xl font-bold text-green-600">{applications.length}</p>
          </div>

          <div className="stat-card bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-gray-600 text-sm mb-2 uppercase tracking-wide">Available Jobs</h3>
            <p className="text-3xl font-bold text-purple-600">{availableJobs.length}</p>
          </div>
        </div>
      </div>

      {/* ========== AVAILABLE JOBS SECTION ========== */}
      <div className="available-jobs-section mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">💼 Available Jobs</h2>
        
        {availableJobs.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">No available jobs at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableJobs.map(job => (
              <div key={job._id} className="job-card bg-white p-6 rounded-lg shadow hover:shadow-md transition border">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                  {job.location && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <span className="mr-1">📍</span> {job.location}
                    </p>
                  )}
                </div>

                <button
                  className={`w-full py-2 px-4 rounded transition ${
                    applying === job._id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={() => handleApply(job._id)}
                  disabled={applying === job._id}
                >
                  {applying === job._id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Applying...
                    </span>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== MY APPLICATIONS SECTION ========== */}
      <div className="applications-section">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">📋 My Applications</h2>

        {applications.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app._id} className="application-card bg-white p-6 rounded-lg shadow border flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{app.job?.title || "Job"}</h3>
                  <p className="text-gray-600">{app.job?.company || "Company"}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-gray-500 flex items-center">
                      <span className="mr-1">📅</span> 
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      app.status === "accepted" ? "bg-green-100 text-green-800" :
                      app.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Pending"}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(`/jobs/${app.job?._id}`)}
                  className="ml-4 text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  View Details
                  <span className="ml-1">→</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;