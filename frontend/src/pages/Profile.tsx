import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function ProfilePage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry");
  const [educationLevel, setEducationLevel] = useState("");
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [locationPreference, setLocationPreference] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
        const user = res.data;
        setSkills(user.skills || []);
        setExperienceLevel(user.experienceLevel || "Entry");
        setEducationLevel(user.educationLevel || "");
        setPreferredRoles(user.preferredRoles || []);
        setYearsOfExperience(user.yearsOfExperience || 0);
        setLocationPreference(user.locationPreference || "");
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(err.response?.data || err.message);
        } else {
          console.error(err);
        }
      }
    }
    fetchProfile();
  }, []);

  // Skill handlers
  const handleSkillAdd = (e: FormEvent) => {
    e.preventDefault();
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
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
    if (file && file.type === "application/pdf") {
      setCvFile(file);
    } else {
      alert("Only PDF files allowed");
    }
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:5000/api/users/me",
        {
          skills,
          experienceLevel,
          educationLevel,
          preferredRoles,
          yearsOfExperience,
          locationPreference,
        },
        { withCredentials: true }
      );
    

      if (cvFile) {
        const formData = new FormData();
        formData.append("cv", cvFile);
        await axios.post("http://localhost:5000/api/users/upload-cv", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      }

      alert("Profile updated successfully!");

        navigate("/dashboard"); // 🔥 redirect here

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data || err.message);
      } else {
        console.error(err);
      }
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const rolesList = ["Frontend", "Backend", "Fullstack", "DevOps", "QA", "Data Scientist"];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skills */}
        <div>
          <label className="block font-semibold mb-2">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {skill}
                <button type="button" onClick={() => handleSkillRemove(skill)} className="text-red-500 font-bold">
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
              placeholder="Add a skill"
              className="border rounded px-3 py-1 flex-1"
            />
            <button type="button" onClick={handleSkillAdd} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
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
            className="border rounded px-3 py-2 w-full"
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
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select</option>
            <option value="DIPLOMA">DIPLOMA</option>
            <option value="BACHELORS">BACHELORS</option>
            <option value="MASTERS">MASTERS</option>
            <option value="PHD">PHD</option>
          </select>
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
                className={`px-3 py-1 rounded-full border ${
                  preferredRoles.includes(role) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
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
            className="border rounded px-3 py-2 w-full"
            min={0}
          />
        </div>

        {/* Location Preference */}
        <div>
          <label className="block font-semibold mb-2">Location Preference</label>
          <input
            type="text"
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="City, Remote, etc."
          />
        </div>

        {/* CV Upload */}
        <div>
          <label className="block font-semibold mb-2">Upload CV (PDF only)</label>
          <input type="file" accept="application/pdf" onChange={handleCvUpload} />
          {cvFile && <p className="mt-2 text-sm text-gray-600">{cvFile.name}</p>}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}