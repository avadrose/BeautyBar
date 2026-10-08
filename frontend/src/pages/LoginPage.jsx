// LoginPage.jsx
//
// Handles login for all BeautyBar account types.
//
// A successful login:
// - stores the JWT token
// - stores basic user information
// - redirects the user based on their role
//
// Roles:
// - client
// - provider
// - admin

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api";


function LoginPage() {
  const navigate = useNavigate();


  // ======================================
  // FORM STATE
  // ======================================

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");


  // ======================================
  // PAGE STATE
  // ======================================

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ======================================
  // HANDLE LOGIN
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send username/password to backend.
      const response =
        await api.post(
          "/api/auth/login",
          {
            username,
            password,
          }
        );


      const {
        token,
        user,
      } = response.data;


      // ==================================
      // SAVE LOGIN INFORMATION
      // ==================================
      //
      // Token is used for authenticated API
      // requests.
      //
      // User is used by the frontend to know
      // which role is logged in.

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // ==================================
      // REDIRECT BASED ON ROLE
      // ==================================

      if (user.role === "admin") {
        navigate("/admin");

      } else if (
        user.role === "provider"
      ) {
        navigate(
          "/provider-dashboard"
        );

      } else {
        navigate("/providers");
      }

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to log in."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* ==================================
            PAGE HEADER
            ================================== */}

        <div className="auth-header">

          <p className="page-eyebrow">
            Welcome Back
          </p>

          <h1>
            Log in to BeautyBar
          </h1>

          <p>
            Access your appointments,
            provider tools, or admin dashboard.
          </p>

        </div>


        {/* ==================================
            ERROR MESSAGE
            ================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* ==================================
            LOGIN FORM
            ================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div>

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              autoComplete="username"
              required
            />

          </div>


          <div>

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="current-password"
              required
            />

          </div>


          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>


        {/* ==================================
            REGISTER LINK
            ================================== */}

        <p className="auth-footer">

          Don&apos;t have an account?{" "}

          <Link to="/register">
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}


export default LoginPage;