// auth.test.js
//
// Integration tests for BeautyBar authentication
// and basic role protection.
//
// These tests use Supertest to send requests
// directly to the Express application.
//
// They test:
// - the API is running
// - a seeded client can log in
// - an incorrect password is rejected
// - a client cannot access admin routes

const request = require("supertest");

const app = require("../app");
const db = require("../db");


// ======================================
// TEST DATA
// ======================================
//
// These credentials come from db/seed.js.
//
// Before running these tests, make sure:
//
// npm run seed
//
// has been run from the backend project folder.

const clientLogin = {
  username: "client1",
  password: "client123",
};


// ======================================
// CLOSE DATABASE CONNECTION
// ======================================
//
// Jest can stay open if PostgreSQL still has
// an active connection pool.
//
// This closes the pool after all tests finish.

afterAll(async () => {
  await db.end();
});


// ======================================
// API ROOT TEST
// ======================================

describe("BeautyBar API", () => {
  test("GET / returns API running message", async () => {
    const response = await request(app)
      .get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      message: "BeautyBar API is running",
    });
  });
});


// ======================================
// LOGIN TESTS
// ======================================

describe("POST /api/auth/login", () => {

  test("logs in a valid client", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send(clientLogin);

    expect(response.statusCode).toBe(200);

    // A successful login should return a token.
    expect(response.body.token).toBeDefined();


    // It should also return the logged-in user.
    expect(response.body.user).toBeDefined();

    expect(response.body.user.username)
      .toBe("client1");

    expect(response.body.user.role)
      .toBe("client");


    // The password hash should NEVER be sent
    // back to the frontend.
    expect(
      response.body.user.password_hash
    ).toBeUndefined();
  });


  test("rejects an incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        username: "client1",
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.error)
      .toBeDefined();
  });

});


// ======================================
// ROLE PROTECTION TEST
// ======================================

describe("Admin route protection", () => {

  test("prevents a client from accessing admin routes", async () => {

    // First log in as the client.
    const loginResponse =
      await request(app)
        .post("/api/auth/login")
        .send(clientLogin);


    const token =
      loginResponse.body.token;


    // Then try to access an admin-only route.
    const response =
      await request(app)
        .get("/api/admin/users")
        .set(
          "Authorization",
          `Bearer ${token}`
        );


    // Client is logged in, but does not have
    // the admin role, so the API should return 403.
    expect(response.statusCode)
      .toBe(403);
  });

});