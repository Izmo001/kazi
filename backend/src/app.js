import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import paymentRoutes from "./routes/payment.js";

const app = express();

// ✅ CORS configuration for frontend
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true,               // allow cookies / Authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow methods
  allowedHeaders: ["Content-Type", "Authorization", "Accept"], // Allowed headers
}));

// Handle preflight requests - this is handled by cors middleware above
// No need for app.options('*', cors()) - it's already included

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/payments", paymentRoutes);

// Simple root
app.get("/", (req, res) => res.json({ ok: true, service: "job-assist-backend" }));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;