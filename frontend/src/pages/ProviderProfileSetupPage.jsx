// ProviderProfileSetupPage.jsx
//
// New beauty professionals use this page
// after registration.
//
// The provider creates:
//
// - business name
// - location
// - bio
//
// New provider profiles are created with
// pending verification status.
//
// An admin must verify the provider before
// the profile becomes publicly bookable.

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api";


function ProviderProfileSetupPage() {
  const navigate =
    useNavigate();


  // ======================================
  // FORM STATE
  // ======================================

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    bio,
    setBio,
  ] = useState("");


  // ======================================
  // PAGE STATE
  // ======================================

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ======================================
  // CREATE PROVIDER PROFILE
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);


    try {
      const token =
        localStorage.getItem("token");


      await api.post(
        "/api/provider-profile",
        {
          business_name:
            businessName,

          location,

          bio,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      // Profile was created.
      // Provider can now use dashboard tools.
      navigate(
        "/provider-dashboard"
      );

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
        Create Provider Profile
      </h1>


      <p>
        Your profile will be submitted
        for admin verification before
        becoming publicly bookable.
      </p>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ==================================
          PROFILE FORM
          ================================== */}

      <form
        onSubmit={handleSubmit}
      >

        <div>

          <label htmlFor="business-name">
            Business Name
          </label>

          <input
            id="business-name"
            type="text"
            value={businessName}
            onChange={(event) =>
              setBusinessName(
                event.target.value
              )
            }
            required
          />

        </div>


        <div>

          <label htmlFor="location">
            Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) =>
              setLocation(
                event.target.value
              )
            }
          />

        </div>


        <div>

          <label htmlFor="bio">
            Bio
          </label>

          <textarea
            id="bio"
            value={bio}
            onChange={(event) =>
              setBio(
                event.target.value
              )
            }
          />

        </div>


        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Profile"}
        </button>

      </form>

    </div>
  );
}


export default ProviderProfileSetupPage;