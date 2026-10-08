// ManageAvailabilityPage.jsx
// Lets providers view, add, edit, and delete
// the time blocks when they are available for bookings.

import { useEffect, useState } from "react";
import axios from "axios";

function ManageAvailabilityPage() {
  // Stores availability records from the backend.
  const [availability, setAvailability] = useState([]);

  // Form fields.
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Tracks which availability block is being edited.
  const [editingId, setEditingId] = useState(null);

  // Stores an error message if something goes wrong.
  const [error, setError] = useState("");


  // ======================================
  // FETCH PROVIDER AVAILABILITY
  // ======================================

  async function fetchAvailability() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3001/api/availability/mine",
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    }
  }


  // Load availability when page first opens.
  useEffect(() => {
    fetchAvailability();
  }, []);


  // ======================================
  // CREATE OR UPDATE AVAILABILITY
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const availabilityData = {
        date,
        start_time: startTime,
        end_time: endTime,
      };


      // If editingId exists, update an existing block.
      if (editingId) {
        await axios.patch(
          `http://localhost:3001/api/availability/${editingId}`,
          availabilityData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      } else {
        // Otherwise create a new availability block.
        await axios.post(
          "http://localhost:3001/api/availability",
          availabilityData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }


      // Clear the form after saving.
      setDate("");
      setStartTime("");
      setEndTime("");
      setEditingId(null);

      // Reload availability so the page updates immediately.
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

  function handleEdit(block) {
    setEditingId(block.id);

    // PostgreSQL may return a full date string,
    // so slice it to YYYY-MM-DD for the date input.
    setDate(block.date.slice(0, 10));

    // TIME values may include seconds.
    // The HTML time input only needs HH:MM here.
    setStartTime(block.start_time.slice(0, 5));
    setEndTime(block.end_time.slice(0, 5));
  }


  // ======================================
  // CANCEL EDIT
  // ======================================

  function cancelEdit() {
    setEditingId(null);
    setDate("");
    setStartTime("");
    setEndTime("");
  }


  // ======================================
  // DELETE AVAILABILITY
  // ======================================

  async function handleDelete(id) {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3001/api/availability/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchAvailability();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to delete availability."
      );
    }
  }


  return (
    <div>
      <h1>Manage Availability</h1>

      {error && (
        <p>{error}</p>
      )}


      {/* ======================================
          CREATE / EDIT FORM
          ====================================== */}

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="availability-date">
            Date
          </label>

          <input
            id="availability-date"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            required
          />
        </div>


        <div>
          <label htmlFor="start-time">
            Start Time
          </label>

          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(event) =>
              setStartTime(event.target.value)
            }
            required
          />
        </div>


        <div>
          <label htmlFor="end-time">
            End Time
          </label>

          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(event) =>
              setEndTime(event.target.value)
            }
            required
          />
        </div>


        <button type="submit">
          {editingId
            ? "Update Availability"
            : "Add Availability"}
        </button>


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
          EXISTING AVAILABILITY
          ====================================== */}

      <h2>My Availability</h2>

      {availability.length === 0 && (
        <p>No availability has been added yet.</p>
      )}


      {availability.map((block) => (
        <div key={block.id}>

          <p>
            Date: {block.date.slice(0, 10)}
          </p>

          <p>
            Start: {block.start_time}
          </p>

          <p>
            End: {block.end_time}
          </p>


          <button
            type="button"
            onClick={() =>
              handleEdit(block)
            }
          >
            Edit
          </button>


          <button
            type="button"
            onClick={() =>
              handleDelete(block.id)
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

export default ManageAvailabilityPage;