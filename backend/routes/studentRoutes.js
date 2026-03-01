const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Define routes
router.post('/', studentController.uploadPhoto, studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
