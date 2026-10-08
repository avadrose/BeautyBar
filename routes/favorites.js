const express = require("express");
const db = require("../db");

const {
  authenticateJWT,
  requireRole,
} = require("../middleware/auth");

const router = new express.Router();


// ======================================
// GET CLIENT'S FAVORITE PROVIDERS
// Only clients can have favorites
// ======================================

router.get(
  "/",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        SELECT
          f.id AS favorite_id,

          p.id AS provider_id,
          p.business_name,
          p.bio,
          p.location,
          p.verification_status

        FROM favorites AS f

        JOIN providers AS p
          ON f.provider_id = p.id

        WHERE f.client_id = $1

        ORDER BY p.business_name
        `,
        [req.user.id]
      );

      return res.json(result.rows);

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// ADD PROVIDER TO FAVORITES
// Prevents duplicate favorites
// ======================================

router.post(
  "/:providerId",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const providerId = req.params.providerId;


      // ------------------------------
      // Make sure provider exists
      // ------------------------------

      const providerResult = await db.query(
        `
        SELECT id
        FROM providers
        WHERE id = $1
          AND verification_status = 'verified'
        `,
        [providerId]
      );


      if (providerResult.rows.length === 0) {
        return res.status(404).json({
          error: "Verified provider not found",
        });
      }


      // ------------------------------
      // Check whether this provider
      // is already in the client's favorites
      // ------------------------------

      const existingFavorite = await db.query(
        `
        SELECT id
        FROM favorites

        WHERE client_id = $1
          AND provider_id = $2
        `,
        [
          req.user.id,
          providerId,
        ]
      );


      if (existingFavorite.rows.length > 0) {
        return res.status(400).json({
          error: "Provider is already in your favorites",
        });
      }


      // ------------------------------
      // Create favorite
      // ------------------------------

      const result = await db.query(
        `
        INSERT INTO favorites
          (
            client_id,
            provider_id
          )

        VALUES
          ($1, $2)

        RETURNING *
        `,
        [
          req.user.id,
          providerId,
        ]
      );


      return res.status(201).json({
        message: "Provider added to favorites",
        favorite: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// REMOVE PROVIDER FROM FAVORITES
// Client can only remove their own favorite
// ======================================

router.delete(
  "/:providerId",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        DELETE FROM favorites

        WHERE client_id = $1
          AND provider_id = $2

        RETURNING id
        `,
        [
          req.user.id,
          req.params.providerId,
        ]
      );


      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Favorite not found",
        });
      }


      return res.json({
        message: "Provider removed from favorites",
      });

    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;