// ProviderDetailsPage.jsx
//
// Public provider profile page.
//
// This page:
// - loads provider details
// - loads provider availability
// - loads reviews
// - calculates average rating
// - lets clients favorite/unfavorite providers
// - generates valid appointment times
// - removes conflicting booked times
// - lets clients book appointments

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";


// ======================================
// TIME HELPERS
// ======================================

// Converts a time such as "10:30"
// into minutes after midnight.
//
// Example:
// 10:30 = 630 minutes.
function timeToMinutes(time) {
  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}


// Generates appointment start times
// inside an availability block.
//
// Example:
// availability = 9:00 AM - 5:00 PM
// service duration = 60 minutes
//
// Possible appointment starts:
// 9:00, 9:30, 10:00, etc.
function generateTimeSlots(
  startTime,
  endTime,
  duration
) {
  const slots = [];

  const startTotal =
    timeToMinutes(startTime);

  const endTotal =
    timeToMinutes(endTime);

  // Appointment choices appear
  // every 30 minutes.
  const interval = 30;

  for (
    let current = startTotal;
    current + duration <= endTotal;
    current += interval
  ) {
    const hours =
      Math.floor(current / 60);

    const minutes =
      current % 60;

    const formattedTime =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}`;

    slots.push(formattedTime);
  }

  return slots;
}


// Checks whether a proposed appointment
// overlaps an appointment that is already booked.
function hasTimeConflict(
  proposedTime,
  proposedDuration,
  bookedAppointments
) {
  const proposedStart =
    timeToMinutes(proposedTime);

  const proposedEnd =
    proposedStart + proposedDuration;

  return bookedAppointments.some(
    (appointment) => {
      const existingStart =
        timeToMinutes(
          appointment.appointment_time
        );

      const existingEnd =
        existingStart +
        appointment.duration;

      return (
        proposedStart < existingEnd &&
        proposedEnd > existingStart
      );
    }
  );
}


// ======================================
// FORMAT TIME FOR DISPLAY
// ======================================

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time
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
// MAIN COMPONENT
// ======================================

function ProviderDetailsPage() {
  // Provider ID comes from the URL.
  // Example: /providers/1
  const { id } = useParams();


  // ======================================
  // PROVIDER DATA
  // ======================================

  const [provider, setProvider] =
    useState(null);

  const [availability, setAvailability] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [
    bookedAppointments,
    setBookedAppointments,
  ] = useState([]);


  // ======================================
  // BOOKING FORM STATE
  // ======================================

  const [
    selectedService,
    setSelectedService,
  ] = useState("");

  const [
    selectedAvailabilityId,
    setSelectedAvailabilityId,
  ] = useState("");

  const [
    appointmentDate,
    setAppointmentDate,
  ] = useState("");

  const [
    appointmentTime,
    setAppointmentTime,
  ] = useState("");


  // ======================================
  // FAVORITES STATE
  // ======================================

  const [
    isFavorite,
    setIsFavorite,
  ] = useState(false);

  const [
    favoriteError,
    setFavoriteError,
  ] = useState("");


  // ======================================
  // PAGE MESSAGE STATE
  // ======================================

  const [
    bookingMessage,
    setBookingMessage,
  ] = useState("");

  const [
    bookingError,
    setBookingError,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ======================================
  // LOGGED-IN USER
  // ======================================

  const storedUser =
    localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;


  // ======================================
  // SELECTED DATA OBJECTS
  // ======================================

  const selectedAvailability =
    availability.find(
      (block) =>
        String(block.id) ===
        selectedAvailabilityId
    );

  const selectedServiceObject =
    provider?.services.find(
      (service) =>
        String(service.id) ===
        selectedService
    );


  // ======================================
  // GENERATE AVAILABLE APPOINTMENT TIMES
  // ======================================

  const generatedTimeSlots =
    selectedAvailability &&
    selectedServiceObject
      ? generateTimeSlots(
          selectedAvailability.start_time,
          selectedAvailability.end_time,
          selectedServiceObject.duration
        )
      : [];


  const availableTimeSlots =
    selectedServiceObject
      ? generatedTimeSlots.filter(
          (time) =>
            !hasTimeConflict(
              time,
              selectedServiceObject.duration,
              bookedAppointments
            )
        )
      : [];


  // ======================================
  // AVERAGE RATING
  // ======================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : null;


  // ======================================
  // LOAD PROVIDER INFORMATION
  // ======================================

  useEffect(() => {
    async function fetchProviderData() {
      try {
        // Provider profile + services
        const providerResponse =
          await api.get(
            `/api/providers/${id}`
          );

        setProvider(
          providerResponse.data
        );


        // Availability
        const availabilityResponse =
          await api.get(
            `/api/providers/${id}/availability`
          );

        setAvailability(
          availabilityResponse.data
        );


        // Reviews
        const reviewsResponse =
          await api.get(
            `/api/reviews/provider/${id}`
          );

        setReviews(
          reviewsResponse.data
        );

      } catch (err) {
        console.error(err);

        setError(
          "Unable to load provider."
        );

      } finally {
        setLoading(false);
      }
    }

    fetchProviderData();

  }, [id]);


  // ======================================
  // CHECK FAVORITE STATUS
  // ======================================

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (user?.role !== "client") {
        return;
      }

      try {
        const token =
          localStorage.getItem("token");

        const response =
          await api.get(
            "/api/favorites",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const found =
          response.data.some(
            (favorite) =>
              Number(
                favorite.provider_id
              ) === Number(id)
          );

        setIsFavorite(found);

      } catch (err) {
        console.error(err);
      }
    }

    checkFavoriteStatus();

  }, [id, user?.role]);


  // ======================================
  // LOAD ALREADY-BOOKED TIMES
  // ======================================

  useEffect(() => {
    async function fetchBookedAppointments() {
      if (!appointmentDate) {
        setBookedAppointments([]);
        return;
      }

      try {
        const response =
          await api.get(
            `/api/providers/${id}/booked`,
            {
              params: {
                date: appointmentDate,
              },
            }
          );

        setBookedAppointments(
          response.data
        );

      } catch (err) {
        console.error(err);

        setBookedAppointments([]);
      }
    }

    fetchBookedAppointments();

  }, [id, appointmentDate]);


  // ======================================
  // FAVORITES
  // ======================================

  async function addFavorite() {
    try {
      const token =
        localStorage.getItem("token");

      await api.post(
        `/api/favorites/${id}`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setIsFavorite(true);
      setFavoriteError("");

    } catch (err) {
      console.error(err);

      setFavoriteError(
        err.response?.data?.error ||
        "Unable to add provider to favorites."
      );
    }
  }


  async function removeFavorite() {
    try {
      const token =
        localStorage.getItem("token");

      await api.delete(
        `/api/favorites/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setIsFavorite(false);
      setFavoriteError("");

    } catch (err) {
      console.error(err);

      setFavoriteError(
        err.response?.data?.error ||
        "Unable to remove provider from favorites."
      );
    }
  }


  // ======================================
  // BOOK APPOINTMENT
  // ======================================

  async function handleBooking(event) {
    event.preventDefault();

    setBookingError("");
    setBookingMessage("");

    try {
      const token =
        localStorage.getItem("token");

      await api.post(
        "/api/appointments",
        {
          provider_id:
            Number(id),

          service_id:
            Number(selectedService),

          appointment_date:
            appointmentDate,

          appointment_time:
            appointmentTime,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setBookingMessage(
        "Appointment booked successfully!"
      );


      // Refresh booked appointments so the
      // newly occupied time disappears.
      try {
        const bookedResponse =
          await api.get(
            `/api/providers/${id}/booked`,
            {
              params: {
                date: appointmentDate,
              },
            }
          );

        setBookedAppointments(
          bookedResponse.data
        );

      } catch (refreshError) {
        console.error(
          refreshError
        );
      }


      // Reset form.
      setSelectedService("");
      setSelectedAvailabilityId("");
      setAppointmentDate("");
      setAppointmentTime("");

    } catch (err) {
      console.error(err);

      setBookingError(
        err.response?.data?.error ||
        "Unable to book appointment."
      );
    }
  }


  // ======================================
  // PAGE STATES
  // ======================================

  if (loading) {
    return (
      <div className="page-message">
        Loading provider...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-message">
        {error}
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="page-message">
        Provider not found.
      </div>
    );
  }


  return (
    <div className="provider-details-page">

      {/* ======================================
          PROVIDER PROFILE HEADER
          ====================================== */}

      <section className="provider-profile-hero">

        <div className="provider-profile-avatar">
          {provider.business_name
            ?.charAt(0)
            .toUpperCase()}
        </div>


        <div className="provider-profile-info">

          <p className="verified-label">
            Verified Provider
          </p>

          <h1>
            {provider.business_name}
          </h1>

          <p className="provider-profile-name">
            {provider.first_name}{" "}
            {provider.last_name}
          </p>

          <p className="provider-profile-location">
            {provider.location}
          </p>

          {provider.bio && (
            <p className="provider-profile-bio">
              {provider.bio}
            </p>
          )}


          {/* Rating */}

          <div className="provider-rating">

            {averageRating ? (
              <>
                <strong>
                  ★ {averageRating}
                </strong>

                <span>
                  {reviews.length} review
                  {reviews.length !== 1
                    ? "s"
                    : ""}
                </span>
              </>
            ) : (
              <span>
                No reviews yet
              </span>
            )}

          </div>


          {/* Favorite */}

          {user?.role === "client" && (
            <div>

              {isFavorite ? (
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={removeFavorite}
                >
                  Remove from Favorites
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addFavorite}
                >
                  Add to Favorites
                </button>
              )}

              {favoriteError && (
                <p className="error-message">
                  {favoriteError}
                </p>
              )}

            </div>
          )}

        </div>

      </section>


      {/* ======================================
          TWO-COLUMN PAGE LAYOUT
          ====================================== */}

      <div className="provider-details-layout">


        {/* ==================================
            LEFT COLUMN
            ================================== */}

        <div className="provider-details-main">


          {/* ==================================
              SERVICES
              ================================== */}

          <section className="details-card">

            <div className="section-heading">

              <p className="page-eyebrow">
                Service Menu
              </p>

              <h2>
                Services
              </h2>

            </div>


            {provider.services.length === 0 ? (
              <p>
                No services available.
              </p>
            ) : (
              <div className="details-service-list">

                {provider.services.map(
                  (service) => (
                    <div
                      className="details-service-item"
                      key={service.id}
                    >

                      <div>

                        <h3>
                          {service.name}
                        </h3>

                        {service.description && (
                          <p>
                            {service.description}
                          </p>
                        )}

                        <span className="service-duration">
                          {service.duration} minutes
                        </span>

                      </div>


                      <strong className="service-price">
                        ${service.price}
                      </strong>

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {/* ==================================
              AVAILABILITY
              ================================== */}

          <section className="details-card">

            <div className="section-heading">

              <p className="page-eyebrow">
                Schedule
              </p>

              <h2>
                Availability
              </h2>

            </div>


            {availability.length === 0 ? (
              <p>
                No availability has been
                posted yet.
              </p>
            ) : (
              <div className="availability-list">

                {availability.map(
                  (block) => (
                    <div
                      className="availability-row"
                      key={block.id}
                    >

                      <strong>
                        {new Date(
                          `${block.date.slice(
                            0,
                            10
                          )}T00:00:00`
                        ).toLocaleDateString(
                          [],
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          block.start_time
                        )}

                        {" - "}

                        {formatTime(
                          block.end_time
                        )}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {/* ==================================
              REVIEWS
              ================================== */}

          <section className="details-card">

            <div className="section-heading">

              <p className="page-eyebrow">
                Client Feedback
              </p>

              <h2>
                Reviews
              </h2>

            </div>


            {reviews.length === 0 ? (
              <p>
                This provider does not have
                any reviews yet.
              </p>
            ) : (
              <div className="review-list">

                {reviews.map(
                  (review) => (
                    <article
                      className="review-card"
                      key={review.id}
                    >

                      <div className="review-rating">
                        {"★".repeat(
                          Number(
                            review.rating
                          )
                        )}
                      </div>

                      {review.comment && (
                        <p>
                          {review.comment}
                        </p>
                      )}

                      <small>
                        {review.first_name}{" "}
                        {review.last_name}
                      </small>

                    </article>
                  )
                )}

              </div>
            )}

          </section>

        </div>


        {/* ==================================
            RIGHT COLUMN / BOOKING PANEL
            ================================== */}

        <aside className="booking-sidebar">

          <div className="booking-card">

            <p className="page-eyebrow">
              Schedule Your Visit
            </p>

            <h2>
              Book Appointment
            </h2>


            {/* Success message */}

            {bookingMessage && (
              <div className="success-message">
                {bookingMessage}
              </div>
            )}


            {/* Error message */}

            {bookingError && (
              <div className="error-message">
                {bookingError}
              </div>
            )}


            {/* Only clients can book */}

            {user?.role === "client" ? (
              <form
                className="booking-form"
                onSubmit={handleBooking}
              >

                {/* SERVICE */}

                <div>
                  <label htmlFor="service">
                    Service
                  </label>

                  <select
                    id="service"

                    value={
                      selectedService
                    }

                    onChange={(event) => {
                      setSelectedService(
                        event.target.value
                      );

                      setAppointmentTime("");
                    }}

                    required
                  >

                    <option value="">
                      Select a service
                    </option>

                    {provider.services.map(
                      (service) => (
                        <option
                          key={service.id}
                          value={service.id}
                        >
                          {service.name}
                          {" - $"}
                          {service.price}
                          {" - "}
                          {service.duration}
                          {" min"}
                        </option>
                      )
                    )}

                  </select>
                </div>


                {/* DATE / AVAILABILITY */}

                <div>
                  <label
                    htmlFor="availability-block"
                  >
                    Date
                  </label>

                  <select
                    id="availability-block"

                    value={
                      selectedAvailabilityId
                    }

                    onChange={(event) => {
                      const availabilityId =
                        event.target.value;

                      setSelectedAvailabilityId(
                        availabilityId
                      );

                      const selectedBlock =
                        availability.find(
                          (block) =>
                            String(
                              block.id
                            ) ===
                            availabilityId
                        );

                      if (selectedBlock) {
                        setAppointmentDate(
                          selectedBlock.date.slice(
                            0,
                            10
                          )
                        );

                        setAppointmentTime("");
                      } else {
                        setAppointmentDate("");
                        setAppointmentTime("");
                      }
                    }}

                    required
                  >

                    <option value="">
                      Select a date
                    </option>

                    {availability.map(
                      (block) => (
                        <option
                          key={block.id}
                          value={block.id}
                        >
                          {block.date.slice(
                            0,
                            10
                          )}

                          {" | "}

                          {formatTime(
                            block.start_time
                          )}

                          {" - "}

                          {formatTime(
                            block.end_time
                          )}
                        </option>
                      )
                    )}

                  </select>
                </div>


                {/* TIME */}

                <div>
                  <label
                    htmlFor="appointment-time"
                  >
                    Time
                  </label>

                  <select
                    id="appointment-time"

                    value={
                      appointmentTime
                    }

                    onChange={(event) =>
                      setAppointmentTime(
                        event.target.value
                      )
                    }

                    disabled={
                      !selectedAvailability ||
                      !selectedServiceObject
                    }

                    required
                  >

                    <option value="">
                      Select a time
                    </option>

                    {availableTimeSlots.map(
                      (time) => (
                        <option
                          key={time}
                          value={time}
                        >
                          {formatTime(time)}
                        </option>
                      )
                    )}

                  </select>
                </div>


                {/* NO AVAILABLE TIMES */}

                {selectedAvailability &&
                  selectedServiceObject &&
                  availableTimeSlots.length === 0 && (
                    <p className="booking-note">
                      No times are available for
                      this service during the
                      selected block.
                    </p>
                  )}


                {/* BOOK BUTTON */}

                <button
                  type="submit"
                  className="booking-submit-button"

                  disabled={
                    !selectedService ||
                    !selectedAvailabilityId ||
                    !appointmentTime
                  }
                >
                  Book Appointment
                </button>

              </form>
            ) : user ? (
              <p className="booking-note">
                Booking is available from
                client accounts.
              </p>
            ) : (
              <p className="booking-note">
                Log in as a client to book
                an appointment.
              </p>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}

export default ProviderDetailsPage;