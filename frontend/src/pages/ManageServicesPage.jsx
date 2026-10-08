// ManageServicesPage.jsx
//
// Provider service management page.
//
// Providers can:
// - view current services
// - create a service
// - edit a service
// - delete a service
//
// Service information includes:
// - name
// - description
// - price
// - duration

import {
  useEffect,
  useState,
} from "react";

import api from "../api";


function ManageServicesPage() {
  // ======================================
  // SERVICE DATA
  // ======================================

  const [
    services,
    setServices,
  ] = useState([]);


  // ======================================
  // FORM DATA
  // ======================================

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  });


  // If editingId is null, the form
  // creates a new service.
  //
  // If it contains an ID, the form
  // edits an existing service.
  const [
    editingId,
    setEditingId,
  ] = useState(null);


  // ======================================
  // PAGE STATE
  // ======================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  // ======================================
  // LOAD SERVICES
  // ======================================

  async function fetchServices() {
    try {
      const token =
        localStorage.getItem("token");


      const response =
        await api.get(
          "/api/services/mine",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setServices(
        response.data
      );

      setError("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to load services."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchServices();
  }, []);


  // ======================================
  // HANDLE FORM CHANGES
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
  // RESET FORM
  // ======================================

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
    });

    setEditingId(null);
  }


  // ======================================
  // CREATE OR UPDATE SERVICE
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");


    try {
      const token =
        localStorage.getItem("token");


      // Convert number fields from strings.
      const payload = {
        name:
          formData.name,

        description:
          formData.description,

        price:
          Number(formData.price),

        duration:
          Number(formData.duration),
      };


      // ==================================
      // EDIT EXISTING SERVICE
      // ==================================

      if (editingId) {
        await api.patch(
          `/api/services/${editingId}`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setMessage(
          "Service updated successfully."
        );


      // ==================================
      // CREATE NEW SERVICE
      // ==================================

      } else {
        await api.post(
          "/api/services",
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setMessage(
          "Service added successfully."
        );
      }


      resetForm();

      await fetchServices();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to save service."
      );
    }
  }


  // ======================================
  // START EDITING
  // ======================================

  function startEditing(service) {
    setEditingId(
      service.id
    );


    setFormData({
      name:
        service.name,

      description:
        service.description || "",

      price:
        service.price,

      duration:
        service.duration,
    });


    // Move user back toward the form.
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // ======================================
  // DELETE SERVICE
  // ======================================

  async function deleteService(
    serviceId
  ) {
    try {
      const token =
        localStorage.getItem("token");


      await api.delete(
        `/api/services/${serviceId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      setMessage(
        "Service deleted successfully."
      );

      setError("");


      await fetchServices();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to delete service."
      );
    }
  }


  // ======================================
  // LOADING STATE
  // ======================================

  if (loading) {
    return (
      <div className="page-message">
        Loading services...
      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* ==================================
          PAGE HEADER
          ================================== */}

      <div className="dashboard-header">

        <p className="page-eyebrow">
          Provider Tools
        </p>

        <h1>
          Manage Services
        </h1>

        <p>
          Add, update, or remove the services
          you offer through BeautyBar.
        </p>

      </div>


      {/* ==================================
          MESSAGES
          ================================== */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ==================================
          SERVICE FORM
          ================================== */}

      <section className="management-card">

        <h2>
          {editingId
            ? "Edit Service"
            : "Add Service"}
        </h2>


        <form
          className="management-form"
          onSubmit={handleSubmit}
        >

          <div>

            <label htmlFor="name">
              Service Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>


          <div>

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="4"
              value={
                formData.description
              }
              onChange={handleChange}
            />

          </div>


          <div className="management-grid">

            <div>

              <label htmlFor="price">
                Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />

            </div>


            <div>

              <label htmlFor="duration">
                Duration (minutes)
              </label>

              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={
                  formData.duration
                }
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <div className="management-form-actions">

            <button type="submit">

              {editingId
                ? "Save Changes"
                : "Add Service"}

            </button>


            {editingId && (
              <button
                type="button"
                className="secondary-action-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </section>


      {/* ==================================
          CURRENT SERVICES
          ================================== */}

      <section className="management-card">

        <h2>
          Current Services
        </h2>


        {services.length === 0 ? (
          <p>
            You have not added any services yet.
          </p>
        ) : (
          <div className="management-list">

            {services.map(
              (service) => (
                <article
                  className="management-item"
                  key={service.id}
                >

                  <div>

                    <h3>
                      {service.name}
                    </h3>

                    <p>
                      {service.description}
                    </p>

                    <p className="management-meta">

                      ${service.price}

                      {" • "}

                      {service.duration}
                      {" "}minutes

                    </p>

                  </div>


                  <div className="management-item-actions">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          service
                        )
                      }
                    >
                      Edit
                    </button>


                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        deleteService(
                          service.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}


export default ManageServicesPage;