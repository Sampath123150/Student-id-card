const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDB } = require('./db');
const studentRoutes = require('./routes/studentRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload and backup directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const backupsDir = path.join(__dirname, '../backups');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/students', studentRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all to serve React app
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await initializeDB();
});
