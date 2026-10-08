// Navbar.jsx
// Main navigation for BeautyBar.
//
// Links change based on:
// - whether the user is logged in
// - whether they are a client
// - provider
// - admin

import {
  Link,
  useNavigate,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();


  // ======================================
  // GET LOGGED-IN USER
  // ======================================

  const storedUser =
    localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;


  // ======================================
  // LOGOUT
  // ======================================

  function handleLogout() {
    // Remove authentication information.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Send the user back to login.
    navigate("/login");
  }


  return (
    <nav>

      {/* ======================================
          MAIN LINKS
          ====================================== */}

      <Link to="/">
        BeautyBar
      </Link>

      {" | "}

      <Link to="/providers">
        Providers
      </Link>


      {/* ======================================
          LOGGED-OUT LINKS
          ====================================== */}

      {!user && (
        <>
          {" | "}

          <Link to="/login">
            Login
          </Link>

          {" | "}

          <Link to="/register">
            Register
          </Link>
        </>
      )}


      {/* ======================================
          CLIENT NAVIGATION
          ====================================== */}

      {user?.role === "client" && (
        <>
          {" | "}

          <Link to="/client-dashboard">
            My Appointments
          </Link>

          {" | "}

          <Link to="/favorites">
            Favorites
          </Link>
        </>
      )}


      {/* ======================================
          PROVIDER NAVIGATION
          ====================================== */}

      {user?.role === "provider" && (
        <>
          {" | "}

          <Link to="/provider-dashboard">
            Provider Dashboard
          </Link>

          {" | "}

          <Link to="/provider-services">
            Manage Services
          </Link>

          {" | "}

          <Link to="/provider-availability">
            Manage Availability
          </Link>
        </>
      )}


      {/* ======================================
          ADMIN NAVIGATION
          ====================================== */}

      {user?.role === "admin" && (
        <>
          {" | "}

          <Link to="/admin">
            Admin Dashboard
          </Link>
        </>
      )}


      {/* ======================================
          LOGOUT
          ====================================== */}

      {user && (
        <>
          {" | "}

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      )}

    </nav>
  );
}

export default Navbar;