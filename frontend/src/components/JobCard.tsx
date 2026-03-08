import React from "react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  jobType: string;
  deadline: string;
  onApply?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ title, company, location, jobType, deadline, onApply }) => {
  return (
    <div className="border p-4 rounded shadow-md bg-white mb-4">
      <h3 className="font-bold text-lg">{title}</h3>
      <p>{company} • {location} • {jobType}</p>
      <p className="text-sm text-gray-500">Deadline: {new Date(deadline).toLocaleDateString()}</p>
      {onApply && (
        <button onClick={onApply} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
          Apply
        </button>
      )}
    </div>
  );
};

export default JobCard;
