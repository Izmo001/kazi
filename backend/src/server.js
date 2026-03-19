import dotenv from "dotenv";
// Load environment variables FIRST
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

// Debug: Verify environment variables are loaded
console.log("🔍 Environment check:");
console.log("- PORT:", process.env.PORT || "❌ Not found");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Found" : "❌ Not found");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Not found");

if (!process.env.MONGODB_URI) {
  console.error("\n❌ FATAL ERROR: MONGODB_URI is not defined!");
  console.error("Current directory:", process.cwd());
  console.error("Please check your .env file location and format.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});