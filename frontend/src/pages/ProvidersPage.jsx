// ProvidersPage.jsx
// Displays verified beauty providers in a polished card layout.
//
// Users can:
// - search by provider/business name
// - filter by location
// - filter by service
// - click into a provider profile

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ProvidersPage() {
  // ======================================
  // PROVIDER DATA
  // ======================================

  const [providers, setProviders] = useState([]);

  // ======================================
  // FILTER STATE
  // ======================================

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  // ======================================
  // PAGE STATE
  // ======================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ======================================
  // LOAD PROVIDERS
  // ======================================

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/providers"
        );

        setProviders(response.data);
        setError("");

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load providers."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, []);


  // ======================================
  // FILTER PROVIDERS
  // ======================================

  const filteredProviders = useMemo(() => {
    const search =
      searchTerm.toLowerCase();

    const location =
      locationFilter.toLowerCase();

    const service =
      serviceFilter.toLowerCase();

    return providers.filter((provider) => {
      // Match business name or provider name.
      const matchesName =
        !search ||
        provider.business_name
          ?.toLowerCase()
          .includes(search) ||
        provider.first_name
          ?.toLowerCase()
          .includes(search) ||
        provider.last_name
          ?.toLowerCase()
          .includes(search);


      // Match location.
      const matchesLocation =
        !location ||
        provider.location
          ?.toLowerCase()
          .includes(location);


      // Match one of the provider's services.
      const matchesService =
        !service ||
        provider.services?.some(
          (serviceItem) =>
            serviceItem.name
              ?.toLowerCase()
              .includes(service)
        );


      return (
        matchesName &&
        matchesLocation &&
        matchesService
      );
    });

  }, [
    providers,
    searchTerm,
    locationFilter,
    serviceFilter,
  ]);


  // ======================================
  // LOADING / ERROR
  // ======================================

  if (loading) {
    return (
      <p>
        Loading providers...
      </p>
    );
  }

  if (error) {
    return (
      <p>
        {error}
      </p>
    );
  }


  return (
    <div>

      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <div className="providers-header">

        <p className="page-eyebrow">
          Find your beauty professional
        </p>

        <h1>
          Browse Providers
        </h1>

        <p>
          Search verified beauty professionals
          by name, location, or service.
        </p>

      </div>


      {/* ======================================
          SEARCH / FILTER PANEL
          ====================================== */}

      <section className="provider-filter-panel">

        <div className="provider-filter-grid">

          <div>
            <label htmlFor="provider-search">
              Provider
            </label>

            <input
              id="provider-search"
              type="text"
              placeholder="Beauty By Ava"

              value={searchTerm}

              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>


          <div>
            <label htmlFor="location-filter">
              Location
            </label>

            <input
              id="location-filter"
              type="text"
              placeholder="Columbus, OH"

              value={locationFilter}

              onChange={(event) =>
                setLocationFilter(
                  event.target.value
                )
              }
            />
          </div>


          <div>
            <label htmlFor="service-filter">
              Service
            </label>

            <input
              id="service-filter"
              type="text"
              placeholder="Nails, hair, waxing..."

              value={serviceFilter}

              onChange={(event) =>
                setServiceFilter(
                  event.target.value
                )
              }
            />
          </div>

        </div>


        <button
          type="button"
          className="clear-filter-button"

          onClick={() => {
            setSearchTerm("");
            setLocationFilter("");
            setServiceFilter("");
          }}
        >
          Clear Filters
        </button>

      </section>


      {/* ======================================
          RESULT COUNT
          ====================================== */}

      <p className="provider-result-count">
        {filteredProviders.length} provider
        {filteredProviders.length !== 1
          ? "s"
          : ""}{" "}
        found
      </p>


      {/* ======================================
          NO RESULTS
          ====================================== */}

      {filteredProviders.length === 0 && (
        <div className="empty-state">

          <h2>
            No providers found
          </h2>

          <p>
            Try changing your search or
            clearing the filters.
          </p>

        </div>
      )}


      {/* ======================================
          PROVIDER CARDS
          ====================================== */}

      <div className="provider-card-grid">

        {filteredProviders.map(
          (provider) => (
            <article
              className="provider-card"
              key={provider.id}
            >

              {/* Placeholder avatar for now.
                  Later we can add provider photos. */}

              <div className="provider-avatar">
                {provider.business_name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>


              <div className="provider-card-content">

                <div className="provider-card-top">

                  <div>

                    <p className="verified-label">
                      Verified Provider
                    </p>

                    <h2>
                      {provider.business_name}
                    </h2>

                  </div>

                </div>


                <p className="provider-name">
                  {provider.first_name}{" "}
                  {provider.last_name}
                </p>


                <p className="provider-location">
                  {provider.location}
                </p>


                {provider.bio && (
                  <p className="provider-bio">
                    {provider.bio}
                  </p>
                )}


                {/* ==================================
                    SERVICE TAGS
                    ================================== */}

                {provider.services?.length > 0 && (
                  <div className="service-tags">

                    {provider.services.map(
                      (service) => (
                        <span
                          className="service-tag"
                          key={service.id}
                        >
                          {service.name}
                        </span>
                      )
                    )}

                  </div>
                )}


                {/* ==================================
                    SERVICE PREVIEW
                    ================================== */}

                {provider.services?.length > 0 && (
                  <div className="provider-service-preview">

                    {provider.services
                      .slice(0, 3)
                      .map((service) => (
                        <div
                          className="service-preview-row"
                          key={service.id}
                        >
                          <span>
                            {service.name}
                          </span>

                          <strong>
                            ${service.price}
                          </strong>
                        </div>
                      ))}

                  </div>
                )}


                {/* ==================================
                    VIEW PROFILE BUTTON
                    ================================== */}

                <Link
                  className="provider-card-button"
                  to={`/providers/${provider.id}`}
                >
                  View Provider
                </Link>

              </div>

            </article>
          )
        )}

      </div>

    </div>
  );
}

export default ProvidersPage;