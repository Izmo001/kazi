import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  await connectDB();
  const email = "admin@jobassist.co.ke";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin exists:", email);
    process.exit(0);
  }
  const hashed = await bcrypt.hash("AdminPass123!", 10);
  const user = await User.create({ name: "Admin", email, password: hashed, role: "ADMIN", subscriptionStatus: true });
  console.log("Created admin:", user.email);
  process.exit(0);
};

seed();
