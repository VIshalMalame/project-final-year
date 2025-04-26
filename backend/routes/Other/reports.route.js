const express = require("express");
const router = express.Router();
const {
  getStudentAttendance,
  getStudentDetailedAttendance,
  exportAttendance
} = require("../../controllers/Other/reports.controller");

// Get attendance data for all students in a branch/semester
router.get("/attendance", getStudentAttendance);

// Get detailed attendance for a specific student
router.get("/attendance/student", getStudentDetailedAttendance);

// Export attendance data to Excel
router.get("/attendance/export", exportAttendance);

module.exports = router; 