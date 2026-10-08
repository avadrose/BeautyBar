// FavoritesPage.jsx
// Shows all providers saved by the logged-in client.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function FavoritesPage() {
  // Stores the client's saved providers.
  const [favorites, setFavorites] = useState([]);

  // Tracks page loading.
  const [loading, setLoading] = useState(true);

  // Stores errors if loading fails.
  const [error, setError] = useState("");


  // ======================================
  // LOAD FAVORITES
  // ======================================

  async function fetchFavorites() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:3001/api/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFavorites(response.data);
      setError("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to load favorites."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchFavorites();
  }, []);


  // ======================================
  // REMOVE FAVORITE
  // ======================================

  async function handleRemove(providerId) {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3001/api/favorites/${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reload favorites after removing one.
      await fetchFavorites();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to remove favorite."
      );
    }
  }


  if (loading) {
    return <p>Loading favorites...</p>;
  }


  return (
    <div>
      <h1>My Favorites</h1>

      {error && (
        <p>{error}</p>
      )}

      {favorites.length === 0 && (
        <p>
          You haven't saved any providers yet.
        </p>
      )}


      {favorites.map((favorite) => (
        <div key={favorite.favorite_id}>

          <h2>
            {favorite.business_name}
          </h2>

          <p>
            {favorite.location}
          </p>

          <p>
            {favorite.bio}
          </p>

          <Link
            to={`/providers/${favorite.provider_id}`}
          >
            View Provider
          </Link>

          {" "}

          <button
            type="button"
            onClick={() =>
              handleRemove(
                favorite.provider_id
              )
            }
          >
            Remove
          </button>

          <hr />

        </div>
      ))}
    </div>
  );
}

export default FavoritesPage;