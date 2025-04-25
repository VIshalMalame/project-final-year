const express = require("express");
const router = express.Router();
const {
  getSubject,
  getSubjectsByBranchAndSemester,
  addSubject,
  deleteSubject,
} = require("../../controllers/Other/subject.controller");

// Get all subjects
router.get("/getSubject", getSubject);

// Get subjects by branch and semester
router.get("/getSubjectsByBranchAndSemester", getSubjectsByBranchAndSemester);

// Add a new subject
router.post("/addSubject", addSubject);

// Delete a subject
router.delete("/deleteSubject/:id", deleteSubject);

module.exports = router; 