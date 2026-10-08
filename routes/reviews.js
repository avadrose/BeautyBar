const express = require("express");
const db = require("../db");

const {
  authenticateJWT,
  requireRole,
} = require("../middleware/auth");

const router = new express.Router();


// ======================================
// GET REVIEWS FOR A PROVIDER
// Public route so anyone can read reviews
// ======================================

router.get("/provider/:providerId", async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,

        u.first_name,
        u.last_name

      FROM reviews AS r

      JOIN users AS u
        ON r.client_id = u.id

      WHERE r.provider_id = $1

      ORDER BY r.created_at DESC
      `,
      [req.params.providerId]
    );

    return res.json(result.rows);

  } catch (err) {
    return next(err);
  }
});


// ======================================
// CREATE REVIEW
// Only clients can leave reviews
// ======================================

router.post(
  "/",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const {
        provider_id,
        rating,
        comment,
      } = req.body;


      // ------------------------------
      // Validate required information
      // ------------------------------

      if (!provider_id || !rating) {
        return res.status(400).json({
          error: "Provider and rating are required",
        });
      }


      // Rating must stay between 1 and 5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: "Rating must be between 1 and 5",
        });
      }


      // ------------------------------
      // Make sure provider exists
      // ------------------------------

      const providerResult = await db.query(
        `
        SELECT id
        FROM providers
        WHERE id = $1
        `,
        [provider_id]
      );

      if (providerResult.rows.length === 0) {
        return res.status(404).json({
          error: "Provider not found",
        });
      }


      // ------------------------------
      // Client must have completed an
      // appointment with this provider
      // before leaving a review
      // ------------------------------

      const appointmentResult = await db.query(
        `
        SELECT id
        FROM appointments

        WHERE client_id = $1
          AND provider_id = $2
          AND status = 'completed'

        LIMIT 1
        `,
        [
          req.user.id,
          provider_id,
        ]
      );


      if (appointmentResult.rows.length === 0) {
        return res.status(403).json({
          error:
            "You must complete an appointment with this provider before leaving a review",
        });
      }


      // ------------------------------
      // Prevent duplicate review
      // For now, one review per client
      // per provider
      // ------------------------------

      const existingReview = await db.query(
        `
        SELECT id
        FROM reviews

        WHERE client_id = $1
          AND provider_id = $2
        `,
        [
          req.user.id,
          provider_id,
        ]
      );


      if (existingReview.rows.length > 0) {
        return res.status(400).json({
          error: "You have already reviewed this provider",
        });
      }


      // ------------------------------
      // Create review
      // ------------------------------

      const result = await db.query(
        `
        INSERT INTO reviews
          (
            client_id,
            provider_id,
            rating,
            comment
          )

        VALUES
          ($1, $2, $3, $4)

        RETURNING *
        `,
        [
          req.user.id,
          provider_id,
          rating,
          comment || null,
        ]
      );


      return res.status(201).json({
        message: "Review created successfully",
        review: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// DELETE OWN REVIEW
// Client can only delete their own review
// ======================================

router.delete(
  "/:id",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        DELETE FROM reviews

        WHERE id = $1
          AND client_id = $2

        RETURNING id
        `,
        [
          req.params.id,
          req.user.id,
        ]
      );


      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Review not found",
        });
      }


      return res.json({
        message: "Review deleted",
      });

    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;