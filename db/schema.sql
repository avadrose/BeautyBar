DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('client', 'provider', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE providers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  business_name VARCHAR(100) NOT NULL,
  bio TEXT,
  location VARCHAR(255),

  verification_status VARCHAR(20) DEFAULT 'pending'
    CHECK (
      verification_status IN (
        'pending',
        'verified',
        'rejected',
        'suspended'
      )
    ),

  verification_notes TEXT,

  verified_by INTEGER
    REFERENCES users(id),

  verified_at TIMESTAMP
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,

  provider_id INTEGER NOT NULL
    REFERENCES providers(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,

  price NUMERIC(10, 2) NOT NULL
    CHECK (price >= 0),

  duration INTEGER NOT NULL
    CHECK (duration > 0)
);

CREATE TABLE availability (
  id SERIAL PRIMARY KEY,

  provider_id INTEGER NOT NULL
    REFERENCES providers(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  CHECK (start_time < end_time)
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,

  client_id INTEGER NOT NULL
    REFERENCES users(id),

  provider_id INTEGER NOT NULL
    REFERENCES providers(id),

  service_id INTEGER NOT NULL
    REFERENCES services(id),

  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,

  status VARCHAR(20) DEFAULT 'scheduled'
    CHECK (
      status IN (
        'scheduled',
        'completed',
        'cancelled',
        'rescheduled'
      )
    ),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,

  client_id INTEGER NOT NULL
    REFERENCES users(id),

  provider_id INTEGER NOT NULL
    REFERENCES providers(id),

  rating INTEGER NOT NULL
    CHECK (rating BETWEEN 1 AND 5),

  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,

  client_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  provider_id INTEGER NOT NULL
    REFERENCES providers(id) ON DELETE CASCADE,

  UNIQUE (client_id, provider_id)
);