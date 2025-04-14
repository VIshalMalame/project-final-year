const Attendance = require("../../models/Other/attendance.model");
const Student = require("../../models/Students/details.model");

// Mark attendance for a class
const markAttendance = async (req, res) => {
    try {
        const { date, branch, semester, subject, attendance, facultyId } = req.body;

        // Convert date string to IST
        const istDate = new Date(date);
        istDate.setHours(5, 30, 0, 0); // Set to beginning of day in IST

        // Check if attendance already exists for this class on this date
        const existingAttendance = await Attendance.findOne({
            date: istDate,
            branch,
            semester,
            subject
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for this class on this date"
            });
        }

        // Create new attendance record
        const newAttendance = await Attendance.create({
            date: istDate,
            branch,
            semester,
            subject,
            facultyId,
            attendance
        });

        res.json({
            success: true,
            message: "Attendance marked successfully",
            data: newAttendance
        });

    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get students for attendance
const getStudentsForAttendance = async (req, res) => {
    try {
        const { branch, semester } = req.params;
        
        // Convert semester to number
        const semesterNum = parseInt(semester);
        if (isNaN(semesterNum)) {
            return res.status(400).json({
                success: false,
                message: "Invalid semester value"
            });
        }
        
        console.log(`Fetching students for branch: ${branch}, semester: ${semesterNum}`);
        console.log('Query:', { branch, semester: semesterNum });
        
        // First, let's check if there are any students in the database
        const totalStudents = await Student.countDocuments();
        console.log('Total students in database:', totalStudents);

        // Then, let's check what branches are available
        const distinctBranches = await Student.distinct('branch');
        console.log('Available branches:', distinctBranches);

        // And what semesters are available
        const distinctSemesters = await Student.distinct('semester');
        console.log('Available semesters:', distinctSemesters);

        // Now let's try to find students for this branch and semester
        const students = await Student.find(
            { branch, semester: semesterNum },
            'enrollmentNo firstName lastName'
        ).sort('enrollmentNo');

        console.log('Raw query result:', students);

        if (!students || students.length === 0) {
            console.log(`No students found for branch: ${branch}, semester: ${semesterNum}`);
            return res.status(404).json({
                success: false,
                message: "No students found for this branch and semester"
            });
        }

        console.log(`Found ${students.length} students for branch: ${branch}, semester: ${semesterNum}`);
        console.log('First student:', students[0]);
        
        res.json({
            success: true,
            message: "Students fetched successfully",
            students
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Get attendance records
const getAttendanceRecords = async (req, res) => {
    try {
        const { branch, semester, subject, startDate, endDate } = req.query;
        
        const query = {
            branch,
            semester: parseInt(semester)
        };

        if (subject) {
            query.subject = subject;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const records = await Attendance.find(query)
            .sort('-date')
            .limit(100); // Limit to prevent overwhelming response

        res.json({
            success: true,
            message: "Attendance records fetched successfully",
            records
        });

    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get student's attendance records
const getStudentAttendance = async (req, res) => {
    try {
        const { enrollmentNo, viewType } = req.query;
        
        if (!enrollmentNo) {
            return res.status(400).json({
                success: false,
                message: "Enrollment number is required"
            });
        }

        // Get student details to get branch and semester
        const student = await Student.findOne({ enrollmentNo: parseInt(enrollmentNo) });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const query = {
            branch: student.branch,
            semester: student.semester,
            'attendance.enrollmentNo': parseInt(enrollmentNo)
        };

        // Add date filters based on viewType
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (viewType === 'daily') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query.date = {
                $gte: today,
                $lt: tomorrow
            };
        } else if (viewType === 'monthly') {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            query.date = {
                $gte: firstDayOfMonth,
                $lt: firstDayOfNextMonth
            };
        } else if (viewType === 'semester') {
            // Assuming semester starts from August
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            let semesterStart;
            
            if (currentMonth >= 7) { // August or later
                semesterStart = new Date(currentYear, 7, 1); // August 1st
            } else {
                semesterStart = new Date(currentYear - 1, 7, 1); // August 1st of previous year
            }
            
            query.date = {
                $gte: semesterStart,
                $lte: today
            };
        }

        const records = await Attendance.find(query)
            .sort('-date')
            .select('date subject attendance');

        // Process the records to get attendance status for the student
        const processedRecords = records.map(record => {
            const studentAttendance = record.attendance.find(a => a.enrollmentNo === parseInt(enrollmentNo));
            return {
                date: record.date,
                subject: record.subject,
                isPresent: studentAttendance ? studentAttendance.isPresent : false
            };
        });

        // Calculate attendance statistics
        const totalClasses = processedRecords.length;
        const presentClasses = processedRecords.filter(record => record.isPresent).length;
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        res.json({
            success: true,
            message: "Attendance records fetched successfully",
            records: processedRecords,
            statistics: {
                totalClasses,
                presentClasses,
                attendancePercentage: Math.round(attendancePercentage * 100) / 100
            }
        });

    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    markAttendance,
    getStudentsForAttendance,
    getAttendanceRecords,
    getStudentAttendance
}; 