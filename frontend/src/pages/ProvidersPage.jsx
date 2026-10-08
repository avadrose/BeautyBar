// ProvidersPage.jsx
//
// Displays all verified BeautyBar providers.
//
// Users can:
// - browse providers
// - search by provider/business name
// - filter by location
// - filter by service
// - view service previews
// - open the full provider profile

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";


function ProvidersPage() {
  // ======================================
  // PROVIDER DATA
  // ======================================

  const [
    providers,
    setProviders,
  ] = useState([]);


  // ======================================
  // SEARCH / FILTER STATE
  // ======================================

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    locationFilter,
    setLocationFilter,
  ] = useState("");

  const [
    serviceFilter,
    setServiceFilter,
  ] = useState("");


  // ======================================
  // PAGE STATE
  // ======================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ======================================
  // LOAD VERIFIED PROVIDERS
  // ======================================

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response =
          await api.get(
            "/api/providers"
          );

        setProviders(
          response.data
        );

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
  //
  // useMemo recalculates the filtered list
  // only when providers or filter values change.

  const filteredProviders =
    useMemo(() => {
      const search =
        searchTerm.toLowerCase();

      const location =
        locationFilter.toLowerCase();

      const service =
        serviceFilter.toLowerCase();


      return providers.filter(
        (provider) => {

          // Match business name or
          // provider first/last name.
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


          // Match any service name.
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
        }
      );

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

      {/* ==================================
          PAGE HEADER
          ================================== */}

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


      {/* ==================================
          FILTER PANEL
          ================================== */}

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


        {/* Clear all active filters. */}

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


      {/* ==================================
          RESULT COUNT
          ================================== */}

      <p className="provider-result-count">

        {filteredProviders.length} provider

        {filteredProviders.length !== 1
          ? "s"
          : ""}{" "}

        found

      </p>


      {/* ==================================
          EMPTY SEARCH RESULT
          ================================== */}

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


      {/* ==================================
          PROVIDER CARDS
          ================================== */}

      <div className="provider-card-grid">

        {filteredProviders.map(
          (provider) => (
            <article
              className="provider-card"
              key={provider.id}
            >

              {/* Placeholder avatar using
                  first business-name letter. */}

              <div className="provider-avatar">

                {provider.business_name
                  ?.charAt(0)
                  .toUpperCase()}

              </div>


              <div className="provider-card-content">

                <p className="verified-label">
                  Verified Provider
                </p>


                <h2>
                  {provider.business_name}
                </h2>


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


                {/* Service name tags. */}

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


                {/* Preview first three services. */}

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


                {/* Open provider details page. */}

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