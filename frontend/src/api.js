// api.js
//
// This file creates one shared Axios instance
// for the entire BeautyBar frontend.
//
// Why we use this:
// - During local development, the backend runs
//   at http://localhost:3001.
// - After deployment, the backend will have a
//   Render URL instead.
// - By using VITE_API_URL, we do not need to
//   rewrite every frontend API request later.

import axios from "axios";


// ======================================
// API BASE URL
// ======================================
//
// Vite reads environment variables that begin
// with VITE_.
//
// Local frontend/.env:
//
// VITE_API_URL=http://localhost:3001
//
// Production will use the deployed backend URL.

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


// ======================================
// CREATE AXIOS INSTANCE
// ======================================
//
// Every request made with "api" automatically
// starts with API_URL.
//
// Example:
//
// api.get("/api/providers")
//
// becomes:
//
// http://localhost:3001/api/providers
//
// locally.

const api = axios.create({
  baseURL: API_URL,
});


export default api;