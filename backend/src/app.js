import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/admin.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js"; // ADD THIS
import analyticsRoutes from "./routes/analytics.routes.js"; // ADD THIS

const app = express();

// Increase JSON and URL-encoded payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscription", subscriptionRoutes); // ADD THIS
app.use("/api/analytics", analyticsRoutes); // ADD THIS

// Simple root
app.get("/", (req, res) => res.json({ ok: true, service: "job-assist-backend" }));

export default app;