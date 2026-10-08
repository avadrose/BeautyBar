// HomePage.jsx
// Main landing page for BeautyBar.
//
// This page introduces the app and gives users
// quick links to browse providers or register
// as a client/provider.

import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div>

      {/* ======================================
          HERO SECTION
          ====================================== */}

      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-tagline">
            Beauty services made simple
          </p>

          <h1>
            Find your next beauty appointment
            with BeautyBar
          </h1>

          <p className="hero-description">
            Discover trusted beauty professionals,
            explore their services, and book
            appointments for nails, hair, waxing,
            makeup, and more.
          </p>


          <div className="hero-buttons">

            <Link
              to="/providers"
              className="primary-link-button"
            >
              Browse Providers
            </Link>

            <Link
              to="/register"
              className="secondary-link-button"
            >
              Create Account
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================
          SERVICE CATEGORIES
          ====================================== */}

      <section className="home-section">

        <h2>
          Popular Services
        </h2>

        <p>
          Explore some of the beauty services
          available through BeautyBar.
        </p>


        <div className="service-grid">

          <div className="service-card">
            <h3>Nails</h3>

            <p>
              Manicures, nail enhancements,
              custom designs, and more.
            </p>
          </div>


          <div className="service-card">
            <h3>Hair</h3>

            <p>
              Styling, treatments, cuts,
              color, and personalized services.
            </p>
          </div>


          <div className="service-card">
            <h3>Waxing</h3>

            <p>
              Professional waxing services
              for smooth, clean results.
            </p>
          </div>


          <div className="service-card">
            <h3>Makeup</h3>

            <p>
              Makeup applications for events,
              photos, special occasions,
              and everyday glam.
            </p>
          </div>

        </div>

      </section>


      {/* ======================================
          HOW BEAUTYBAR WORKS
          ====================================== */}

      <section className="home-section">

        <h2>
          How BeautyBar Works
        </h2>


        <div className="steps-grid">

          <div className="step-card">
            <h3>1. Browse</h3>

            <p>
              Search verified beauty professionals
              by service and location.
            </p>
          </div>


          <div className="step-card">
            <h3>2. Choose</h3>

            <p>
              Compare services, pricing,
              availability, and reviews.
            </p>
          </div>


          <div className="step-card">
            <h3>3. Book</h3>

            <p>
              Select an available appointment
              time and manage your booking
              from your account.
            </p>
          </div>

        </div>

      </section>


      {/* ======================================
          PROVIDER CALL TO ACTION
          ====================================== */}

      <section className="provider-cta">

        <h2>
          Are you a beauty professional?
        </h2>

        <p>
          Create a provider account, list your
          services, manage your schedule,
          and accept bookings through BeautyBar.
        </p>

        <Link
          to="/register"
          className="primary-link-button"
        >
          Join BeautyBar
        </Link>

      </section>

    </div>
  );
}

export default HomePage;