const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = new express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      role,
    } = req.body;

    if (
      !username ||
      !password ||
      !first_name ||
      !last_name ||
      !email ||
      !role
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (!["client", "provider"].includes(role)) {
      return res.status(400).json({
        error: "Role must be client or provider",
      });
    }

    const existingUser = await db.query(
      `
      SELECT id
      FROM users
      WHERE username = $1 OR email = $2
      `,
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Username or email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
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
      RETURNING
        id,
        username,
        first_name,
        last_name,
        email,
        role
      `,
      [
        username,
        passwordHash,
        first_name,
        last_name,
        email,
        role,
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const result = await db.query(
      `
      SELECT *
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: "Account is inactive",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;