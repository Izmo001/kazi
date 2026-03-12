import { useState, useEffect, useContext } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ProfilePage() {
  const { token } = useContext(AuthContext)!;
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

  // Create axios instance with auth header
  const authAxios = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

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

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        setFetchLoading(true);
        setError("");
        
        const res = await authAxios.get("/api/auth/me");
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
        
        // Store original values for change detection
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
          if (err.response?.status === 401) {
            navigate("/login");
          } else {
            setError("Failed to load profile");
          }
        }
      } finally {
        setFetchLoading(false);
      }
    }
    
    if (token) {
      fetchProfile();
    } else {
      setFetchLoading(false);
    }
  }, [token, navigate]);

  // Check for unsaved changes whenever form values change
  useEffect(() => {
    const hasChanges = 
      JSON.stringify(skills) !== JSON.stringify(originalValues.skills) ||
      experienceLevel !== originalValues.experienceLevel ||
      educationLevel !== originalValues.educationLevel ||
      JSON.stringify(preferredRoles) !== JSON.stringify(originalValues.preferredRoles) ||
      yearsOfExperience !== originalValues.yearsOfExperience ||
      locationPreference !== originalValues.locationPreference ||
      cvFile !== null; // CV file selection is always a change
    
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

  // Preferred roles toggle
  const handlePreferredRolesChange = (role: string) => {
    setPreferredRoles((prevRoles) =>
      prevRoles.includes(role) ? prevRoles.filter((r) => r !== role) : [...prevRoles, role]
    );
  };

  // CV upload handler
  const handleCvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
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

  // Handle navigation with unsaved changes warning
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

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (!token) {
        navigate("/login");
        return;
      }

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

      // Update profile
      const response = await authAxios.put("/api/auth/me", profileData);
      console.log("Profile updated successfully:", response.data);

      // Upload CV if selected
      if (cvFile) {
        try {
          console.log("Uploading CV...");
          const formData = new FormData();
          formData.append("cv", cvFile);
          
          const cvResponse = await authAxios.post("/api/auth/upload-cv", formData, {
            headers: { 
              "Content-Type": "multipart/form-data",
            },
          });
          
          console.log("CV uploaded successfully:", cvResponse.data);
          setSuccess("Profile and CV updated successfully!");
        } catch (cvErr: any) {
          console.error("CV upload failed:", cvErr);
          setSuccess("Profile updated but CV upload failed. You can try again later.");
        }
      } else {
        setSuccess("Profile updated successfully!");
      }

      // Update original values to reflect saved state
      setOriginalValues({
        skills,
        experienceLevel,
        educationLevel,
        preferredRoles,
        yearsOfExperience,
        locationPreference,
        cvUrl: cvUrl // Keep existing CV URL
      });
      
      setHasUnsavedChanges(false);

      // Redirect after showing success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Update error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Error updating profile");
      } else {
        console.error(err);
        setError("Error updating profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const rolesList = ["Frontend", "Backend", "Fullstack", "DevOps", "QA", "Data Scientist"];

  if (fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded flex items-center">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>You have unsaved changes. Please save your profile before leaving.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skills */}
        <div>
          <label className="block font-semibold mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                {skill}
                <button 
                  type="button" 
                  onClick={() => handleSkillRemove(skill)} 
                  className="text-red-500 hover:text-red-700 font-bold focus:outline-none"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd(e)}
              placeholder="Add a skill"
              className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={handleSkillAdd} 
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || !skillInput.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block font-semibold mb-2">Experience Level</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option>Entry</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
        </div>

        {/* Education Level */}
        <div>
          <label className="block font-semibold mb-2">Education Level</label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          >
            <option value="">Select</option>
            <option value="DIPLOMA">DIPLOMA</option>
            <option value="BACHELORS">BACHELORS</option>
            <option value="MASTERS">MASTERS</option>
            <option value="PHD">PHD</option>
          </select>
          {!educationLevel && (
            <p className="text-red-500 text-sm mt-1">Please select your education level</p>
          )}
        </div>

        {/* Preferred Roles */}
        <div>
          <label className="block font-semibold mb-2">Preferred Roles</label>
          <div className="flex flex-wrap gap-2">
            {rolesList.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handlePreferredRolesChange(role)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  preferredRoles.includes(role) 
                    ? "bg-green-500 text-white border-green-500" 
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
                disabled={loading}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block font-semibold mb-2">Years of Experience</label>
          <input
            type="number"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
            max={50}
            disabled={loading}
          />
        </div>

        {/* Location Preference */}
        <div>
          <label className="block font-semibold mb-2">Location Preference</label>
          <input
            type="text"
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City, Remote, etc."
            disabled={loading}
          />
        </div>

        {/* CV Upload */}
        <div>
          <label className="block font-semibold mb-2">Upload CV (PDF only, max 5MB)</label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleCvUpload} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
          {cvFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {cvFile.name} ({(cvFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
          {cvUrl && !cvFile && (
            <p className="mt-2 text-sm text-green-600">
              ✓ CV already uploaded: <a href={`http://localhost:5000${cvUrl}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">View CV</a>
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : "Save Profile"}
          </button>
          
          <button
            type="button"
            onClick={handleNavigateToDashboard}
            className={`px-6 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              hasUnsavedChanges 
                ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                : "bg-gray-500 text-white hover:bg-gray-600"
            }`}
            disabled={loading}
          >
            {hasUnsavedChanges ? "Leave without saving?" : "Go to Dashboard"}
          </button>
        </div>
      </form>
    </div>
  );
}