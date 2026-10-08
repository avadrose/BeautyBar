// ManageAvailabilityPage.jsx
//
// Provider availability management page.
//
// Providers can:
// - add availability blocks
// - edit availability
// - delete availability

import { useEffect, useState } from "react";
import axios from "axios";

function ManageAvailabilityPage() {
  // ======================================
  // AVAILABILITY DATA
  // ======================================

  const [availability, setAvailability] = useState([]);

  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });

  const [editingId, setEditingId] = useState(null);

  // ======================================
  // PAGE STATE
  // ======================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // ======================================
  // LOAD AVAILABILITY
  // ======================================

  async function fetchAvailability() {
    try {
      const token =
        localStorage.getItem("token");

      const response =
        await axios.get(
          "http://localhost:3001/api/availability/mine",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setAvailability(response.data);
      setError("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to load availability."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchAvailability();
  }, []);


  // ======================================
  // FORM CHANGES
  // ======================================

  function handleChange(event) {
    const { name, value } = event.target;

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
      date: "",
      start_time: "",
      end_time: "",
    });

    setEditingId(null);
  }


  // ======================================
  // ADD / EDIT AVAILABILITY
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const token =
        localStorage.getItem("token");


      if (editingId) {
        await axios.patch(
          `http://localhost:3001/api/availability/${editingId}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setMessage(
          "Availability updated successfully."
        );

      } else {
        await axios.post(
          "http://localhost:3001/api/availability",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setMessage(
          "Availability added successfully."
        );
      }


      resetForm();
      await fetchAvailability();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to save availability."
      );
    }
  }


  // ======================================
  // EDIT AVAILABILITY
  // ======================================

  function startEditing(block) {
    setEditingId(block.id);

    setFormData({
      date: block.date.slice(0, 10),
      start_time:
        block.start_time.slice(0, 5),
      end_time:
        block.end_time.slice(0, 5),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // ======================================
  // DELETE AVAILABILITY
  // ======================================

  async function deleteAvailability(id) {
    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3001/api/availability/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Availability deleted successfully."
      );

      setError("");

      await fetchAvailability();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to delete availability."
      );
    }
  }


  if (loading) {
    return (
      <div className="page-message">
        Loading availability...
      </div>
    );
  }


  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <p className="page-eyebrow">
          Provider Tools
        </p>

        <h1>
          Manage Availability
        </h1>

        <p>
          Set the dates and times clients
          can use to book appointments.
        </p>

      </div>


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


      {/* ======================================
          AVAILABILITY FORM
          ====================================== */}

      <section className="management-card">

        <h2>
          {editingId
            ? "Edit Availability"
            : "Add Availability"}
        </h2>


        <form
          className="management-form"
          onSubmit={handleSubmit}
        >

          <div>
            <label htmlFor="date">
              Date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>


          <div className="management-grid">

            <div>
              <label htmlFor="start_time">
                Start Time
              </label>

              <input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>


            <div>
              <label htmlFor="end_time">
                End Time
              </label>

              <input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>

          </div>


          <div className="management-form-actions">

            <button type="submit">
              {editingId
                ? "Save Changes"
                : "Add Availability"}
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


      {/* ======================================
          AVAILABILITY LIST
          ====================================== */}

      <section className="management-card">

        <h2>
          Current Availability
        </h2>


        {availability.length === 0 ? (
          <p>
            No availability has been added yet.
          </p>
        ) : (
          <div className="management-list">

            {availability.map((block) => (
              <article
                className="management-item"
                key={block.id}
              >

                <div>

                  <h3>
                    {block.date.slice(0, 10)}
                  </h3>

                  <p className="management-meta">
                    {block.start_time.slice(0, 5)}
                    {" - "}
                    {block.end_time.slice(0, 5)}
                  </p>

                </div>


                <div className="management-item-actions">

                  <button
                    type="button"
                    onClick={() =>
                      startEditing(block)
                    }
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      deleteAvailability(
                        block.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default ManageAvailabilityPage;