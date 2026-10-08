// seed.js
// Resets the development database and creates
// starter BeautyBar data for testing.
//
// IMPORTANT:
// Running `npm run seed` deletes existing test data
// before recreating these starter records.

const db = require("./index");
const bcrypt = require("bcrypt");

async function seedDatabase() {
  try {
    // ======================================
    // CLEAR EXISTING DATA
    // ======================================

    console.log("Clearing existing data...");

    await db.query("DELETE FROM favorites");
    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM appointments");
    await db.query("DELETE FROM availability");
    await db.query("DELETE FROM services");
    await db.query("DELETE FROM providers");
    await db.query("DELETE FROM users");


    // ======================================
    // CREATE PASSWORD HASHES
    // ======================================

    console.log("Creating users...");

    const adminPassword =
      await bcrypt.hash(
        "admin123",
        12
      );

    const clientPassword =
      await bcrypt.hash(
        "client123",
        12
      );

    const providerPassword =
      await bcrypt.hash(
        "provider123",
        12
      );


    // ======================================
    // CREATE ADMIN USER
    // ======================================

    const adminResult =
      await db.query(
        `
        INSERT INTO users
          (
            username,
            password_hash,
            first_name,
            last_name,
            email,
            role
          )

        VALUES
          ($1, $2, $3, $4, $5, $6)

        RETURNING id
        `,
        [
          "beautyadmin",
          adminPassword,
          "BeautyBar",
          "Admin",
          "admin@beautybar.com",
          "admin",
        ]
      );


    // ======================================
    // CREATE CLIENT USER
    // ======================================

    const clientResult =
      await db.query(
        `
        INSERT INTO users
          (
            username,
            password_hash,
            first_name,
            last_name,
            email,
            role
          )

        VALUES
          ($1, $2, $3, $4, $5, $6)

        RETURNING id
        `,
        [
          "client1",
          clientPassword,
          "Emma",
          "Johnson",
          "emma@example.com",
          "client",
        ]
      );


    // ======================================
    // CREATE PROVIDER USER
    // ======================================

    const providerUserResult =
      await db.query(
        `
        INSERT INTO users
          (
            username,
            password_hash,
            first_name,
            last_name,
            email,
            role
          )

        VALUES
          ($1, $2, $3, $4, $5, $6)

        RETURNING id
        `,
        [
          "beautybyava",
          providerPassword,
          "Ava",
          "Rose",
          "ava@beautybar.com",
          "provider",
        ]
      );


    // Save IDs so related records can use them.
    const adminId =
      adminResult.rows[0].id;

    const clientId =
      clientResult.rows[0].id;

    const providerUserId =
      providerUserResult.rows[0].id;


    // ======================================
    // CREATE PROVIDER PROFILE
    // ======================================

    console.log(
      "Creating Beauty By Ava provider profile..."
    );

    const providerResult =
      await db.query(
        `
        INSERT INTO providers
          (
            user_id,
            business_name,
            bio,
            location,
            verification_status,
            verified_by,
            verified_at
          )

        VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            CURRENT_TIMESTAMP
          )

        RETURNING id
        `,
        [
          providerUserId,
          "Beauty By Ava",
          "Beauty services including nails, hair, waxing, and makeup.",
          "Columbus, OH",
          "verified",
          adminId,
        ]
      );


    const providerId =
      providerResult.rows[0].id;


    // ======================================
    // CREATE SERVICES
    // ======================================

    console.log(
      "Creating Beauty By Ava services..."
    );

    await db.query(
      `
      INSERT INTO services
        (
          provider_id,
          name,
          description,
          price,
          duration
        )

      VALUES
        ($1, $2, $3, $4, $5),
        ($1, $6, $7, $8, $9),
        ($1, $10, $11, $12, $13),
        ($1, $14, $15, $16, $17)
      `,
      [
        // ----------------------------------
        // NAILS
        // ----------------------------------

        providerId,
        "Nails",
        "Professional nail service including shaping, finishing, and customized nail styling.",
        80,
        75,


        // ----------------------------------
        // HAIR
        // ----------------------------------

        "Hair",
        "Customized hair service including styling and beauty services based on the client's needs.",
        120,
        90,


        // ----------------------------------
        // WAXING
        // ----------------------------------

        "Waxing",
        "Professional waxing service designed for smooth and clean results.",
        50,
        45,


        // ----------------------------------
        // MAKEUP
        // ----------------------------------

        "Makeup",
        "Full makeup application for events, photography, special occasions, or everyday glam.",
        75,
        60,
      ]
    );


    // ======================================
    // CREATE SAMPLE AVAILABILITY
    // ======================================
    // Starter availability gives us dates
    // that can immediately be used to test
    // the booking system.

    console.log(
      "Creating provider availability..."
    );

    await db.query(
      `
      INSERT INTO availability
        (
          provider_id,
          date,
          start_time,
          end_time
        )

      VALUES
        ($1, $2, $3, $4),
        ($1, $5, $6, $7),
        ($1, $8, $9, $10)
      `,
      [
        providerId,

        "2026-10-15",
        "09:00",
        "17:00",

        "2026-10-16",
        "10:00",
        "18:00",

        "2026-10-17",
        "09:00",
        "15:00",
      ]
    );


    // ======================================
    // SEED COMPLETE
    // ======================================

    console.log(
      "Seed completed successfully."
    );

    console.log(
      `Admin user id: ${adminId}`
    );

    console.log(
      `Client user id: ${clientId}`
    );

    console.log(
      `Provider user id: ${providerUserId}`
    );

    console.log(
      `Provider profile id: ${providerId}`
    );


    // Close the PostgreSQL connection
    // so the script exits cleanly.
    await db.end();

  } catch (err) {
    console.error(
      "Error seeding database:",
      err
    );

    await db.end();
  }
}

seedDatabase();