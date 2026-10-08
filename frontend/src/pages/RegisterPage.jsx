// RegisterPage.jsx
//
// Allows a new user to create either:
//
// - a client account
// - a beauty professional/provider account
//
// Admin accounts cannot be created publicly.
//
// After registration:
// - clients go to the provider list
// - providers go to provider profile setup

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api";


function RegisterPage() {
  const navigate = useNavigate();


  // ======================================
  // REGISTRATION FORM STATE
  // ======================================

  const [formData, setFormData] =
    useState({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      role: "client",
    });


  // ======================================
  // PAGE STATE
  // ======================================

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ======================================
  // HANDLE FORM INPUT
  // ======================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }


  // ======================================
  // CREATE ACCOUNT
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/api/auth/register",
          formData
        );


      const {
        token,
        user,
      } = response.data;


      // Automatically log the user in
      // after successful registration.
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // Providers need to create their
      // professional profile before they
      // can manage BeautyBar services.
      if (
        user.role === "provider"
      ) {
        navigate(
          "/provider-profile-setup"
        );

      } else {
        navigate("/providers");
      }

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to create account."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* ==================================
            HEADER
            ================================== */}

        <div className="auth-header">

          <p className="page-eyebrow">
            Join BeautyBar
          </p>

          <h1>
            Create your account
          </h1>

          <p>
            Register as a client to book
            beauty services or as a professional
            to manage your BeautyBar profile.
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
            REGISTRATION FORM
            ================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-name-grid">

            <div>

              <label htmlFor="first_name">
                First Name
              </label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                value={
                  formData.first_name
                }
                onChange={handleChange}
                required
              />

            </div>


            <div>

              <label htmlFor="last_name">
                Last Name
              </label>

              <input
                id="last_name"
                name="last_name"
                type="text"
                value={
                  formData.last_name
                }
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <div>

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={
                formData.username
              }
              onChange={handleChange}
              required
            />

          </div>


          <div>

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={
                formData.email
              }
              onChange={handleChange}
              required
            />

          </div>


          <div>

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={
                formData.password
              }
              onChange={handleChange}
              minLength="6"
              required
            />

          </div>


          <div>

            <label htmlFor="role">
              Account Type
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >

              <option value="client">
                Client
              </option>

              <option value="provider">
                Beauty Professional
              </option>

            </select>

          </div>


          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>


        {/* ==================================
            LOGIN LINK
            ================================== */}

        <p className="auth-footer">

          Already have an account?{" "}

          <Link to="/login">
            Log in
          </Link>

        </p>

      </div>

    </div>
  );
}


export default RegisterPage;