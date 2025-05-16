CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (name,surname, Email,password )
    VALUES ('federico','STORTI', 'Fede@gmail.com','FEDE123'),
    ('federico','STORTI', 'Fede@gmail.com','FEDE123');

SELECT * FROM users;