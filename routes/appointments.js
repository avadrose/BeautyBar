// appointments.js
// Handles appointment booking and appointment management.
//
// Client features:
// - view own appointments
// - book an appointment
// - cancel an appointment
// - reschedule an appointment
//
// Provider features:
// - view appointments booked with them
// - update appointment status
//
// Important:
// The backend remains the final source of truth for
// provider availability and appointment conflict checking.

const express = require("express");
const db = require("../db");

const {
  authenticateJWT,
  requireRole,
} = require("../middleware/auth");

const router = new express.Router();


// ======================================
// GET CLIENT'S APPOINTMENTS
// ======================================
// Returns all appointments belonging to the
// currently logged-in client.
//
// provider_id is included because the frontend
// needs it when a client submits a provider review.

router.get(
  "/mine",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        SELECT
          a.id,
          a.provider_id,
          a.appointment_date,
          a.appointment_time,
          a.status,

          s.name AS service_name,
          s.price,
          s.duration,

          p.business_name,
          p.location

        FROM appointments AS a

        JOIN services AS s
          ON a.service_id = s.id

        JOIN providers AS p
          ON a.provider_id = p.id

        WHERE a.client_id = $1

        ORDER BY
          a.appointment_date,
          a.appointment_time
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
// CREATE APPOINTMENT
// ======================================
// A client can book a provider's service.
//
// Before creating the appointment, BeautyBar checks:
// 1. required fields
// 2. service belongs to provider
// 3. provider is verified
// 4. appointment fits provider availability
// 5. appointment does not overlap another booking

router.post(
  "/",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const {
        provider_id,
        service_id,
        appointment_date,
        appointment_time,
      } = req.body;


      // ==================================
      // VALIDATE REQUIRED DATA
      // ==================================

      if (
        !provider_id ||
        !service_id ||
        !appointment_date ||
        !appointment_time
      ) {
        return res.status(400).json({
          error:
            "Provider, service, appointment date, and appointment time are required",
        });
      }


      // ==================================
      // LOAD SERVICE + PROVIDER
      // ==================================
      // Make sure this service actually belongs
      // to the provider being booked.

      const serviceResult = await db.query(
        `
        SELECT
          s.id,
          s.provider_id,
          s.name,
          s.price,
          s.duration,
          p.verification_status

        FROM services AS s

        JOIN providers AS p
          ON s.provider_id = p.id

        WHERE s.id = $1
          AND s.provider_id = $2
        `,
        [
          service_id,
          provider_id,
        ]
      );


      if (serviceResult.rows.length === 0) {
        return res.status(404).json({
          error:
            "Service not found for this provider",
        });
      }


      const service =
        serviceResult.rows[0];


      // ==================================
      // PROVIDER MUST BE VERIFIED
      // ==================================

      if (
        service.verification_status !==
        "verified"
      ) {
        return res.status(403).json({
          error:
            "This provider is not currently available for booking",
        });
      }


      // ==================================
      // CHECK PROVIDER AVAILABILITY
      // ==================================
      // The appointment must begin after the
      // availability block starts and the full
      // service must finish before it ends.

      const availabilityResult =
        await db.query(
          `
          SELECT id

          FROM availability

          WHERE provider_id = $1

            AND date = $2

            AND start_time <= $3::time

            AND (
              date + end_time
            ) >= (
              $2::date
              + $3::time
              + make_interval(mins => $4)
            )
          `,
          [
            provider_id,
            appointment_date,
            appointment_time,
            service.duration,
          ]
        );


      if (
        availabilityResult.rows.length === 0
      ) {
        return res.status(400).json({
          error:
            "The selected appointment does not fit within provider availability",
        });
      }


      // ==================================
      // CHECK FOR APPOINTMENT CONFLICT
      // ==================================
      //
      // Two appointments overlap when:
      //
      // existing start < proposed end
      //
      // AND
      //
      // existing end > proposed start

      const conflictResult =
        await db.query(
          `
          SELECT
            a.id

          FROM appointments AS a

          JOIN services AS existing_service
            ON a.service_id =
               existing_service.id

          WHERE a.provider_id = $1

            AND a.appointment_date = $2

            AND a.status = 'scheduled'

            AND (
              a.appointment_date
              + a.appointment_time
            ) < (
              $2::date
              + $3::time
              + make_interval(mins => $4)
            )

            AND (
              a.appointment_date
              + a.appointment_time
              + make_interval(
                  mins =>
                    existing_service.duration
                )
            ) > (
              $2::date
              + $3::time
            )
          `,
          [
            provider_id,
            appointment_date,
            appointment_time,
            service.duration,
          ]
        );


      if (
        conflictResult.rows.length > 0
      ) {
        return res.status(409).json({
          error:
            "That appointment time is already booked",
        });
      }


      // ==================================
      // CREATE APPOINTMENT
      // ==================================

      const appointmentResult =
        await db.query(
          `
          INSERT INTO appointments
            (
              client_id,
              provider_id,
              service_id,
              appointment_date,
              appointment_time,
              status
            )

          VALUES
            (
              $1,
              $2,
              $3,
              $4,
              $5,
              'scheduled'
            )

          RETURNING *
          `,
          [
            req.user.id,
            provider_id,
            service_id,
            appointment_date,
            appointment_time,
          ]
        );


      return res.status(201).json({
        message:
          "Appointment booked successfully",

        appointment:
          appointmentResult.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// CLIENT CANCEL APPOINTMENT
// ======================================
// Clients can only cancel their own
// appointments that are still scheduled.

router.patch(
  "/:id/cancel",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        UPDATE appointments

        SET status = 'cancelled'

        WHERE id = $1
          AND client_id = $2
          AND status = 'scheduled'

        RETURNING *
        `,
        [
          req.params.id,
          req.user.id,
        ]
      );


      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Scheduled appointment not found",
        });
      }


      return res.json({
        message:
          "Appointment cancelled",

        appointment:
          result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// CLIENT RESCHEDULE APPOINTMENT
// ======================================
// Rescheduling runs the same important checks
// as booking:
// - appointment must fit availability
// - appointment cannot overlap another booking

router.patch(
  "/:id/reschedule",
  authenticateJWT,
  requireRole("client"),
  async (req, res, next) => {
    try {
      const {
        appointment_date,
        appointment_time,
      } = req.body;


      // ==================================
      // VALIDATE NEW DATE/TIME
      // ==================================

      if (
        !appointment_date ||
        !appointment_time
      ) {
        return res.status(400).json({
          error:
            "New appointment date and time are required",
        });
      }


      // ==================================
      // LOAD EXISTING APPOINTMENT
      // ==================================
      // Also load the service duration because
      // it is needed for scheduling checks.

      const appointmentResult =
        await db.query(
          `
          SELECT
            a.*,
            s.duration

          FROM appointments AS a

          JOIN services AS s
            ON a.service_id = s.id

          WHERE a.id = $1
            AND a.client_id = $2
          `,
          [
            req.params.id,
            req.user.id,
          ]
        );


      if (
        appointmentResult.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }


      const appointment =
        appointmentResult.rows[0];


      // ==================================
      // CHECK NEW AVAILABILITY
      // ==================================

      const availabilityResult =
        await db.query(
          `
          SELECT id

          FROM availability

          WHERE provider_id = $1

            AND date = $2

            AND start_time <= $3::time

            AND (
              date + end_time
            ) >= (
              $2::date
              + $3::time
              + make_interval(mins => $4)
            )
          `,
          [
            appointment.provider_id,
            appointment_date,
            appointment_time,
            appointment.duration,
          ]
        );


      if (
        availabilityResult.rows.length === 0
      ) {
        return res.status(400).json({
          error:
            "New time is outside provider availability",
        });
      }


      // ==================================
      // CHECK FOR NEW CONFLICT
      // ==================================
      // Exclude the appointment currently
      // being rescheduled from the check.

      const conflictResult =
        await db.query(
          `
          SELECT
            a.id

          FROM appointments AS a

          JOIN services AS s
            ON a.service_id = s.id

          WHERE a.provider_id = $1

            AND a.appointment_date = $2

            AND a.status = 'scheduled'

            AND a.id != $3

            AND (
              a.appointment_date
              + a.appointment_time
            ) < (
              $2::date
              + $4::time
              + make_interval(mins => $5)
            )

            AND (
              a.appointment_date
              + a.appointment_time
              + make_interval(
                  mins => s.duration
                )
            ) > (
              $2::date
              + $4::time
            )
          `,
          [
            appointment.provider_id,
            appointment_date,
            req.params.id,
            appointment_time,
            appointment.duration,
          ]
        );


      if (
        conflictResult.rows.length > 0
      ) {
        return res.status(409).json({
          error:
            "That appointment time is already booked",
        });
      }


      // ==================================
      // UPDATE APPOINTMENT
      // ==================================

      const result = await db.query(
        `
        UPDATE appointments

        SET
          appointment_date = $1,
          appointment_time = $2,
          status = 'scheduled'

        WHERE id = $3
          AND client_id = $4

        RETURNING *
        `,
        [
          appointment_date,
          appointment_time,
          req.params.id,
          req.user.id,
        ]
      );


      return res.json({
        message:
          "Appointment rescheduled",

        appointment:
          result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


// ======================================
// PROVIDER VIEW THEIR APPOINTMENTS
// ======================================
// Providers can only see appointments
// connected to their own provider profile.

router.get(
  "/provider/mine",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      // First find which provider profile
      // belongs to the logged-in user.
      const providerResult =
        await db.query(
          `
          SELECT id

          FROM providers

          WHERE user_id = $1
          `,
          [req.user.id]
        );


      if (
        providerResult.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Provider profile not found",
        });
      }


      const providerId =
        providerResult.rows[0].id;


      // Load appointments for this provider.
      const result = await db.query(
        `
        SELECT
          a.id,
          a.appointment_date,
          a.appointment_time,
          a.status,

          s.name AS service_name,
          s.duration,

          u.first_name,
          u.last_name

        FROM appointments AS a

        JOIN services AS s
          ON a.service_id = s.id

        JOIN users AS u
          ON a.client_id = u.id

        WHERE a.provider_id = $1

        ORDER BY
          a.appointment_date,
          a.appointment_time
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
// PROVIDER UPDATE APPOINTMENT STATUS
// ======================================
// Providers can mark an appointment:
// - scheduled
// - completed
// - cancelled
//
// Providers can only update appointments
// belonging to their own provider profile.

router.patch(
  "/:id/status",
  authenticateJWT,
  requireRole("provider"),
  async (req, res, next) => {
    try {
      const { status } = req.body;


      // ==================================
      // VALIDATE STATUS
      // ==================================

      const allowedStatuses = [
        "scheduled",
        "completed",
        "cancelled",
      ];


      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          error:
            "Invalid appointment status",
        });
      }


      // ==================================
      // FIND PROVIDER PROFILE
      // ==================================

      const providerResult =
        await db.query(
          `
          SELECT id

          FROM providers

          WHERE user_id = $1
          `,
          [req.user.id]
        );


      if (
        providerResult.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Provider profile not found",
        });
      }


      const providerId =
        providerResult.rows[0].id;


      // ==================================
      // UPDATE APPOINTMENT
      // ==================================

      const result = await db.query(
        `
        UPDATE appointments

        SET status = $1

        WHERE id = $2
          AND provider_id = $3

        RETURNING *
        `,
        [
          status,
          req.params.id,
          providerId,
        ]
      );


      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }


      return res.json({
        message:
          "Appointment status updated",

        appointment:
          result.rows[0],
      });

    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;