// ManageServicesPage.jsx
// Lets the logged-in provider view, add, edit, and delete
// the services they offer.

import { useEffect, useState } from "react";
import axios from "axios";

function ManageServicesPage() {
  // Stores provider services from the backend.
  const [services, setServices] = useState([]);

  // Form fields for creating a new service.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  // Tracks which service is currently being edited.
  const [editingId, setEditingId] = useState(null);

  // Stores error messages.
  const [error, setError] = useState("");


  // ======================================
  // FETCH PROVIDER SERVICES
  // ======================================

  async function fetchServices() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3001/api/services/mine",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServices(response.data);
      setError("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to load services."
      );
    }
  }


  useEffect(() => {
    fetchServices();
  }, []);


  // ======================================
  // CREATE OR UPDATE SERVICE
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const serviceData = {
        name,
        description,
        price: Number(price),
        duration: Number(duration),
      };

      // If editingId exists, update the service.
      if (editingId) {
        await axios.patch(
          `http://localhost:3001/api/services/${editingId}`,
          serviceData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      } else {
        // Otherwise create a brand-new service.
        await axios.post(
          "http://localhost:3001/api/services",
          serviceData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Clear the form after saving.
      setName("");
      setDescription("");
      setPrice("");
      setDuration("");
      setEditingId(null);

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
  // START EDITING A SERVICE
  // ======================================

  function handleEdit(service) {
    // Fill the form with the selected service's current data.
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description || "");
    setPrice(service.price);
    setDuration(service.duration);
  }


  // ======================================
  // CANCEL EDITING
  // ======================================

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
  }


  // ======================================
  // DELETE SERVICE
  // ======================================

  async function handleDelete(serviceId) {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3001/api/services/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchServices();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to delete service."
      );
    }
  }


  return (
    <div>
      <h1>Manage Services</h1>

      {error && (
        <p>{error}</p>
      )}


      {/* ======================================
          CREATE / EDIT SERVICE FORM
          ====================================== */}

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="service-name">
            Service Name
          </label>

          <input
            id="service-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </div>


        <div>
          <label htmlFor="service-description">
            Description
          </label>

          <textarea
            id="service-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>


        <div>
          <label htmlFor="service-price">
            Price
          </label>

          <input
            id="service-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            required
          />
        </div>


        <div>
          <label htmlFor="service-duration">
            Duration in Minutes
          </label>

          <input
            id="service-duration"
            type="number"
            min="1"
            value={duration}
            onChange={(event) =>
              setDuration(event.target.value)
            }
            required
          />
        </div>


        <button type="submit">
          {editingId
            ? "Update Service"
            : "Add Service"}
        </button>


        {/* Only show when editing an existing service */}
        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
          >
            Cancel Edit
          </button>
        )}

      </form>


      <hr />


      {/* ======================================
          EXISTING SERVICES
          ====================================== */}

      <h2>My Services</h2>

      {services.length === 0 && (
        <p>You have not added any services yet.</p>
      )}


      {services.map((service) => (
        <div key={service.id}>

          <h3>{service.name}</h3>

          <p>{service.description}</p>

          <p>
            Price: ${service.price}
          </p>

          <p>
            Duration: {service.duration} minutes
          </p>


          <button
            type="button"
            onClick={() =>
              handleEdit(service)
            }
          >
            Edit
          </button>


          <button
            type="button"
            onClick={() =>
              handleDelete(service.id)
            }
          >
            Delete
          </button>

          <hr />

        </div>
      ))}

    </div>
  );
}

export default ManageServicesPage;