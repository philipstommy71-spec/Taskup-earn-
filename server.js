const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

const db = mysql.createConnection('mysql://root:CONHAGKVISSgaSpLgfGzJcYdkvefLLzb@mysql.railway.internal:3306/railway');


db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL successfully!');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
                status ENUM('inactive', 'active') DEFAULT 'inactive',
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.query(createTableQuery, (tableErr) => {
            if (tableErr) console.log('Table error:', tableErr);
            else console.log('Users table ready!');
        });
    }
});

app.post('/api/register', async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (name, username, email, password, wallet_balance, status) VALUES (?, ?, ?, ?, 0.00, 'inactive')`;
        
        db.query(query, [name, username, email, hashedPassword], (err) => {
            if (err) return res.status(400).json({ success: false, message: "Username or email already taken." });
            res.json({ success: true, message: "Account created! Starts Inactive with ₦0 balance." });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
