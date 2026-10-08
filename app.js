const express = require("express");
const cors = require("cors");

const providersRoutes = require("./routes/providers");
const authRoutes = require("./routes/auth");
const providerProfileRoutes = require("./routes/providerProfile");
const servicesRoutes = require("./routes/services");
const availabilityRoutes = require("./routes/availability");
const appointmentsRoutes = require("./routes/appointments");
const adminRoutes = require("./routes/admin");
const reviewsRoutes = require("./routes/reviews");
const favoritesRoutes = require("./routes/favorites");

const app = express();

const {
  authenticateJWT,
  requireRole,
} = require("./middleware/auth");

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "BeautyBar API is running",
  });
});

app.get("/api/profile", authenticateJWT, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

app.get(
  "/api/admin/test",
  authenticateJWT,
  requireRole("admin"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
    });
  }
);

app.use("/api/providers", providersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/provider-profile", providerProfileRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/favorites", favoritesRoutes);

module.exports = app;