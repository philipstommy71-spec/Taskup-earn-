const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

// This creates a local database file called database.db automatically
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('Connected to local SQLite database successfully!');
        
        // This automatically builds your users table with your exact rules
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
                status TEXT DEFAULT 'inactive',
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.run(createTableQuery, (tableErr) => {
            if (tableErr) console.log('Table error:', tableErr.message);
            else console.log('Users table ready!');
        });
    }
});

app.post('/api/register', async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (name, username, email, password, wallet_balance, status) VALUES (?, ?, ?, ?, 0.00, 'inactive')`;
        
        db.run(query, [name, username, email, hashedPassword], function(err) {
            if (err) return res.status(400).json({ success: false, message: "Username or email already taken." });
            res.json({ success: true, message: "Account created! Starts Inactive with ₦0 balance." });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/', (req, res) => {
    res.send('Taskup-earn backend is live and running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
