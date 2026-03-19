import React, { useState } from "react";
import axios from "../../api/axios";
import "../AppStyles.css";

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: "JobPortal",
    contactEmail: "admin@jobportal.com",
    maxApplications: 30,
    allowRemote: true,
    autoApproveJobs: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post("/admin/settings", settings);
      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="admin-settings">
      <h1 className="page-title">Settings</h1>

      {message && (
        <div className={`settings-message ${message.includes("Error") ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="settings-card">
        <div className="form-group">
          <label className="form-label">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Max Applications Per User</label>
          <input
            type="number"
            value={settings.maxApplications}
            onChange={(e) => setSettings({...settings, maxApplications: Number(e.target.value)})}
            className="form-input"
          />
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.allowRemote}
              onChange={(e) => setSettings({...settings, allowRemote: e.target.checked})}
            />
            Allow Remote Jobs
          </label>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.autoApproveJobs}
              onChange={(e) => setSettings({...settings, autoApproveJobs: e.target.checked})}
            />
            Auto-approve Jobs
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="save-button"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;