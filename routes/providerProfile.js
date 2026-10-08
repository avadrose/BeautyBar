const express = require("express");
const db = require("../db");
const {
  authenticateJWT,
  requireRole,
} = require("../middleware/auth");

const router = new express.Router();

router.get(
  "/me",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        SELECT
          id,
          user_id,
          business_name,
          bio,
          location,
          verification_status,
          verification_notes,
          verified_at
        FROM providers
        WHERE user_id = $1
        `,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      return res.json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const { business_name, bio, location } = req.body;

      if (!business_name) {
        return res.status(400).json({
          error: "Business name is required",
        });
      }

      const existingProfile = await db.query(
        `
        SELECT id
        FROM providers
        WHERE user_id = $1
        `,
        [req.user.id]
      );

      if (existingProfile.rows.length > 0) {
        return res.status(400).json({
          error: "Provider profile already exists",
        });
      }

      const result = await db.query(
        `
        INSERT INTO providers
          (
            user_id,
            business_name,
            bio,
            location,
            verification_status
          )
        VALUES
          ($1, $2, $3, $4, 'pending')
        RETURNING *
        `,
        [
          req.user.id,
          business_name,
          bio || null,
          location || null,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

router.patch(
  "/",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const { business_name, bio, location } = req.body;

      const result = await db.query(
        `
        UPDATE providers
        SET
          business_name = COALESCE($1, business_name),
          bio = COALESCE($2, bio),
          location = COALESCE($3, location)
        WHERE user_id = $4
        RETURNING *
        `,
        [
          business_name || null,
          bio || null,
          location || null,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Provider profile not found",
        });
      }

      return res.json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;