// db/index.js
//
// Creates the PostgreSQL connection pool used
// throughout the BeautyBar backend.
//
// Local PostgreSQL usually does not require SSL.
// Render's PostgreSQL connection does require SSL
// when connecting externally.
//
// We detect a Render database URL and enable SSL
// only when needed.

const { Pool } = require("pg");
require("dotenv").config();


// ======================================
// DATABASE CONNECTION STRING
// ======================================

const connectionString =
  process.env.DATABASE_URL;


// ======================================
// DETERMINE WHETHER SSL IS NEEDED
// ======================================
//
// Render database hostnames contain:
// render.com
//
// If we are connecting to Render, enable SSL.
// For the local PostgreSQL database, leave SSL off.

const isRenderDatabase =
  connectionString?.includes(
    "render.com"
  );


// ======================================
// CREATE DATABASE CONNECTION POOL
// ======================================

const db = new Pool({
  connectionString,

  // Render requires an encrypted connection.
  //
  // rejectUnauthorized: false is commonly needed
  // when connecting with node-postgres to a hosted
  // PostgreSQL service.
  ssl: isRenderDatabase
    ? {
        rejectUnauthorized: false,
      }
    : false,
});


module.exports = db;