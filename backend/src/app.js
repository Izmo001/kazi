import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js"; // ✅ Make sure this line exists
import downloadRoutes from "./routes/download.routes.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes); // ✅ This line must be present
app.use("/api/download", downloadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Simple root
app.get("/", (req, res) => res.json({ ok: true, service: "job-assist-backend" }));

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;