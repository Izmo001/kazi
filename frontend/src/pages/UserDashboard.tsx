import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";

interface Job {
  _id: string;
  title: string;
  company: string;
}

const UserDashboard = () => {
  const { token } = useContext(AuthContext)!;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applied, setApplied] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsRes = await axios.get<Job[]>("/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const appliedRes = await axios.get<Job[]>("/applications/my", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setJobs(jobsRes.data);
        setApplied(appliedRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleApply = async (jobId: string) => {
    try {
      await axios.post(
        `/applications/apply/${jobId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const appliedJob = jobs.find(j => j._id === jobId);
      if (appliedJob) {
        setApplied(prev => [...prev, appliedJob]);
      }
    } catch (error) {
      console.error("Apply error:", error);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      
      {/* Stats Section */}
      <div className="stats">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <p>{jobs.length}</p>
        </div>

        <div className="stat-card">
          <h3>Applied Jobs</h3>
          <p>{applied.length}</p>
        </div>
      </div>

      {/* Available Jobs */}
      <section>
        <h2>Available Jobs</h2>
        {jobs.map(job => (
          <div key={job._id} className="card">
            <div>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => handleApply(job._id)}
              disabled={applied.some(a => a._id === job._id)}
            >
              {applied.some(a => a._id === job._id)
                ? "Applied"
                : "Apply"}
            </button>
          </div>
        ))}
      </section>

      {/* Applied Jobs */}
      <section style={{ marginTop: "40px" }}>
        <h2>Applied Jobs</h2>

        {applied.length === 0 && <p>No applications yet.</p>}

        {applied.map(job => (
          <div key={job._id} className="card">
            <h3>{job.title}</h3>
            <p>{job.company}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default UserDashboard;