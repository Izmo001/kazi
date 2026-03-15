import { useState } from "react";
import axios from "../api/axios";

interface JobFormProps {
  job?: any;
  onClose: () => void;
  onSave: () => void;
}

const JobForm = ({ job, onClose, onSave }: JobFormProps) => {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    company: job?.company || "",
    location: job?.location || "",
    description: job?.description || "",
    requirements: job?.requirements || "",
    requiredSkills: job?.requiredSkills?.join(", ") || "",
    salary: {
      min: job?.salary?.min || "",
      max: job?.salary?.max || "",
      currency: job?.salary?.currency || "KES"
    },
    type: job?.type || "FULL_TIME",
    status: job?.status || "OPEN",
    deadline: job?.deadline?.split("T")[0] || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s);
      
      const jobData = {
        ...formData,
        requiredSkills: skillsArray,
        salary: {
          min: Number(formData.salary.min),
          max: Number(formData.salary.max),
          currency: formData.salary.currency
        }
      };

      if (job) {
        await axios.put(`/admin/jobs/${job._id}`, jobData);
      } else {
        await axios.post("/admin/jobs", jobData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{job ? "Edit Job" : "Post New Job"}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title*</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company*</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location*</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Nairobi, Remote"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description*</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Job description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Requirements*</label>
              <textarea
                required
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Job requirements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Required Skills*</label>
              <input
                type="text"
                required
                value={formData.requiredSkills}
                onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., React, Node.js, MongoDB (comma separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Salary</label>
                <input
                  type="number"
                  value={formData.salary.min}
                  onChange={(e) => setFormData({
                    ...formData, 
                    salary: {...formData.salary, min: e.target.value}
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Salary</label>
                <input
                  type="number"
                  value={formData.salary.max}
                  onChange={(e) => setFormData({
                    ...formData, 
                    salary: {...formData.salary, max: e.target.value}
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={formData.salary.currency}
                  onChange={(e) => setFormData({
                    ...formData, 
                    salary: {...formData.salary, currency: e.target.value}
                  })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : job ? "Update Job" : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;