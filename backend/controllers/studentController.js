const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const copyFileAsync = promisify(fs.copyFile);
const unlinkAsync = promisify(fs.unlink);

const uploadsDir = path.join(__dirname, '../../uploads');
const backupsDir = path.join(__dirname, '../../backups');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadPhoto = upload.single('photo');

// Create a new student profile
const createStudent = async (req, res) => {
    try {
        const { name, roll_no, class_name, department, institution_type } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Photo is required." });
        }

        const photo_url = `/uploads/${req.file.filename}`;

        const newStudent = await pool.query(
            `INSERT INTO students (name, roll_no, class_name, department, institution_type, photo_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, roll_no, class_name, department, institution_type, photo_url]
        );

        res.status(201).json(newStudent.rows[0]);
    } catch (error) {
        console.error("Error creating student:", error);
        if (error.code === '23505') { // Unique constraint violation (e.g., roll_no)
            return res.status(400).json({ error: "Student with this roll number already exists." });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
        res.status(200).json(students.rows);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Secure delete student logic
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Fetch student info to get photo URL
        const studentQuery = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

        if (studentQuery.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const student = studentQuery.rows[0];
        const filename = path.basename(student.photo_url);
        const originalPath = path.join(uploadsDir, filename);
        const backupPath = path.join(backupsDir, filename);

        // 2. Backup photo before deletion
        if (fs.existsSync(originalPath)) {
            await copyFileAsync(originalPath, backupPath);
            console.log(`Successfully backed up photo ${filename}`);
        } else {
            console.warn(`Original photo ${originalPath} not found for backup.`);
        }

        // 3. Delete DB record
        await pool.query('DELETE FROM students WHERE id = $1', [id]);

        // 4. Delete original file only after successful backup and DB deletion
        if (fs.existsSync(originalPath)) {
            await unlinkAsync(originalPath);
            console.log(`Successfully deleted original photo ${filename}`);
        }

        res.status(200).json({ message: "Student deleted successfully securely backed up." });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    uploadPhoto,
    createStudent,
    getAllStudents,
    deleteStudent
};
