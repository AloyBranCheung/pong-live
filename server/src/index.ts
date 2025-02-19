import express from "express";
import dotenv from "dotenv";
import path from "path";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3001;

app.get("/api/health", (_, res) => {
  res.json({ message: "Server is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
