const Attendance = require("../../models/Other/attendance.model");
const Student = require("../../models/Students/details.model");
const excel = require("exceljs");

// Get student attendance reports with filters
const getStudentAttendance = async (req, res) => {
  try {
    const { branch, semester, startDate, endDate } = req.query;
    
    if (!branch || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Branch and semester are required'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all students in the branch and semester
    const students = await Student.find({ branch, semester });

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      branch,
      semester: Number(semester),
      ...dateFilter
    });

    console.log(`Found ${attendanceRecords.length} attendance records for branch ${branch} semester ${semester}`);

    // Process attendance data
    const attendanceData = students.map(student => {
      // Get all attendance records where this student appears
      const studentAttendance = attendanceRecords.filter(record => 
        record.attendance.some(a => a.enrollmentNo === student.enrollmentNo)
      );

      // Count present classes
      const presentClasses = studentAttendance.reduce((count, record) => {
        const studentRecord = record.attendance.find(a => a.enrollmentNo === student.enrollmentNo);
        return count + (studentRecord?.isPresent === true ? 1 : 0);
      }, 0);

      const totalClasses = attendanceRecords.length;
      const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

      // Debug logging
      console.log(`Student ${student.enrollmentNo}:`, {
        firstName: student.firstName,
        totalClasses,
        presentClasses,
        percentage: attendancePercentage,
        attendanceRecords: studentAttendance.map(r => ({
          date: r.date,
          isPresent: r.attendance.find(a => a.enrollmentNo === student.enrollmentNo)?.isPresent
        }))
      });

      return {
        enrollmentNo: student.enrollmentNo,
        name: student.firstName || 'N/A', // Only return first name
        totalClasses,
        presentClasses,
        attendancePercentage
      };
    });

    res.json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    console.error('Error in getStudentAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get detailed attendance for a specific student
const getStudentDetailedAttendance = async (req, res) => {
  try {
    const { enrollmentNo, startDate, endDate } = req.query;

    if (!enrollmentNo) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment number is required'
      });
    }

    // Get student details
    const student = await Student.findOne({ enrollmentNo });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      branch: student.branch,
      semester: student.semester,
      ...dateFilter
    }).sort({ date: -1 });

    // Process attendance data
    const detailedAttendance = attendanceRecords.map(record => {
      const attendance = record.attendance.find(a => a.enrollmentNo === enrollmentNo);
      return {
        date: record.date,
        subject: record.subject,
        present: attendance?.present || false
      };
    });

    res.json({
      success: true,
      data: detailedAttendance
    });
  } catch (error) {
    console.error('Error in getStudentDetailedAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export attendance reports to Excel
const exportAttendance = async (req, res) => {
  try {
    const { branch, semester, startDate, endDate } = req.query;

    if (!branch || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Branch and semester are required'
      });
    }

    // Get attendance data using the same logic as getStudentAttendance
    const students = await Student.find({ branch, semester });
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find({
      branch,
      semester: Number(semester),
      ...dateFilter
    });

    // Create Excel workbook
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Add headers
    worksheet.columns = [
      { header: 'Enrollment No', key: 'enrollmentNo', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Total Classes', key: 'totalClasses', width: 15 },
      { header: 'Present', key: 'presentClasses', width: 15 },
      { header: 'Absent', key: 'absentClasses', width: 15 },
      { header: 'Attendance %', key: 'attendancePercentage', width: 15 }
    ];

    // Add data
    students.forEach(student => {
      const studentAttendance = attendanceRecords.filter(record =>
        record.attendance.some(a => a.enrollmentNo === student.enrollmentNo)
      );

      const presentClasses = studentAttendance.reduce((count, record) => {
        const attendance = record.attendance.find(a => a.enrollmentNo === student.enrollmentNo);
        return count + (attendance?.present ? 1 : 0);
      }, 0);

      const totalClasses = studentAttendance.length;
      const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

      worksheet.addRow({
        enrollmentNo: student.enrollmentNo,
        name: student.name,
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses,
        attendancePercentage: `${attendancePercentage.toFixed(2)}%`
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance-report.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error in exportAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getStudentAttendance,
  getStudentDetailedAttendance,
  exportAttendance
}; 