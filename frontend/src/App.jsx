// App.jsx
// Main routing file for the BeautyBar frontend.
//
// This file:
// - sets up React Router
// - displays the Navbar on every page
// - protects client/provider/admin pages
// - keeps all page content inside one styled container

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


// ======================================
// SHARED COMPONENTS
// ======================================

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";


// ======================================
// PUBLIC PAGES
// ======================================

import ProvidersPage from "./pages/ProvidersPage";
import ProviderDetailsPage from "./pages/ProviderDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";


// ======================================
// CLIENT PAGES
// ======================================

import ClientDashboard from "./pages/ClientDashboard";
import FavoritesPage from "./pages/FavoritesPage";
import ReviewsPage from "./pages/ReviewsPage";


// ======================================
// PROVIDER PAGES
// ======================================

import ProviderDashboard from "./pages/ProviderDashboard";
import ManageServicesPage from "./pages/ManageServicesPage";
import ManageAvailabilityPage from "./pages/ManageAvailabilityPage";
import ProviderProfileSetupPage from "./pages/ProviderProfileSetupPage";


// ======================================
// ADMIN PAGES
// ======================================

import AdminDashboard from "./pages/AdminDashboard";


// ======================================
// MAIN APP
// ======================================

function App() {
  return (
    <BrowserRouter>

      {/* Navbar appears on every page */}
      <Navbar />


      {/* Main wrapper is styled in index.css */}
      <main className="page-container">

        <Routes>

          {/* ==================================
              PUBLIC ROUTES
              ================================== */}

          <Route
            path="/"
            element={<HomePage />}
          />


          <Route
            path="/login"
            element={<LoginPage />}
          />


          <Route
            path="/register"
            element={<RegisterPage />}
          />


          <Route
            path="/providers"
            element={<ProvidersPage />}
          />


          <Route
            path="/providers/:id"
            element={<ProviderDetailsPage />}
          />


          {/* ==================================
              CLIENT ROUTES
              ================================== */}

          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["client"]}
              >
                <ClientDashboard />
              </ProtectedRoute>
            }
          />


          <Route
            path="/favorites"
            element={
              <ProtectedRoute
                allowedRoles={["client"]}
              >
                <FavoritesPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/reviews"
            element={
              <ProtectedRoute
                allowedRoles={["client"]}
              >
                <ReviewsPage />
              </ProtectedRoute>
            }
          />


          {/* ==================================
              PROVIDER ROUTES
              ================================== */}

          <Route
            path="/provider-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["provider"]}
              >
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />


          <Route
            path="/provider-services"
            element={
              <ProtectedRoute
                allowedRoles={["provider"]}
              >
                <ManageServicesPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/provider-availability"
            element={
              <ProtectedRoute
                allowedRoles={["provider"]}
              >
                <ManageAvailabilityPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/provider-profile-setup"
            element={
              <ProtectedRoute
                allowedRoles={["provider"]}
              >
                <ProviderProfileSetupPage />
              </ProtectedRoute>
            }
          />


          {/* ==================================
              ADMIN ROUTE
              ================================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />


          {/* ==================================
              FALLBACK ROUTE
              ================================== */}

          <Route
            path="*"
            element={
              <div>
                <h1>
                  Page Not Found
                </h1>

                <p>
                  The page you are looking for
                  does not exist.
                </p>
              </div>
            }
          />

        </Routes>

      </main>

    </BrowserRouter>
  );
}

export default App;