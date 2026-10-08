// ProviderDashboard.jsx
//
// Main appointment page for beauty professionals.
//
// Providers can:
// - view bookings
// - see client names
// - see service/date/time
// - mark an appointment completed
// - cancel an appointment

import {
  useEffect,
  useState,
} from "react";

import api from "../api";


function ProviderDashboard() {
  // ======================================
  // APPOINTMENT DATA
  // ======================================

  const [
    appointments,
    setAppointments,
  ] = useState([]);


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
  // LOAD PROVIDER APPOINTMENTS
  // ======================================

  async function fetchAppointments() {
    try {
      const token =
        localStorage.getItem("token");


      const response =
        await api.get(
          "/api/appointments/provider/mine",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setAppointments(
        response.data
      );

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


  useEffect(() => {
    fetchAppointments();
  }, []);


  // ======================================
  // UPDATE APPOINTMENT STATUS
  // ======================================

  async function updateAppointmentStatus(
    appointmentId,
    status
  ) {
    try {
      const token =
        localStorage.getItem("token");


      await api.patch(
        `/api/appointments/${appointmentId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      setMessage(
        `Appointment marked ${status}.`
      );

      setError("");


      // Refresh list so new status
      // appears immediately.
      await fetchAppointments();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to update appointment."
      );
    }
  }


  // ======================================
  // FORMAT TIME
  // ======================================

  function formatTime(time) {
    if (!time) {
      return "";
    }


    const [hours, minutes] =
      time
        .slice(0, 5)
        .split(":")
        .map(Number);


    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);


    return date.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }


  // ======================================
  // LOADING STATE
  // ======================================

  if (loading) {
    return (
      <div className="page-message">
        Loading appointments...
      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* ==================================
          HEADER
          ================================== */}

      <div className="dashboard-header">

        <p className="page-eyebrow">
          Provider Dashboard
        </p>

        <h1>
          Appointments
        </h1>

        <p>
          Review upcoming client bookings
          and update appointment statuses.
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
          APPOINTMENT LIST
          ================================== */}

      {appointments.length === 0 ? (
        <div className="dashboard-empty-state">

          <h2>
            No appointments yet
          </h2>

          <p>
            New client bookings will appear
            here once appointments are scheduled.
          </p>

        </div>
      ) : (
        <div className="appointment-card-list">

          {appointments.map(
            (appointment) => (
              <article
                className="appointment-card"
                key={appointment.id}
              >

                {/* --------------------------
                    CLIENT HEADER
                    -------------------------- */}

                <div className="appointment-card-header">

                  <div>

                    <p className="appointment-provider">
                      Client
                    </p>

                    <h2>
                      {appointment.client_first_name}{" "}
                      {appointment.client_last_name}
                    </h2>

                  </div>


                  <span
                    className={
                      `appointment-status status-${appointment.status}`
                    }
                  >
                    {appointment.status}
                  </span>

                </div>


                {/* --------------------------
                    APPOINTMENT DETAILS
                    -------------------------- */}

                <div className="appointment-details-grid">

                  <div>

                    <span className="detail-label">
                      Service
                    </span>

                    <strong>
                      {appointment.service_name}
                    </strong>

                  </div>


                  <div>

                    <span className="detail-label">
                      Date
                    </span>

                    <strong>
                      {appointment.appointment_date
                        .slice(0, 10)}
                    </strong>

                  </div>


                  <div>

                    <span className="detail-label">
                      Time
                    </span>

                    <strong>
                      {formatTime(
                        appointment.appointment_time
                      )}
                    </strong>

                  </div>


                  <div>

                    <span className="detail-label">
                      Duration
                    </span>

                    <strong>
                      {appointment.duration}
                      {" "}minutes
                    </strong>

                  </div>

                </div>


                {/* --------------------------
                    PROVIDER ACTIONS
                    -------------------------- */}

                {appointment.status ===
                  "scheduled" && (

                  <div className="provider-appointment-actions">

                    <button
                      type="button"
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment.id,
                          "completed"
                        )
                      }
                    >
                      Mark Completed
                    </button>


                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment.id,
                          "cancelled"
                        )
                      }
                    >
                      Cancel Appointment
                    </button>

                  </div>
                )}

              </article>
            )
          )}

        </div>
      )}

    </div>
  );
}


export default ProviderDashboard;