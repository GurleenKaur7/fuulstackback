
import mysql from "mysql2/promise";

async function createTables() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "gbakshi21@0618",
        database: "new_sql"
    });

    try {
        // Drop table if exists
        await connection.execute(`DROP TABLE IF EXISTS final;`);
        console.log("Old 'final' table dropped (if existed)");

        // Create table fresh
        await connection.execute(`
            CREATE TABLE final (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                birth_year INT NOT NULL,
                gender VARCHAR(20) NOT NULL,
                designation VARCHAR(100) NOT NULL,
                company_name VARCHAR(150) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Final table created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        await connection.end();
    }
}

// Run the function
createTables();
