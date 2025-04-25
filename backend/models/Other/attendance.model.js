const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  facultyId: {
    type: Number,
    required: true,
  },
  attendance: [{
    enrollmentNo: {
      type: Number,
      required: true,
    },
    isPresent: {
      type: Boolean,
      required: true,
      default: false
    }
  }]
}, { 
  timestamps: true 
});

// Create compound index for querying attendance records
attendanceSchema.index({ date: 1, branch: 1, semester: 1, subject: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema); 