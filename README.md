# BeautyBar

BeautyBar is a full-stack beauty appointment booking platform that allows clients to discover beauty professionals, browse services, manage appointments, save favorite providers, and leave reviews after completed services.

Beauty professionals can create and manage their profiles, services, pricing, availability, and appointments. Admin users can manage accounts and verify provider profiles before they become publicly bookable.

---

## Live Demo

Frontend:

https://beautybar.onrender.com

Backend API:

https://beautybar-api.onrender.com

---

## Features

### Clients

Clients can:

- Register and log in
- Browse verified beauty providers
- Search providers by name
- Filter providers by location
- Filter providers by service
- View provider profiles
- View provider services and pricing
- View provider availability
- Book appointments
- Cancel appointments
- Reschedule appointments
- Save favorite providers
- Remove providers from favorites
- View their appointment history
- Leave reviews after completed appointments

---

### Beauty Professionals

Providers can:

- Register as a beauty professional
- Create a provider profile
- Submit their profile for verification
- Manage business information
- Add services
- Edit services
- Delete services
- Set pricing
- Set service duration
- Add availability
- Edit availability
- Delete availability
- View client appointments
- Mark appointments as completed
- Cancel appointments

New provider profiles begin with a `pending` verification status.

Providers do not appear publicly until an administrator verifies the account.

---

### Administrators

Admins can:

- View all BeautyBar users
- View provider profiles
- Verify provider accounts
- Reject provider accounts
- Suspend provider accounts
- Add verification notes
- Deactivate users
- Reactivate users

---

## Provider Verification

BeautyBar uses a provider verification workflow.

Provider statuses include:

- `pending`
- `verified`
- `rejected`
- `suspended`

Only providers with a `verified` status are displayed publicly and available for client booking.

---

## Appointment Scheduling

BeautyBar prevents overlapping appointments.

The booking system checks:

- provider availability
- selected service duration
- appointment start time
- appointment end time
- existing scheduled appointments

An appointment can only be created if the full service duration fits inside the provider's availability block.

For example, a 90-minute service cannot be booked if only 60 minutes remain in the provider's available schedule.

---

## Reviews

Clients can only review providers after completing an appointment with them.

The application verifies that:

- the client had an appointment with the provider
- the appointment status is `completed`
- the rating is between 1 and 5

A client may only submit one review for each provider.

---

## Favorites

Clients can save providers to their favorites list.

Clients can:

- add a verified provider to favorites
- view saved providers
- remove providers from favorites
- quickly return to a saved provider's profile

---

## Technologies Used

### Frontend

- React
- Vite
- React Router
- Axios
- JavaScript
- CSS

### Backend

- Node.js
- Express
- PostgreSQL
- `pg`
- bcrypt
- JSON Web Tokens
- CORS
- dotenv

### Testing

- Jest
- Supertest

### Deployment

- Render Static Site
- Render Web Service
- Render PostgreSQL

---

## Authentication

BeautyBar uses JSON Web Tokens for authentication.

When a user logs in successfully:

1. The backend verifies the username and password.
2. bcrypt compares the submitted password with the stored password hash.
3. The backend creates a JWT containing the user's ID and role.
4. The frontend stores the token in `localStorage`.
5. Protected API requests send the token using the authorization header.

Example:

```text
Authorization: Bearer <token>


## Demo Accounts

These accounts are provided for testing the deployed application.

### Client
Username: client1  
Password: client123

### Provider
Username: beautybyava  
Password: provider123

### Admin
Username: beautyadmin  
Password: admin123

** These credentials are for demonstration purposes only and should not be used in a real production environment