import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AppStyles.css"; // Use the unified styles

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

export default function ProfilePage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry");
  const [educationLevel, setEducationLevel] = useState("");
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [locationPreference, setLocationPreference] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const navigate = useNavigate();

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    skills: [] as string[],
    experienceLevel: "Entry",
    educationLevel: "",
    preferredRoles: [] as string[],
    yearsOfExperience: 0,
    locationPreference: "",
    cvUrl: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setFetchLoading(true);
        setError("");
        
        const res = await axios.get("/api/users/me");
        const user = res.data;
        
        const fetchedSkills = user.skills || [];
        const fetchedExperience = user.experienceLevel || "Entry";
        const fetchedEducation = user.educationLevel || "";
        const fetchedRoles = user.preferredRoles || [];
        const fetchedYears = user.yearsOfExperience || 0;
        const fetchedLocation = user.locationPreference || "";
        const fetchedCvUrl = user.cvUrl || "";
        
        setSkills(fetchedSkills);
        setExperienceLevel(fetchedExperience);
        setEducationLevel(fetchedEducation);
        setPreferredRoles(fetchedRoles);
        setYearsOfExperience(fetchedYears);
        setLocationPreference(fetchedLocation);
        setCvUrl(fetchedCvUrl);
        
        setOriginalValues({
          skills: fetchedSkills,
          experienceLevel: fetchedExperience,
          educationLevel: fetchedEducation,
          preferredRoles: fetchedRoles,
          yearsOfExperience: fetchedYears,
          locationPreference: fetchedLocation,
          cvUrl: fetchedCvUrl
        });
        
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Error fetching profile:", err.response?.data || err.message);
          setError(err.response?.data?.message || "Failed to load profile");
          if (err.response?.status === 401) {
            navigate("/login");
          }
        }
      } finally {
        setFetchLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      JSON.stringify(skills) !== JSON.stringify(originalValues.skills) ||
      experienceLevel !== originalValues.experienceLevel ||
      educationLevel !== originalValues.educationLevel ||
      JSON.stringify(preferredRoles) !== JSON.stringify(originalValues.preferredRoles) ||
      yearsOfExperience !== originalValues.yearsOfExperience ||
      locationPreference !== originalValues.locationPreference ||
      cvFile !== null;
    
    setHasUnsavedChanges(hasChanges);
  }, [skills, experienceLevel, educationLevel, preferredRoles, yearsOfExperience, locationPreference, cvFile, originalValues]);

  // Skill handlers
  const handleSkillAdd = (e: FormEvent) => {
    e.preventDefault();
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
      setError("");
    } else if (skills.includes(skill)) {
      setError("Skill already added");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSkillRemove = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handlePreferredRolesChange = (role: string) => {
    setPreferredRoles((prevRoles) =>
      prevRoles.includes(role) ? prevRoles.filter((r) => r !== role) : [...prevRoles, role]
    );
  };

  const handleCvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 5 * 1024 * 1024) {
          setCvFile(file);
          setError("");
        } else {
          alert("File size must be less than 5MB");
        }
      } else {
        alert("Only PDF files allowed");
      }
    }
  };

  const handleNavigateToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave without saving?");
      if (confirmLeave) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Validate educationLevel
      if (!educationLevel) {
        setError("Please select your education level");
        setLoading(false);
        return;
      }

      const profileData = {
        skills,
        experienceLevel,
        educationLevel,
        preferredRoles,
        yearsOfExperience: Number(yearsOfExperience),
        locationPreference,
      };
      
      console.log("Sending profile data:", profileData);
      
      const response = await axios.put("/api/users/me", profileData);
      console.log("Profile update response:", response.data);

      if (cvFile) {
        try {
          const formData = new FormData();
          formData.append("cv", cvFile);
          
          const cvResponse = await axios.post("/api/users/upload-cv", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log("CV upload response:", cvResponse.data);
          setSuccess("Profile and CV updated successfully!");
        } catch (cvErr) {
          console.error("CV upload failed:", cvErr);
          setSuccess("Profile updated but CV upload failed. You can try again later.");
        }
      } else {
        setSuccess("Profile updated successfully!");
      }

      setOriginalValues({
        skills,
        experienceLevel,
        educationLevel,
        preferredRoles,
        yearsOfExperience,
        locationPreference,
        cvUrl: cvUrl
      });
      
      setHasUnsavedChanges(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Update error:", err.response?.data || err.message);
        
        if (err.code === 'ERR_NETWORK') {
          setError("Network error - please check if backend server is running");
        } else if (err.response?.status === 401) {
          setError("Please login again");
          navigate("/login");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to do this");
        } else if (err.response?.status === 500) {
          setError("Server error - please try again later");
        } else {
          setError(err.response?.data?.message || "Error updating profile");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const rolesList = ["Frontend", "Backend", "Fullstack", "DevOps", "QA", "Data Scientist"];

  if (fetchLoading) {
    return (
      <div className="profile-body">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-body">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Profile Settings</h1>
          <p className="profile-subtitle">Manage your professional information</p>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="warning-message">
            <svg className="warning-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>You have unsaved changes. Please save your profile before leaving.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="auth-error">
            <div className="error-content">
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="dismiss-button">✕</button>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="auth-success">
            <span>{success}</span>
          </div>
        )}

        {/* Profile Form */}
        <div className="profile-card">
          <form onSubmit={handleSubmit}>
            {/* Skills */}
            <div className="form-section">
              <label className="form-label">Skills</label>
              <div className="skills-container">
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleSkillRemove(skill)} 
                      className="skill-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="skill-input-group">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd(e)}
                  placeholder="Add a skill"
                  className="form-input"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={handleSkillAdd} 
                  className="skill-add-button"
                  disabled={loading || !skillInput.trim()}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Experience Level */}
            <div className="form-section">
              <label className="form-label">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                <option>Entry</option>
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>
            </div>

            {/* Education Level */}
            <div className="form-section">
              <label className="form-label">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className={`form-select ${!educationLevel ? 'select-error' : ''}`}
                disabled={loading}
                required
              >
                <option value="">Select education level</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="BACHELORS">Bachelor's Degree</option>
                <option value="MASTERS">Master's Degree</option>
                <option value="PHD">PhD</option>
              </select>
              {!educationLevel && (
                <span className="field-error">Please select your education level</span>
              )}
            </div>

            {/* Preferred Roles */}
            <div className="form-section">
              <label className="form-label">Preferred Roles</label>
              <div className="roles-container">
                {rolesList.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handlePreferredRolesChange(role)}
                    className={`role-button ${preferredRoles.includes(role) ? 'role-selected' : 'role-unselected'}`}
                    disabled={loading}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Years of Experience */}
            <div className="form-section">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="form-input"
                min={0}
                max={50}
                disabled={loading}
              />
            </div>

            {/* Location Preference */}
            <div className="form-section">
              <label className="form-label">Location Preference</label>
              <input
                type="text"
                value={locationPreference}
                onChange={(e) => setLocationPreference(e.target.value)}
                className="form-input"
                placeholder="e.g., Nairobi, Remote, Mombasa"
                disabled={loading}
              />
            </div>

            {/* CV Upload */}
            <div className="form-section">
              <label className="form-label">Upload CV (PDF only, max 5MB)</label>
              <div className="file-input-container">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleCvUpload} 
                  className="file-input"
                  disabled={loading}
                />
              </div>
              {cvFile && (
                <p className="file-info">
                  Selected: {cvFile.name} ({(cvFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {cvUrl && !cvFile && (
                <p className="file-success">
                  <svg className="success-icon-small" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  CV already uploaded: <a href={`http://localhost:5000${cvUrl}`} target="_blank" rel="noopener noreferrer" className="file-link">View CV</a>
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="save-button"
              >
                {loading ? (
                  <span className="button-content">
                    <span className="spinner"></span>
                    Saving...
                  </span>
                ) : "Save Profile"}
              </button>
              
              <button
                type="button"
                onClick={handleNavigateToDashboard}
                className={`dashboard-button ${hasUnsavedChanges ? 'warning-button' : ''}`}
                disabled={loading}
              >
                {hasUnsavedChanges ? "Leave without saving" : "Go to Dashboard"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}