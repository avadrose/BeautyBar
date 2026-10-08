// ReviewsPage.jsx
// Lets a logged-in client:
// - see providers from completed appointments
// - submit a review
// - see their existing reviews if needed later

import { useEffect, useState } from "react";
import axios from "axios";

function ReviewsPage() {
  // Completed appointments that are eligible for review.
  const [appointments, setAppointments] = useState([]);

  // Form state.
  const [providerId, setProviderId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  // Feedback state.
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);


  // ======================================
  // LOAD CLIENT APPOINTMENTS
  // ======================================

  useEffect(() => {
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

        // Only completed appointments can be reviewed.
        const completedAppointments =
          response.data.filter(
            (appointment) =>
              appointment.status === "completed"
          );

        setAppointments(completedAppointments);

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

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3001/api/reviews",
        {
          provider_id: Number(providerId),
          rating: Number(rating),
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Review submitted successfully!"
      );

      // Clear form after success.
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


  if (loading) {
    return <p>Loading review options...</p>;
  }


  return (
    <div>
      <h1>Leave a Review</h1>

      {message && (
        <p>{message}</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {appointments.length === 0 ? (
        <p>
          You do not have any completed appointments
          available to review yet.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>

          {/* ==================================
              PROVIDER SELECTION
              ================================== */}

          <div>
            <label htmlFor="provider">
              Provider
            </label>

            <select
              id="provider"
              value={providerId}
              onChange={(event) =>
                setProviderId(event.target.value)
              }
              required
            >
              <option value="">
                Select provider
              </option>

              {appointments.map((appointment) => (
                <option
                  key={appointment.id}
                  value={appointment.provider_id}
                >
                  {appointment.business_name}
                  {" - "}
                  {appointment.service_name}
                </option>
              ))}
            </select>
          </div>


          {/* ==================================
              RATING
              ================================== */}

          <div>
            <label htmlFor="rating">
              Rating
            </label>

            <select
              id="rating"
              value={rating}
              onChange={(event) =>
                setRating(event.target.value)
              }
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>


          {/* ==================================
              COMMENT
              ================================== */}

          <div>
            <label htmlFor="review-comment">
              Comment
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              rows="5"
              placeholder="Tell others about your experience."
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