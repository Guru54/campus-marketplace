const mongoose = require("mongoose");
const logger = require("../utils/logger");

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  logger.log("MongoDB reconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
