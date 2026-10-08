// ProviderDashboard.jsx
// Shows appointments booked with the logged-in provider
// and lets the provider mark them completed or cancelled.

import { useEffect, useState } from "react";
import axios from "axios";

function ProviderDashboard() {
  // Stores appointments returned by the backend.
  const [appointments, setAppointments] = useState([]);

  // Tracks loading and error states.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ======================================
  // FETCH PROVIDER APPOINTMENTS
  // ======================================

  async function fetchAppointments() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3001/api/appointments/provider/mine",
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
        "Unable to load provider appointments."
      );

    } finally {
      setLoading(false);
    }
  }


  // Load appointments when dashboard opens.
  useEffect(() => {
    fetchAppointments();
  }, []);


  // ======================================
  // UPDATE APPOINTMENT STATUS
  // ======================================

  async function updateStatus(appointmentId, status) {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/appointments/${appointmentId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh list after updating.
      await fetchAppointments();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to update appointment status."
      );
    }
  }


  if (loading) {
    return <p>Loading appointments...</p>;
  }


  return (
    <div>
      <h1>Provider Dashboard</h1>

      {error && (
        <p>{error}</p>
      )}

      {appointments.length === 0 && (
        <p>No appointments have been booked yet.</p>
      )}


      {appointments.map((appointment) => (
        <div key={appointment.id}>

          <h2>{appointment.service_name}</h2>

          <p>
            Client: {appointment.first_name} {appointment.last_name}
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
            Status: {appointment.status}
          </p>


          {/* Only scheduled appointments need action buttons */}
          {appointment.status === "scheduled" && (
            <div>

              <button
                type="button"
                onClick={() =>
                  updateStatus(
                    appointment.id,
                    "completed"
                  )
                }
              >
                Mark Completed
              </button>


              <button
                type="button"
                onClick={() =>
                  updateStatus(
                    appointment.id,
                    "cancelled"
                  )
                }
              >
                Cancel Appointment
              </button>

            </div>
          )}

          <hr />

        </div>
      ))}
    </div>
  );
}

export default ProviderDashboard;