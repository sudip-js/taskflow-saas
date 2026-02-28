import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";

dotenv.config();

const PORT = ENV.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start");
    process.exit(1);
  }
};

startServer();
