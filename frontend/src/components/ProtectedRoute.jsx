// ProtectedRoute.jsx
// Prevents users from accessing pages they are not authorized to view.

import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  // If no token/user exists, send user to login.
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles was provided, make sure the user's role matches.
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized.
  return children;
}

export default ProtectedRoute;