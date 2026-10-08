// ProviderProfileSetupPage.jsx
// Lets a newly registered provider create their
// BeautyBar business profile.
//
// New provider flow:
// Register
// → Create provider profile
// → Profile starts as "pending"
// → Admin reviews and verifies provider
// → Provider becomes publicly bookable

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProviderProfileSetupPage() {
  // ======================================
  // FORM STATE
  // ======================================

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [
    bio,
    setBio,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  // Stores error/success messages.
  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const navigate = useNavigate();


  // ======================================
  // CREATE PROVIDER PROFILE
  // ======================================

  async function handleSubmit(event) {
    // Stop the browser from refreshing
    // when the form is submitted.
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Get the JWT created during registration/login.
      const token =
        localStorage.getItem("token");


      // Send provider profile information
      // to our protected backend route.
      await axios.post(
        "http://localhost:3001/api/provider-profile",

        {
          business_name: businessName,
          bio,
          location,
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      // After creating the profile,
      // send provider to their dashboard.
      navigate("/provider-dashboard");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to create provider profile."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div>

      <h1>
        Create Your Provider Profile
      </h1>

      <p>
        Tell clients about your beauty business.
        Your profile will be reviewed before it
        becomes publicly bookable.
      </p>


      {/* Show backend/frontend error */}
      {error && (
        <p>
          {error}
        </p>
      )}


      <form onSubmit={handleSubmit}>

        {/* ==================================
            BUSINESS NAME
            ================================== */}

        <div>
          <label htmlFor="business-name">
            Business Name
          </label>

          <input
            id="business-name"
            type="text"

            value={
              businessName
            }

            onChange={(event) =>
              setBusinessName(
                event.target.value
              )
            }

            required
          />
        </div>


        {/* ==================================
            LOCATION
            ================================== */}

        <div>
          <label htmlFor="location">
            Location
          </label>

          <input
            id="location"
            type="text"

            placeholder="Columbus, OH"

            value={
              location
            }

            onChange={(event) =>
              setLocation(
                event.target.value
              )
            }
          />
        </div>


        {/* ==================================
            BIO
            ================================== */}

        <div>
          <label htmlFor="bio">
            About Your Business
          </label>

          <textarea
            id="bio"

            placeholder="Tell clients about your services, experience, specialties, or style."

            value={
              bio
            }

            onChange={(event) =>
              setBio(
                event.target.value
              )
            }

            rows="6"
          />
        </div>


        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating Profile..."
            : "Create Provider Profile"}
        </button>

      </form>

    </div>
  );
}

export default ProviderProfileSetupPage;