// AdminDashboard.jsx
// Lets an admin:
// - view all user accounts
// - view all provider accounts
// - verify, reject, or suspend providers
// - deactivate and reactivate users

import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  // Stores all users returned from the backend.
  const [users, setUsers] = useState([]);

  // Stores all provider profiles.
  const [providers, setProviders] = useState([]);

  // Tracks page loading.
  const [loading, setLoading] = useState(true);

  // Stores an error message if a request fails.
  const [error, setError] = useState("");


  // ======================================
  // HELPER: AUTH HEADERS
  // ======================================
  // Admin routes require the JWT token.

  function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  }


  // ======================================
  // LOAD ADMIN DATA
  // ======================================

  async function fetchAdminData() {
    try {
      setLoading(true);

      // Load users and providers at the same time.
      const [usersResponse, providersResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:3001/api/admin/users",
            {
              headers: getAuthHeaders(),
            }
          ),

          axios.get(
            "http://localhost:3001/api/admin/providers",
            {
              headers: getAuthHeaders(),
            }
          ),
        ]);

      setUsers(usersResponse.data);
      setProviders(providersResponse.data);

      setError("");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to load admin data."
      );

    } finally {
      setLoading(false);
    }
  }


  // Load admin information when the page opens.
  useEffect(() => {
    fetchAdminData();
  }, []);


  // ======================================
  // VERIFY PROVIDER
  // ======================================

  async function handleVerify(providerId) {
    try {
      await axios.patch(
        `http://localhost:3001/api/admin/providers/${providerId}/verify`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      // Refresh data so status changes immediately.
      await fetchAdminData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to verify provider."
      );
    }
  }


  // ======================================
  // REJECT PROVIDER
  // ======================================

  async function handleReject(providerId) {
    // Ask the admin for a reason.
    const notes = window.prompt(
      "Why are you rejecting this provider?"
    );

    // If Cancel was clicked, do nothing.
    if (notes === null) {
      return;
    }

    try {
      await axios.patch(
        `http://localhost:3001/api/admin/providers/${providerId}/reject`,
        {
          notes,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      await fetchAdminData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to reject provider."
      );
    }
  }


  // ======================================
  // SUSPEND PROVIDER
  // ======================================

  async function handleSuspend(providerId) {
    const notes = window.prompt(
      "Why are you suspending this provider?"
    );

    if (notes === null) {
      return;
    }

    try {
      await axios.patch(
        `http://localhost:3001/api/admin/providers/${providerId}/suspend`,
        {
          notes,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      await fetchAdminData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to suspend provider."
      );
    }
  }


  // ======================================
  // DEACTIVATE USER
  // ======================================

  async function handleDeactivate(userId) {
    try {
      await axios.patch(
        `http://localhost:3001/api/admin/users/${userId}/deactivate`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      await fetchAdminData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to deactivate user."
      );
    }
  }


  // ======================================
  // REACTIVATE USER
  // ======================================

  async function handleReactivate(userId) {
    try {
      await axios.patch(
        `http://localhost:3001/api/admin/users/${userId}/reactivate`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      await fetchAdminData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to reactivate user."
      );
    }
  }


  if (loading) {
    return <p>Loading admin dashboard...</p>;
  }


  return (
    <div>
      <h1>Admin Dashboard</h1>

      {error && (
        <p>{error}</p>
      )}


      {/* ======================================
          PROVIDER VERIFICATION
          ====================================== */}

      <section>
        <h2>Provider Accounts</h2>

        {providers.length === 0 && (
          <p>No providers found.</p>
        )}

        {providers.map((provider) => (
          <div key={provider.id}>

            <h3>
              {provider.business_name}
            </h3>

            <p>
              Name: {provider.first_name}{" "}
              {provider.last_name}
            </p>

            <p>
              Email: {provider.email}
            </p>

            <p>
              Location: {provider.location}
            </p>

            <p>
              Status:{" "}
              {provider.verification_status}
            </p>

            {provider.verification_notes && (
              <p>
                Notes:{" "}
                {provider.verification_notes}
              </p>
            )}


            {/* Pending/rejected/suspended providers
                can be approved. */}

            {provider.verification_status !==
              "verified" && (
              <button
                type="button"
                onClick={() =>
                  handleVerify(provider.id)
                }
              >
                Verify Provider
              </button>
            )}


            {/* Don't show Reject if already rejected. */}

            {provider.verification_status !==
              "rejected" && (
              <button
                type="button"
                onClick={() =>
                  handleReject(provider.id)
                }
              >
                Reject
              </button>
            )}


            {/* Verified providers can be suspended. */}

            {provider.verification_status ===
              "verified" && (
              <button
                type="button"
                onClick={() =>
                  handleSuspend(provider.id)
                }
              >
                Suspend
              </button>
            )}

            <hr />

          </div>
        ))}
      </section>


      {/* ======================================
          USER ACCOUNT MANAGEMENT
          ====================================== */}

      <section>
        <h2>User Accounts</h2>

        {users.length === 0 && (
          <p>No users found.</p>
        )}

        {users.map((user) => (
          <div key={user.id}>

            <h3>
              {user.first_name}{" "}
              {user.last_name}
            </h3>

            <p>
              Username: {user.username}
            </p>

            <p>
              Email: {user.email}
            </p>

            <p>
              Role: {user.role}
            </p>

            <p>
              Account:{" "}
              {user.is_active
                ? "Active"
                : "Inactive"}
            </p>


            {/* Admin accounts should generally not
                be deactivated from this basic UI. */}

            {user.role !== "admin" && (
              <>
                {user.is_active ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeactivate(user.id)
                    }
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleReactivate(user.id)
                    }
                  >
                    Reactivate Account
                  </button>
                )}
              </>
            )}

            <hr />

          </div>
        ))}
      </section>

    </div>
  );
}

export default AdminDashboard;