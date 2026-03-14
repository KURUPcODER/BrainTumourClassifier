const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const dbPath = path.resolve(__dirname, 'neuroscan.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.run(`CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            mri_image_path TEXT,
            scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            analysis_result TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Patients table ready.');
            }
        });
    }
});

module.exports = db;
