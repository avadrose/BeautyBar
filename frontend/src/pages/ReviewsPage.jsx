// ReviewsPage.jsx
//
// Allows clients to submit reviews.
//
// BeautyBar rules:
//
// - only clients can submit reviews
// - the client must have a completed
//   appointment with the provider
// - rating must be between 1 and 5
// - backend prevents duplicate provider
//   reviews from the same client

import {
  useEffect,
  useState,
} from "react";

import api from "../api";


function ReviewsPage() {
  // ======================================
  // COMPLETED APPOINTMENTS
  // ======================================

  const [
    appointments,
    setAppointments,
  ] = useState([]);


  // ======================================
  // REVIEW FORM STATE
  // ======================================

  const [
    providerId,
    setProviderId,
  ] = useState("");

  const [
    rating,
    setRating,
  ] = useState("5");

  const [
    comment,
    setComment,
  ] = useState("");


  // ======================================
  // PAGE STATE
  // ======================================

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  // ======================================
  // LOAD COMPLETED APPOINTMENTS
  // ======================================

  useEffect(() => {
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


        // Only completed appointments
        // are eligible for reviews.
        const completed =
          response.data.filter(
            (appointment) =>
              appointment.status ===
              "completed"
          );


        setAppointments(
          completed
        );

      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.error ||
          "Unable to load completed appointments."
        );

      } finally {
        setLoading(false);
      }
    }


    fetchAppointments();

  }, []);


  // ======================================
  // SUBMIT REVIEW
  // ======================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");


    try {
      const token =
        localStorage.getItem("token");


      await api.post(
        "/api/reviews",
        {
          provider_id:
            Number(providerId),

          rating:
            Number(rating),

          comment,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      setMessage(
        "Review submitted successfully."
      );


      // Reset review form.
      setProviderId("");
      setRating("5");
      setComment("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to submit review."
      );
    }
  }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <p>
        Loading completed appointments...
      </p>
    );
  }


  return (
    <div>

      <h1>
        Leave a Review
      </h1>


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
          REVIEW FORM
          ================================== */}

      {appointments.length === 0 ? (
        <p>
          You need a completed appointment
          before you can review a provider.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
        >

          {/* ----------------------------
              PROVIDER
              ---------------------------- */}

          <div>

            <label htmlFor="review-provider">
              Provider
            </label>

            <select
              id="review-provider"
              value={providerId}
              onChange={(event) =>
                setProviderId(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select provider
              </option>


              {appointments.map(
                (appointment) => (
                  <option
                    key={
                      appointment.id
                    }
                    value={
                      appointment.provider_id
                    }
                  >
                    {appointment.business_name}
                  </option>
                )
              )}

            </select>

          </div>


          {/* ----------------------------
              RATING
              ---------------------------- */}

          <div>

            <label htmlFor="rating">
              Rating
            </label>

            <select
              id="rating"
              value={rating}
              onChange={(event) =>
                setRating(
                  event.target.value
                )
              }
              required
            >

              <option value="5">
                5 - Excellent
              </option>

              <option value="4">
                4 - Very Good
              </option>

              <option value="3">
                3 - Good
              </option>

              <option value="2">
                2 - Fair
              </option>

              <option value="1">
                1 - Poor
              </option>

            </select>

          </div>


          {/* ----------------------------
              COMMENT
              ---------------------------- */}

          <div>

            <label htmlFor="review-comment">
              Comment
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              rows="5"
            />

          </div>


          <button type="submit">
            Submit Review
          </button>

        </form>
      )}

    </div>
  );
}


export default ReviewsPage;