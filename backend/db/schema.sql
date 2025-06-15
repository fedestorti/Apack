-- schema.sql
-- =========================
-- Papelera Apack  –  Esquema de BD
-- =========================

-- Tabla: usuarios ------------
CREATE TABLE IF NOT EXISTS usuarios (
  id           SERIAL PRIMARY KEY,                 -- autoincremental
  nombre       TEXT      NOT NULL,
  apellido     TEXT      NOT NULL,
  email        TEXT      NOT NULL UNIQUE,
  contraseña   TEXT      NOT NULL                  -- hash bcrypt/argon2
);

-- Tabla: productos ----------
CREATE TABLE IF NOT EXISTS productos (
  id               SERIAL PRIMARY KEY,
  codigo_producto  TEXT      NOT NULL UNIQUE,
  nombre_producto  TEXT      NOT NULL,
  precio           NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
  imagen           TEXT,                          -- nombre en /imagenesProductos
  fecha_registro   TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
