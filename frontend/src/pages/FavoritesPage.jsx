// FavoritesPage.jsx
//
// Displays providers saved by the logged-in client.
//
// Clients can:
// - view saved providers
// - open the provider profile
// - remove providers from favorites

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";


function FavoritesPage() {
  // ======================================
  // FAVORITES DATA
  // ======================================

  const [
    favorites,
    setFavorites,
  ] = useState([]);


  // ======================================
  // PAGE STATE
  // ======================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ======================================
  // LOAD FAVORITES
  // ======================================

  async function fetchFavorites() {
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


      setFavorites(
        response.data
      );

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

  async function removeFavorite(
    providerId
  ) {
    try {
      const token =
        localStorage.getItem("token");


      await api.delete(
        `/api/favorites/${providerId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      // Refresh the list after deletion.
      await fetchFavorites();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to remove favorite."
      );
    }
  }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <p>
        Loading favorites...
      </p>
    );
  }


  return (
    <div>

      <h1>
        Favorite Providers
      </h1>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ==================================
          FAVORITE PROVIDERS
          ================================== */}

      {favorites.length === 0 ? (
        <p>
          You have not saved any providers yet.
        </p>
      ) : (
        favorites.map(
          (favorite) => (
            <div
              key={
                favorite.favorite_id
              }
            >

              <h2>
                {favorite.business_name}
              </h2>

              <p>
                {favorite.location}
              </p>

              <p>
                {favorite.bio}
              </p>


              {/* Open provider profile. */}

              <Link
                to={
                  `/providers/${favorite.provider_id}`
                }
              >
                View Provider
              </Link>


              {/* Remove provider from favorites. */}

              <button
                type="button"
                onClick={() =>
                  removeFavorite(
                    favorite.provider_id
                  )
                }
              >
                Remove Favorite
              </button>


              <hr />

            </div>
          )
        )
      )}

    </div>
  );
}


export default FavoritesPage;