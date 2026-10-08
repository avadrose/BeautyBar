// ClientDashboard.jsx
// Shows the logged-in client's appointments
// and lets the client cancel or reschedule them.

import { useEffect, useState } from "react";
import axios from "axios";

function ClientDashboard() {
  // Stores appointments returned by the backend.
  const [appointments, setAppointments] = useState([]);

  // Tracks loading state.
  const [loading, setLoading] = useState(true);

  // Stores an error message if a request fails.
  const [error, setError] = useState("");

  // Tracks which appointment is currently being rescheduled.
  const [rescheduleId, setRescheduleId] = useState(null);

  // Stores the new date/time for rescheduling.
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");


  // ======================================
  // FETCH CLIENT APPOINTMENTS
  // ======================================

  async function fetchAppointments() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3001/api/appointments/mine",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments(response.data);
      setError("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to load appointments."
      );

    } finally {
      setLoading(false);
    }
  }


  // Load appointments when page first opens.
  useEffect(() => {
    fetchAppointments();
  }, []);


  // ======================================
  // CANCEL APPOINTMENT
  // ======================================

  async function handleCancel(appointmentId) {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reload appointments so the updated
      // status appears immediately.
      await fetchAppointments();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to cancel appointment."
      );
    }
  }


  // ======================================
  // OPEN RESCHEDULE FORM
  // ======================================

  function startReschedule(appointment) {
    // Remember which appointment is being edited.
    setRescheduleId(appointment.id);

    // Start the form with the appointment's
    // current date and time.
    setNewDate(
      appointment.appointment_date.slice(0, 10)
    );

    setNewTime(
      appointment.appointment_time.slice(0, 5)
    );
  }


  // ======================================
  // RESCHEDULE APPOINTMENT
  // ======================================

  async function handleReschedule(appointmentId) {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/appointments/${appointmentId}/reschedule`,
        {
          appointment_date: newDate,
          appointment_time: newTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Close the reschedule form.
      setRescheduleId(null);
      setNewDate("");
      setNewTime("");

      // Reload appointments with the new date/time.
      await fetchAppointments();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to reschedule appointment."
      );
    }
  }


  if (loading) {
    return <p>Loading appointments...</p>;
  }


  return (
    <div>
      <h1>My Appointments</h1>

      {error && (
        <p>{error}</p>
      )}

      {/* Message shown if client has no appointments */}
      {appointments.length === 0 && (
        <p>You do not have any appointments yet.</p>
      )}


      {appointments.map((appointment) => (
        <div key={appointment.id}>

          <h2>{appointment.service_name}</h2>

          <p>
            Provider: {appointment.business_name}
          </p>

          <p>
            Location: {appointment.location}
          </p>

          <p>
            Date: {appointment.appointment_date}
          </p>

          <p>
            Time: {appointment.appointment_time}
          </p>

          <p>
            Duration: {appointment.duration} minutes
          </p>

          <p>
            Price: ${appointment.price}
          </p>

          <p>
            Status: {appointment.status}
          </p>


          {/* Only scheduled appointments can be changed */}
          {appointment.status === "scheduled" && (
            <div>

              <button
                type="button"
                onClick={() =>
                  handleCancel(appointment.id)
                }
              >
                Cancel Appointment
              </button>


              <button
                type="button"
                onClick={() =>
                  startReschedule(appointment)
                }
              >
                Reschedule
              </button>

            </div>
          )}


          {/* Show reschedule form only for the
              appointment currently being edited */}
          {rescheduleId === appointment.id && (
            <div>

              <h3>Choose a New Time</h3>

              <div>
                <label>
                  Date
                </label>

                <input
                  type="date"
                  value={newDate}
                  onChange={(event) =>
                    setNewDate(event.target.value)
                  }
                />
              </div>


              <div>
                <label>
                  Time
                </label>

                <input
                  type="time"
                  value={newTime}
                  onChange={(event) =>
                    setNewTime(event.target.value)
                  }
                />
              </div>


              <button
                type="button"
                onClick={() =>
                  handleReschedule(appointment.id)
                }
              >
                Save New Appointment
              </button>


              <button
                type="button"
                onClick={() =>
                  setRescheduleId(null)
                }
              >
                Never Mind
              </button>

            </div>
          )}

          <hr />

        </div>
      ))}
    </div>
  );
}

export default ClientDashboard;