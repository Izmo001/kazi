import path from "path";
import fs from "fs";
import User from "../models/User.js";

export const downloadCv = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || !user.cv?.url) {
      return res.status(404).json({ message: "CV not found" });
    }

    const filePath = path.join("uploads", user.cv.url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing" });
    }

    res.download(filePath, user.cv.originalName);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};