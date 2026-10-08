// ManageAvailabilityPage.jsx
//
// Allows providers to manage the dates and
// times clients can use for booking.
//
// Providers can:
// - add availability
// - edit availability
// - delete availability

import {
  useEffect,
  useState,
} from "react";

import api from "../api";


function ManageAvailabilityPage() {
  // ======================================
  // AVAILABILITY DATA
  // ======================================

  const [
    availability,
    setAvailability,
  ] = useState([]);


  // ======================================
  // FORM STATE
  // ======================================

  const [
    formData,
    setFormData,
  ] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });


  // Null means creating a new block.
  // An ID means editing an existing block.
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
  // LOAD AVAILABILITY
  // ======================================

  async function fetchAvailability() {
    try {
      const token =
        localStorage.getItem("token");


      const response =
        await api.get(
          "/api/availability/mine",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setAvailability(
        response.data
      );

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
  // HANDLE INPUT
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
      date: "",
      start_time: "",
      end_time: "",
    });

    setEditingId(null);
  }


  // ======================================
  // CREATE OR EDIT AVAILABILITY
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");


    try {
      const token =
        localStorage.getItem("token");


      // Edit an existing availability block.
      if (editingId) {
        await api.patch(
          `/api/availability/${editingId}`,
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


      // Create a new availability block.
      } else {
        await api.post(
          "/api/availability",
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
  // START EDITING
  // ======================================

  function startEditing(block) {
    setEditingId(
      block.id
    );


    // PostgreSQL may return seconds,
    // so only use HH:MM in the time inputs.
    setFormData({
      date:
        block.date.slice(0, 10),

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

  async function deleteAvailability(
    id
  ) {
    try {
      const token =
        localStorage.getItem("token");


      await api.delete(
        `/api/availability/${id}`,
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


  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="page-message">
        Loading availability...
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
          Manage Availability
        </h1>

        <p>
          Set the dates and times clients
          can use to book appointments.
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
          AVAILABILITY FORM
          ================================== */}

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
                value={
                  formData.start_time
                }
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
                value={
                  formData.end_time
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


      {/* ==================================
          CURRENT AVAILABILITY
          ================================== */}

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

            {availability.map(
              (block) => (
                <article
                  className="management-item"
                  key={block.id}
                >

                  <div>

                    <h3>
                      {block.date.slice(
                        0,
                        10
                      )}
                    </h3>

                    <p className="management-meta">

                      {block.start_time.slice(
                        0,
                        5
                      )}

                      {" - "}

                      {block.end_time.slice(
                        0,
                        5
                      )}

                    </p>

                  </div>


                  <div className="management-item-actions">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          block
                        )
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
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}


export default ManageAvailabilityPage;