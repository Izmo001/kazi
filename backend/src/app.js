import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import paymentRoutes from "./routes/payment.routes.js"; // Make sure this import is here

// FIRST: Create the app instance
const app = express();

// SECOND: Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://jobassist-frontend.vercel.app',
  'https://your-custom-domain.com' // Add your custom domain if any
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// THIRD: Routes (AFTER app is created)
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes); // This must come AFTER app is created

// Simple root
app.get("/", (req, res) => res.json({ ok: true, service: "job-assist-backend" }));

export default app;