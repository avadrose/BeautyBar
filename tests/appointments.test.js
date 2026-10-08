// appointments.test.js
//
// Integration tests for BeautyBar appointment booking.
//
// These tests cover:
// - client login
// - provider login
// - booking an appointment
// - preventing overlapping appointments
// - client appointment retrieval
// - cancelling an appointment
// - role protection
//
// IMPORTANT:
// Run:
//
// npm run seed
//
// before these tests so the seeded provider,
// services, and availability exist.

const request = require("supertest");

const app = require("../app");
const db = require("../db");


// ======================================
// SHARED TEST DATA
// ======================================

let clientToken;
let providerToken;

let providerId;
let serviceId;

let appointmentId;


// ======================================
// LOGIN CREDENTIALS
// ======================================

const clientLogin = {
  username: "client1",
  password: "client123",
};

const providerLogin = {
  username: "beautybyava",
  password: "provider123",
};


// ======================================
// TEST APPOINTMENT
// ======================================
//
// This date/time exists in our seed data.

const testAppointment = {
  appointment_date: "2026-10-15",
  appointment_time: "09:00",
};


// ======================================
// SETUP BEFORE TESTS
// ======================================

beforeAll(async () => {
  // --------------------------------------
  // LOG IN AS CLIENT
  // --------------------------------------

  const clientResponse =
    await request(app)
      .post("/api/auth/login")
      .send(clientLogin);

  clientToken =
    clientResponse.body.token;


  // --------------------------------------
  // LOG IN AS PROVIDER
  // --------------------------------------

  const providerResponse =
    await request(app)
      .post("/api/auth/login")
      .send(providerLogin);

  providerToken =
    providerResponse.body.token;


  // --------------------------------------
  // GET VERIFIED PROVIDER
  // --------------------------------------

  const providersResponse =
    await request(app)
      .get("/api/providers");


  expect(providersResponse.statusCode)
    .toBe(200);


  expect(
    providersResponse.body.length
  ).toBeGreaterThan(0);


  providerId =
    providersResponse.body[0].id;


  // --------------------------------------
  // GET ONE OF PROVIDER'S SERVICES
  // --------------------------------------

  expect(
    providersResponse.body[0].services.length
  ).toBeGreaterThan(0);


  serviceId =
    providersResponse.body[0]
      .services[0].id;
});


// ======================================
// CLEANUP AFTER TESTS
// ======================================

afterAll(async () => {
  // Remove the appointment created by
  // this test so repeated test runs stay clean.
  if (appointmentId) {
    await db.query(
      `
      DELETE FROM appointments
      WHERE id = $1
      `,
      [appointmentId]
    );
  }


  // Close PostgreSQL pool so Jest exits.
  await db.end();
});


// ======================================
// BOOK APPOINTMENT
// ======================================

