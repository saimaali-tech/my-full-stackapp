// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json()); // parse JSON bodies
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS - in development allowing all origins is fine because CRA proxy avoids CORS
// For production set process.env.CORS_ORIGIN to a specific origin like "https://yourdomain.com"
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
} else {
  app.use(cors()); // permissive for local dev
}

// Simple API endpoints
app.get("/", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Add a named endpoint, useful if you prefer /api/hello
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend! (from /api/hello)" });
});

// Serve React build (production)
const buildPath = path.join(__dirname, "../frontend/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // catch-all handler: serve index.html for any non-API route
  app.get("*", (req, res) => {
    // if the request is for an API, skip serving index
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => process.exit(0));
});
