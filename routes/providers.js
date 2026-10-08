// providers.js
// Public provider browsing routes.
//
// This file handles:
// - getting all verified providers
// - including each provider's services
// - getting one provider by ID
// - getting provider availability
// - getting already-booked appointments for a date
//
// These routes are public because clients need them
// when browsing and booking providers.

const express = require("express");
const db = require("../db");

const router = new express.Router();


// ======================================
// GET ALL VERIFIED PROVIDERS
// ======================================
// Used by the main provider browsing page.
//
// Each provider includes their services so the
// frontend can display and filter providers
// by service name.

router.get("/", async (req, res, next) => {
  try {
    // First get all verified providers.
    const providerResult = await db.query(
      `
      SELECT
        p.id,
        p.business_name,
        p.bio,
        p.location,
        p.verification_status,

        u.first_name,
        u.last_name

      FROM providers AS p

      JOIN users AS u
        ON p.user_id = u.id

      WHERE p.verification_status = 'verified'

      ORDER BY p.id
      `
    );


    // ==================================
    // LOAD SERVICES FOR EACH PROVIDER
    // ==================================

    const providers = await Promise.all(
      providerResult.rows.map(
        async (provider) => {
          const serviceResult =
            await db.query(
              `
              SELECT
                id,
                name,
                description,
                price,
                duration

              FROM services

              WHERE provider_id = $1

              ORDER BY name
              `,
              [provider.id]
            );


          // Add the provider's services to
          // the provider object returned to React.
          return {
            ...provider,
            services: serviceResult.rows,
          };
        }
      )
    );


    return res.json(providers);

  } catch (err) {
    return next(err);
  }
});


// ======================================
// GET PROVIDER AVAILABILITY
// ======================================
// Public route used by the booking page.
//
// Example:
// GET /api/providers/1/availability

router.get(
  "/:id/availability",
  async (req, res, next) => {
    try {
      const providerId = req.params.id;


      // ==================================
      // MAKE SURE PROVIDER IS VERIFIED
      // ==================================

      const providerResult =
        await db.query(
          `
          SELECT id

          FROM providers

          WHERE id = $1
            AND verification_status = 'verified'
          `,
          [providerId]
        );


      if (
        providerResult.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Provider not found",
        });
      }


      // ==================================
      // GET AVAILABILITY
      // ==================================

      const result = await db.query(
        `
        SELECT
          id,
          date,
          start_time,
          end_time

        FROM availability

        WHERE provider_id = $1

        ORDER BY
          date,
          start_time
        `,
        [providerId]
      );


      return res.json(result.rows);

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// GET BOOKED TIMES FOR A PROVIDER
// ======================================
// Used by the frontend to hide appointment
// times that overlap existing bookings.
//
// Example:
// GET /api/providers/1/booked?date=2026-10-20

router.get(
  "/:id/booked",
  async (req, res, next) => {
    try {
      const providerId =
        req.params.id;

      const { date } =
        req.query;


      // A date is required because the
      // frontend only needs bookings for
      // the selected day.
      if (!date) {
        return res.status(400).json({
          error:
            "Date is required",
        });
      }


      const result = await db.query(
        `
        SELECT
          a.id,
          a.appointment_time,

          s.duration

        FROM appointments AS a

        JOIN services AS s
          ON a.service_id = s.id

        WHERE a.provider_id = $1
          AND a.appointment_date = $2
          AND a.status = 'scheduled'

        ORDER BY
          a.appointment_time
        `,
        [
          providerId,
          date,
        ]
      );


      return res.json(result.rows);

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// GET ONE VERIFIED PROVIDER
// ======================================
// Returns provider profile information
// plus all services offered by that provider.
//
// Example:
// GET /api/providers/1
//
// IMPORTANT:
// This route stays AFTER /availability and /booked
// so Express does not confuse those words
// with a provider ID.

router.get(
  "/:id",
  async (req, res, next) => {
    try {
      const providerId =
        req.params.id;


      // ==================================
      // LOAD PROVIDER PROFILE
      // ==================================

      const providerResult =
        await db.query(
          `
          SELECT
            p.id,
            p.business_name,
            p.bio,
            p.location,
            p.verification_status,

            u.first_name,
            u.last_name

          FROM providers AS p

          JOIN users AS u
            ON p.user_id = u.id

          WHERE p.id = $1
            AND p.verification_status = 'verified'
          `,
          [providerId]
        );


      if (
        providerResult.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Provider not found",
        });
      }


      // ==================================
      // LOAD PROVIDER SERVICES
      // ==================================

      const servicesResult =
        await db.query(
          `
          SELECT
            id,
            name,
            description,
            price,
            duration

          FROM services

          WHERE provider_id = $1

          ORDER BY name
          `,
          [providerId]
        );


      // Add services onto the provider object.
      const provider =
        providerResult.rows[0];

      provider.services =
        servicesResult.rows;


      return res.json(provider);

    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;