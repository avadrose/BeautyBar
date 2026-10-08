// AdminDashboard.jsx
//
// Admin management page.
//
// Admins can:
// - view all users
// - view provider verification status
// - verify providers
// - reject providers
// - suspend providers
// - deactivate/reactivate user accounts

import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  // ======================================
  // DATA
  // ======================================

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);

  // ======================================
  // PAGE STATE
  // ======================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // ======================================
  // LOAD ADMIN DATA
  // ======================================

  async function fetchAdminData() {
    try {
      const token = localStorage.getItem("token");

      const [
        usersResponse,
        providersResponse,
      ] = await Promise.all([
        axios.get(
          "http://localhost:3001/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        axios.get(
          "http://localhost:3001/api/admin/providers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
        "Unable to load admin dashboard."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchAdminData();
  }, []);


  // ======================================
  // VERIFY PROVIDER
  // ======================================

  async function verifyProvider(providerId) {
    try {
      const token =
        localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/admin/providers/${providerId}/verify`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Provider verified successfully."
      );

      setError("");

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

  async function rejectProvider(providerId) {
    const notes = window.prompt(
      "Why is this provider being rejected?"
    );

    // If admin presses Cancel, stop here.
    if (notes === null) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/admin/providers/${providerId}/reject`,
        {
          notes,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Provider rejected successfully."
      );

      setError("");

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

  async function suspendProvider(providerId) {
    const notes = window.prompt(
      "Why is this provider being suspended?"
    );

    if (notes === null) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/admin/providers/${providerId}/suspend`,
        {
          notes,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Provider suspended successfully."
      );

      setError("");

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

  async function deactivateUser(userId) {
    try {
      const token =
        localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/admin/users/${userId}/deactivate`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "User account deactivated."
      );

      setError("");

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

  async function reactivateUser(userId) {
    try {
      const token =
        localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3001/api/admin/users/${userId}/reactivate`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "User account reactivated."
      );

      setError("");

      await fetchAdminData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Unable to reactivate user."
      );
    }
  }


  // ======================================
  // LOADING STATE
  // ======================================

  if (loading) {
    return (
      <div className="page-message">
        Loading admin dashboard...
      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <div className="dashboard-header">

        <p className="page-eyebrow">
          Administration
        </p>

        <h1>
          Admin Dashboard
        </h1>

        <p>
          Manage BeautyBar users and provider
          verification.
        </p>

      </div>


      {/* ======================================
          MESSAGES
          ====================================== */}

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


      {/* ======================================
          PROVIDER MANAGEMENT
          ====================================== */}

      <section className="management-card">

        <h2>
          Provider Verification
        </h2>


        {providers.length === 0 ? (
          <p>
            No provider accounts found.
          </p>
        ) : (
          <div className="admin-list">

            {providers.map(
              (provider) => (
                <article
                  className="admin-item"
                  key={provider.id}
                >

                  <div className="admin-item-info">

                    <h3>
                      {provider.business_name}
                    </h3>

                    <p>
                      {provider.first_name}{" "}
                      {provider.last_name}
                    </p>

                    <p>
                      {provider.email}
                    </p>

                    <p>
                      {provider.location}
                    </p>

                    <span
                      className={
                        `verification-badge verification-${provider.verification_status}`
                      }
                    >
                      {provider.verification_status}
                    </span>

                    {provider.verification_notes && (
                      <p className="admin-notes">
                        Notes:{" "}
                        {provider.verification_notes}
                      </p>
                    )}

                  </div>


                  <div className="admin-actions">

                    {provider.verification_status !==
                      "verified" && (
                      <button
                        type="button"
                        onClick={() =>
                          verifyProvider(
                            provider.id
                          )
                        }
                      >
                        Verify
                      </button>
                    )}


                    <button
                      type="button"
                      className="secondary-action-button"
                      onClick={() =>
                        rejectProvider(
                          provider.id
                        )
                      }
                    >
                      Reject
                    </button>


                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        suspendProvider(
                          provider.id
                        )
                      }
                    >
                      Suspend
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>


      {/* ======================================
          USER MANAGEMENT
          ====================================== */}

      <section className="management-card">

        <h2>
          User Accounts
        </h2>


        {users.length === 0 ? (
          <p>
            No users found.
          </p>
        ) : (
          <div className="admin-list">

            {users.map(
              (user) => (
                <article
                  className="admin-item"
                  key={user.id}
                >

                  <div className="admin-item-info">

                    <h3>
                      {user.first_name}{" "}
                      {user.last_name}
                    </h3>

                    <p>
                      @{user.username}
                    </p>

                    <p>
                      {user.email}
                    </p>

                    <p className="admin-role">
                      Role: {user.role}
                    </p>

                    <span
                      className={
                        user.is_active
                          ? "account-badge account-active"
                          : "account-badge account-inactive"
                      }
                    >
                      {user.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>


                  {/* Prevent admin accounts from
                      being changed here. */}

                  {user.role !== "admin" && (
                    <div className="admin-actions">

                      {user.is_active ? (
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            deactivateUser(
                              user.id
                            )
                          }
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            reactivateUser(
                              user.id
                            )
                          }
                        >
                          Reactivate
                        </button>
                      )}

                    </div>
                  )}

                </article>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default AdminDashboard;