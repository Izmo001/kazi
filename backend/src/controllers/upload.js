export const uploadCv = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.cv = {
      url: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date()
    };

    await user.save();

    res.json({ message: "CV uploaded successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};