const express = require("express");
const parkingRoutes = require("./routes/parkingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.json({
  name: "Smart Parking Lot API",
  status: "running",
  endpoints: {
    seed: "POST /api/admin/seed",
    entry: "POST /api/parking/entry",
    exit: "POST /api/parking/exit/:ticketId",
    availability: "GET /api/parking/availability",
    ticket: "GET /api/parking/tickets/:ticketId"
  }
}));

app.use("/api/parking", parkingRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "A record with this unique value already exists." });
  }
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
