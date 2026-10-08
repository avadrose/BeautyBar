const express = require("express");
const db = require("../db");
const {
  authenticateJWT,
  requireRole,
} = require("../middleware/auth");

const router = new express.Router();

async function getProviderByUserId(userId) {
  const result = await db.query(
    `
    SELECT id
    FROM providers
    WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

// Get logged-in provider's services
router.get(
  "/mine",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const provider = await getProviderByUserId(req.user.id);

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      const result = await db.query(
        `
        SELECT
          id,
          name,
          description,
          price,
          duration
        FROM services
        WHERE provider_id = $1
        ORDER BY id
        `,
        [provider.id]
      );

      return res.json(result.rows);
    } catch (err) {
      return next(err);
    }
  }
);

// Create a service
router.post(
  "/",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const { name, description, price, duration } = req.body;

      if (!name || price === undefined || !duration) {
        return res.status(400).json({
          error: "Name, price, and duration are required",
        });
      }

      if (Number(price) < 0) {
        return res.status(400).json({
          error: "Price cannot be negative",
        });
      }

      if (Number(duration) <= 0) {
        return res.status(400).json({
          error: "Duration must be greater than 0",
        });
      }

      const provider = await getProviderByUserId(req.user.id);

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      const result = await db.query(
        `
        INSERT INTO services
          (
            provider_id,
            name,
            description,
            price,
            duration
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          provider.id,
          name,
          description || null,
          price,
          duration,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

// Update a service
router.patch(
  "/:id",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const { name, description, price, duration } = req.body;

      const provider = await getProviderByUserId(req.user.id);

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      const result = await db.query(
        `
        UPDATE services
        SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          duration = COALESCE($4, duration)
        WHERE id = $5
          AND provider_id = $6
        RETURNING *
        `,
        [
          name ?? null,
          description ?? null,
          price ?? null,
          duration ?? null,
          req.params.id,
          provider.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Service not found",
        });
      }

      return res.json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

// Delete a service
router.delete(
  "/:id",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const provider = await getProviderByUserId(req.user.id);

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      const result = await db.query(
        `
        DELETE FROM services
        WHERE id = $1
          AND provider_id = $2
        RETURNING id
        `,
        [req.params.id, provider.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Service not found",
        });
      }

      return res.json({
        message: "Service deleted",
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;