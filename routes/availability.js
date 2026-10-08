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

// Get logged-in provider's availability
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
          date,
          start_time,
          end_time
        FROM availability
        WHERE provider_id = $1
        ORDER BY date, start_time
        `,
        [provider.id]
      );

      return res.json(result.rows);
    } catch (err) {
      return next(err);
    }
  }
);

// Create availability
router.post(
  "/",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const { date, start_time, end_time } = req.body;

      if (!date || !start_time || !end_time) {
        return res.status(400).json({
          error: "Date, start time, and end time are required",
        });
      }

      if (start_time >= end_time) {
        return res.status(400).json({
          error: "Start time must be before end time",
        });
      }

      const provider = await getProviderByUserId(req.user.id);

      if (!provider) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      const overlap = await db.query(
        `
        SELECT id
        FROM availability
        WHERE provider_id = $1
          AND date = $2
          AND start_time < $4
          AND end_time > $3
        `,
        [provider.id, date, start_time, end_time]
      );

      if (overlap.rows.length > 0) {
        return res.status(400).json({
          error: "Availability overlaps an existing time block",
        });
      }

      const result = await db.query(
        `
        INSERT INTO availability
          (
            provider_id,
            date,
            start_time,
            end_time
          )
        VALUES
          ($1, $2, $3, $4)
        RETURNING *
        `,
        [provider.id, date, start_time, end_time]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

// Update availability
router.patch(
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

      const currentResult = await db.query(
        `
        SELECT *
        FROM availability
        WHERE id = $1
          AND provider_id = $2
        `,
        [req.params.id, provider.id]
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          error: "Availability not found",
        });
      }

      const current = currentResult.rows[0];

      const date = req.body.date ?? current.date;
      const startTime = req.body.start_time ?? current.start_time;
      const endTime = req.body.end_time ?? current.end_time;

      if (startTime >= endTime) {
        return res.status(400).json({
          error: "Start time must be before end time",
        });
      }

      const overlap = await db.query(
        `
        SELECT id
        FROM availability
        WHERE provider_id = $1
          AND date = $2
          AND id != $3
          AND start_time < $5
          AND end_time > $4
        `,
        [
          provider.id,
          date,
          req.params.id,
          startTime,
          endTime,
        ]
      );

      if (overlap.rows.length > 0) {
        return res.status(400).json({
          error: "Availability overlaps an existing time block",
        });
      }

      const result = await db.query(
        `
        UPDATE availability
        SET
          date = $1,
          start_time = $2,
          end_time = $3
        WHERE id = $4
          AND provider_id = $5
        RETURNING *
        `,
        [
          date,
          startTime,
          endTime,
          req.params.id,
          provider.id,
        ]
      );

      return res.json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

// Delete availability
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
        DELETE FROM availability
        WHERE id = $1
          AND provider_id = $2
        RETURNING id
        `,
        [req.params.id, provider.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Availability not found",
        });
      }

      return res.json({
        message: "Availability deleted",
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;