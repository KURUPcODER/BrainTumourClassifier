const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API Endpoints

// 1. Upload MRI Scan (just the file)
app.post('/api/upload', upload.single('mri_scan'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    // In a real scenario, this is where you'd call your ML model script or API
    // For now, we return the path so the frontend can display it and save it with the patient
    const filePath = `/uploads/${req.file.filename}`;

    res.json({
        message: 'File uploaded successfully',
        filePath: filePath,
        filename: req.file.filename
    });
});

// 2. Save Patient Details
app.post('/api/patients', (req, res) => {
    const { name, age, gender, mri_image_path, analysis_result } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const sql = `INSERT INTO patients (name, age, gender, mri_image_path, analysis_result) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, age, gender, mri_image_path, analysis_result || 'Pending'];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error inserting patient', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
            message: 'Patient record created successfully',
            patientId: this.lastID
        });
    });
});

// 3. Get all patients (for history/reporting if needed)
app.get('/api/patients', (req, res) => {
    const sql = 'SELECT * FROM patients ORDER BY scan_date DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ patients: rows });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
