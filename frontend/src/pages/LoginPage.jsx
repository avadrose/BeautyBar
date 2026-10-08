// LoginPage.jsx
// Handles user login for clients, providers, and admins.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();

  // ======================================
  // FORM STATE
  // ======================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ======================================
  // HANDLE LOGIN
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          username,
          password,
        }
      );

      const { token, user } = response.data;

      // Save login information so protected
      // routes can recognize the user.
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // Redirect based on account role.
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "provider") {
        navigate("/provider-dashboard");
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

        {/* ======================================
            HEADER
            ====================================== */}

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


        {/* ======================================
            ERROR MESSAGE
            ====================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* ======================================
            LOGIN FORM
            ====================================== */}

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


        {/* ======================================
            REGISTER LINK
            ====================================== */}

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