import pg from 'pg'

export const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    password: "Camaro123",
    database: "apack",
    port: 3000
})

