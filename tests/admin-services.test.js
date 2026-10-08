// admin-services.test.js
//
// Final backend integration tests for BeautyBar.
//
// Covers:
// - provider service creation
// - provider service deletion
// - admin provider verification access
// - role protection for admin routes

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let providerToken;
let adminToken;

let createdServiceId;


// ======================================
// TEST LOGINS
// ======================================

const providerLogin = {
  username: "beautybyava",
  password: "provider123",
};

const adminLogin = {
  username: "beautyadmin",
  password: "admin123",
};


// ======================================
// SETUP
// ======================================

beforeAll(async () => {
  // Provider login.
  const providerResponse =
    await request(app)
      .post("/api/auth/login")
      .send(providerLogin);

  providerToken =
    providerResponse.body.token;


  // Admin login.
  const adminResponse =
    await request(app)
      .post("/api/auth/login")
      .send(adminLogin);

  adminToken =
    adminResponse.body.token;
});


// ======================================
// CLEANUP
// ======================================

afterAll(async () => {
  // Remove test service if it still exists.
  if (createdServiceId) {
    await db.query(
      `
      DELETE FROM services
      WHERE id = $1
      `,
      [createdServiceId]
    );
  }

  await db.end();
});


// ======================================
// PROVIDER SERVICE MANAGEMENT
// ======================================

describe("Provider service management", () => {

  test("provider can create a service", async () => {

    const response =
      await request(app)
        .post("/api/services")

        .set(
          "Authorization",
          `Bearer ${providerToken}`
        )

        .send({
          name: "Test Facial",
          description:
            "Temporary service created by Jest.",
          price: 65,
          duration: 60,
        });


    expect(response.statusCode)
      .toBe(201);


    // If the route returns the created row,
    // save the ID directly.
    if (response.body.id) {
      createdServiceId =
        response.body.id;
    }


    // If it does not return the ID,
    // fetch provider services and find it.
    if (!createdServiceId) {
      const servicesResponse =
        await request(app)
          .get("/api/services/mine")

          .set(
            "Authorization",
            `Bearer ${providerToken}`
          );


      const service =
        servicesResponse.body.find(
          (item) =>
            item.name ===
            "Test Facial"
        );


      expect(service)
        .toBeDefined();


      createdServiceId =
        service.id;
    }


    expect(createdServiceId)
      .toBeDefined();
  });


  test("provider can delete their service", async () => {

    expect(createdServiceId)
      .toBeDefined();


    const response =
      await request(app)
        .delete(
          `/api/services/${createdServiceId}`
        )

        .set(
          "Authorization",
          `Bearer ${providerToken}`
        );


    expect(response.statusCode)
      .toBe(200);


    // Prevent afterAll from trying
    // to delete it again.
    createdServiceId = null;
  });

});


// ======================================
// ADMIN ACCESS
// ======================================

describe("Admin provider management", () => {

  test("admin can view provider accounts", async () => {

    const response =
      await request(app)
        .get("/api/admin/providers")

        .set(
          "Authorization",
          `Bearer ${adminToken}`
        );


    expect(response.statusCode)
      .toBe(200);


    expect(
      Array.isArray(response.body)
    ).toBe(true);


    expect(response.body.length)
      .toBeGreaterThan(0);
  });


  test("provider cannot access admin provider list", async () => {

    const response =
      await request(app)
        .get("/api/admin/providers")

        .set(
          "Authorization",
          `Bearer ${providerToken}`
        );


    expect(response.statusCode)
      .toBe(403);
  });

});