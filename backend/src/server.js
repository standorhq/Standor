import express from "express";
import path from "path";
import { ENV } from "./lib/env.js";

const app = express();
const __dirname = path.resolve();

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running 🚀" });
});

// Production Static Serving
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
   });
}

app.listen(ENV.PORT, () => {
  console.log("Server running on port:", ENV.PORT);
});