describe("POST /api/appointments", () => {

  test(
    "client can book an available appointment",
    async () => {

      const response =
        await request(app)
          .post("/api/appointments")

          .set(
            "Authorization",
            `Bearer ${clientToken}`
          )

          .send({
            provider_id:
              providerId,

            service_id:
              serviceId,

            appointment_date:
              testAppointment.appointment_date,

            appointment_time:
              testAppointment.appointment_time,
          });


      // Booking should succeed.
      expect(response.statusCode)
        .toBe(201);


      // ==================================
      // GET APPOINTMENT ID
      // ==================================
      //
      // Instead of assuming the POST route
      // returns response.body.id, we retrieve
      // the client's appointments and locate
      // the appointment we just created.
      //
      // This matches our API regardless of
      // the exact booking-response structure.

      const appointmentsResponse =
        await request(app)
          .get("/api/appointments/mine")

          .set(
            "Authorization",
            `Bearer ${clientToken}`
          );


      expect(
        appointmentsResponse.statusCode
      ).toBe(200);


      const createdAppointment =
        appointmentsResponse.body.find(
          (appointment) => {

            const appointmentDate =
              appointment.appointment_date
                .slice(0, 10);

            const appointmentTime =
              appointment.appointment_time
                .slice(0, 5);

            return (
              Number(
                appointment.provider_id
              ) === Number(providerId) &&

              appointmentDate ===
                testAppointment.appointment_date &&

              appointmentTime ===
                testAppointment.appointment_time &&

              appointment.status ===
                "scheduled"
            );
          }
        );


      expect(createdAppointment)
        .toBeDefined();


      // Save the ID for later tests.
      appointmentId =
        createdAppointment.id;


      expect(appointmentId)
        .toBeDefined();
    }
  );


  // ======================================
  // PREVENT OVERLAPPING APPOINTMENTS
  // ======================================

  test(
    "prevents overlapping appointments",
    async () => {

      // Attempt to book the exact same
      // provider/date/time again.
      const response =
        await request(app)
          .post("/api/appointments")

          .set(
            "Authorization",
            `Bearer ${clientToken}`
          )

          .send({
            provider_id:
              providerId,

            service_id:
              serviceId,

            appointment_date:
              testAppointment.appointment_date,

            appointment_time:
              testAppointment.appointment_time,
          });


      // 409 means the request conflicts with
      // an existing resource/appointment.
      expect(response.statusCode)
        .toBe(409);


      expect(response.body.error)
        .toBeDefined();
    }
  );


  // ======================================
  // ROLE PROTECTION
  // ======================================

  test(
    "provider cannot book using client appointment route",
    async () => {

      const response =
        await request(app)
          .post("/api/appointments")

          .set(
            "Authorization",
            `Bearer ${providerToken}`
          )

          .send({
            provider_id:
              providerId,

            service_id:
              serviceId,

            appointment_date:
              "2026-10-15",

            appointment_time:
              "13:00",
          });


      // Provider is authenticated,
      // but this route requires client role.
      expect(response.statusCode)
        .toBe(403);
    }
  );

});


// ======================================
// VIEW CLIENT APPOINTMENTS
// ======================================

describe(
  "GET /api/appointments/mine",
  () => {

    test(
      "client can view their appointments",
      async () => {

        const response =
          await request(app)
            .get(
              "/api/appointments/mine"
            )

            .set(
              "Authorization",
              `Bearer ${clientToken}`
            );


        expect(response.statusCode)
          .toBe(200);


        expect(
          Array.isArray(response.body)
        ).toBe(true);


        // Find the appointment created
        // earlier in this test suite.
        const foundAppointment =
          response.body.find(
            (appointment) =>
              appointment.id ===
              appointmentId
          );


        expect(foundAppointment)
          .toBeDefined();


        expect(foundAppointment.status)
          .toBe("scheduled");
      }
    );

  }
);


// ======================================
// CANCEL APPOINTMENT
// ======================================

describe(
  "PATCH /api/appointments/:id/cancel",
  () => {

    test(
      "client can cancel their scheduled appointment",
      async () => {

        // Make sure the earlier booking test
        // successfully captured the appointment ID.
        expect(appointmentId)
          .toBeDefined();


        // Send the cancellation request.
        const response =
          await request(app)

            .patch(
              `/api/appointments/${appointmentId}/cancel`
            )

            .set(
              "Authorization",
              `Bearer ${clientToken}`
            );


        // The route successfully processed
        // the cancellation.
        expect(response.statusCode)
          .toBe(200);


        // ==================================
        // VERIFY THE APPOINTMENT STATUS
        // ==================================
        //
        // Our cancellation endpoint does not
        // necessarily return the updated
        // appointment object.
        //
        // So we fetch the client's appointments
        // and verify the database now shows
        // this appointment as cancelled.

        const appointmentsResponse =
          await request(app)

            .get(
              "/api/appointments/mine"
            )

            .set(
              "Authorization",
              `Bearer ${clientToken}`
            );


        expect(
          appointmentsResponse.statusCode
        ).toBe(200);


        const cancelledAppointment =
          appointmentsResponse.body.find(
            (appointment) =>
              appointment.id ===
              appointmentId
          );


        expect(cancelledAppointment)
          .toBeDefined();


        expect(
          cancelledAppointment.status
        ).toBe("cancelled");
      }
    );

  }
);