const express = require("express");
const db = require("../db");

const {
  authenticateJWT,
  requireRole,
} = require("../middleware/auth");

const router = new express.Router();


// ======================================
// GET ALL USERS
// Admin can view all client/provider/admin accounts
// ======================================

router.get(
  "/users",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        SELECT
          id,
          username,
          first_name,
          last_name,
          email,
          role,
          is_active,
          created_at
        FROM users
        ORDER BY created_at DESC
        `
      );

      return res.json(result.rows);

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// GET ALL PROVIDERS
// Includes pending, verified, rejected,
// and suspended providers
// ======================================

router.get(
  "/providers",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        SELECT
          p.id,
          p.business_name,
          p.bio,
          p.location,
          p.verification_status,
          p.verification_notes,
          p.verified_at,

          u.id AS user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          u.is_active

        FROM providers AS p

        JOIN users AS u
          ON p.user_id = u.id

        ORDER BY p.id
        `
      );

      return res.json(result.rows);

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// VERIFY PROVIDER
// Admin approves a provider account
// ======================================

router.patch(
  "/providers/:id/verify",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      const result = await db.query(
        `
        UPDATE providers

        SET
          verification_status = 'verified',
          verification_notes = NULL,
          verified_by = $1,
          verified_at = CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
        `,
        [
          req.user.id,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Provider not found",
        });
      }

      return res.json({
        message: "Provider verified successfully",
        provider: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// REJECT PROVIDER
// Admin can reject a provider and include
// a reason for the rejection
// ======================================

router.patch(
  "/providers/:id/reject",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      const { notes } = req.body;

      const result = await db.query(
        `
        UPDATE providers

        SET
          verification_status = 'rejected',
          verification_notes = $1,
          verified_by = $2,
          verified_at = CURRENT_TIMESTAMP

        WHERE id = $3

        RETURNING *
        `,
        [
          notes || "Provider verification rejected",
          req.user.id,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Provider not found",
        });
      }

      return res.json({
        message: "Provider rejected",
        provider: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// SUSPEND PROVIDER
// Suspended providers should not be able
// to accept public bookings
// ======================================

router.patch(
  "/providers/:id/suspend",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      const { notes } = req.body;

      const result = await db.query(
        `
        UPDATE providers

        SET
          verification_status = 'suspended',
          verification_notes = $1

        WHERE id = $2

        RETURNING *
        `,
        [
          notes || "Provider account suspended",
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Provider not found",
        });
      }

      return res.json({
        message: "Provider suspended",
        provider: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// DEACTIVATE USER ACCOUNT
// Keeps account in database but prevents login
// ======================================

router.patch(
  "/users/:id/deactivate",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      // Prevent admin from accidentally
      // deactivating their own account
      if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({
          error: "You cannot deactivate your own admin account",
        });
      }

      const result = await db.query(
        `
        UPDATE users

        SET is_active = FALSE

        WHERE id = $1

        RETURNING
          id,
          username,
          email,
          role,
          is_active
        `,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      return res.json({
        message: "User account deactivated",
        user: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// REACTIVATE USER ACCOUNT
// Allows a previously deactivated user
// to log in again
// ======================================

router.patch(
  "/users/:id/reactivate",
  authenticateJWT,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      const result = await db.query(
        `
        UPDATE users

        SET is_active = TRUE

        WHERE id = $1

        RETURNING
          id,
          username,
          email,
          role,
          is_active
        `,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      return res.json({
        message: "User account reactivated",
        user: result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;