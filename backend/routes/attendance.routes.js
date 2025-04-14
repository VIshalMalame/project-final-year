const express = require("express");
const router = express.Router();
const { 
    markAttendance,
    getStudentsForAttendance,
    getAttendanceRecords,
    getStudentAttendance
} = require("../controllers/Other/attendance.controller");

// Route to mark attendance
router.post("/mark", markAttendance);

// Route to get students for attendance
router.get("/students/:branch/:semester", getStudentsForAttendance);

// Route to get attendance records
router.get("/records", getAttendanceRecords);

// Route to get student attendance
router.get("/student", getStudentAttendance);

module.exports = router; 