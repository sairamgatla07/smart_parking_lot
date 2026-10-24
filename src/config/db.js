const mongoose = require("mongoose");

module.exports = async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Copy .env.example to .env.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
};
