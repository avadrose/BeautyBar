// ClientDashboard.jsx
//
// Client appointment management page.
//
// Clients can:
// - view appointments
// - see provider/service details
// - cancel scheduled appointments
// - reschedule scheduled appointments

import {
  useEffect,
  useState,
} from "react";

import api from "../api";


function ClientDashboard() {
  // ======================================
  // APPOINTMENT DATA
  // ======================================

  const [
    appointments,
    setAppointments,
  ] = useState([]);


  // Stores separate reschedule form
  // values for each appointment ID.
  const [
    rescheduleData,
    setRescheduleData,
  ] = useState({});


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
  // LOAD CLIENT APPOINTMENTS
  // ======================================

  async function fetchAppointments() {
    try {
      const token =
        localStorage.getItem("token");


      const response =
        await api.get(
          "/api/appointments/mine",
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
        "Unable to load appointments."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchAppointments();
  }, []);


  // ======================================
  // CANCEL APPOINTMENT
  // ======================================

  async function cancelAppointment(
    appointmentId
  ) {
    try {
      const token =
        localStorage.getItem("token");


      await api.patch(
        `/api/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      setMessage(
        "Appointment cancelled successfully."
      );

      setError("");


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
  // UPDATE RESCHEDULE FORM
  // ======================================

  function handleRescheduleChange(
    appointmentId,
    field,
    value
  ) {
    setRescheduleData(
      (current) => ({
        ...current,

        [appointmentId]: {
          ...current[
            appointmentId
          ],

          [field]: value,
        },
      })
    );
  }


  // ======================================
  // RESCHEDULE APPOINTMENT
  // ======================================

  async function rescheduleAppointment(
    appointmentId
  ) {
    const data =
      rescheduleData[
        appointmentId
      ];


    // Both fields are required.
    if (
      !data?.appointment_date ||
      !data?.appointment_time
    ) {
      setError(
        "Please select a new date and time."
      );

      return;
    }


    try {
      const token =
        localStorage.getItem("token");


      await api.patch(
        `/api/appointments/${appointmentId}/reschedule`,
        {
          appointment_date:
            data.appointment_date,

          appointment_time:
            data.appointment_time,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      setMessage(
        "Appointment rescheduled successfully."
      );

      setError("");


      // Clear the form for this appointment.
      setRescheduleData(
        (current) => {
          const updated = {
            ...current,
          };

          delete updated[
            appointmentId
          ];

          return updated;
        }
      );


      await fetchAppointments();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to reschedule appointment."
      );
    }
  }


  // ======================================
  // FORMAT TIME FOR DISPLAY
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
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="page-message">
        Loading your appointments...
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
          My BeautyBar
        </p>

        <h1>
          My Appointments
        </h1>

        <p>
          View, manage, cancel, or reschedule
          your BeautyBar appointments.
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
            Browse BeautyBar providers and
            book your first appointment.
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
                    CARD HEADER
                    -------------------------- */}

                <div className="appointment-card-header">

                  <div>

                    <p className="appointment-provider">
                      {appointment.business_name}
                    </p>

                    <h2>
                      {appointment.service_name}
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


                  <div>

                    <span className="detail-label">
                      Price
                    </span>

                    <strong>
                      ${appointment.price}
                    </strong>

                  </div>


                  <div>

                    <span className="detail-label">
                      Location
                    </span>

                    <strong>
                      {appointment.location}
                    </strong>

                  </div>

                </div>


                {/* --------------------------
                    ACTIONS
                    -------------------------- */}

                {appointment.status ===
                  "scheduled" && (

                  <div className="appointment-actions">

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        cancelAppointment(
                          appointment.id
                        )
                      }
                    >
                      Cancel Appointment
                    </button>


                    {/* ------------------------
                        RESCHEDULE
                        ------------------------ */}

                    <div className="reschedule-panel">

                      <h3>
                        Reschedule
                      </h3>


                      <div className="reschedule-grid">

                        <div>

                          <label>
                            New Date
                          </label>

                          <input
                            type="date"
                            value={
                              rescheduleData[
                                appointment.id
                              ]?.appointment_date ||
                              ""
                            }
                            onChange={(event) =>
                              handleRescheduleChange(
                                appointment.id,
                                "appointment_date",
                                event.target.value
                              )
                            }
                          />

                        </div>


                        <div>

                          <label>
                            New Time
                          </label>

                          <input
                            type="time"
                            value={
                              rescheduleData[
                                appointment.id
                              ]?.appointment_time ||
                              ""
                            }
                            onChange={(event) =>
                              handleRescheduleChange(
                                appointment.id,
                                "appointment_time",
                                event.target.value
                              )
                            }
                          />

                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          rescheduleAppointment(
                            appointment.id
                          )
                        }
                      >
                        Save New Appointment
                      </button>

                    </div>

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


export default ClientDashboard;