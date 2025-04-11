const XLSX = require('xlsx');
const studentDetails = require('../../models/Students/details.model.js');
const studentCredential = require('../../models/Students/credential.model.js');

const MAX_BATCH_SIZE = 50;

const validateStudentData = (student) => {
    const errors = [];
    
    // Required fields
    const requiredFields = ['enrollmentNo', 'firstName', 'lastName', 'email', 'phoneNumber', 'semester', 'branch', 'gender'];
    requiredFields.forEach(field => {
        if (!student[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (student.email && !emailRegex.test(student.email)) {
        errors.push(`Invalid email format: ${student.email}`);
    }

    // Phone number validation (assuming 10 digits)
    if (student.phoneNumber) {
        const phoneStr = student.phoneNumber.toString();
        if (!/^\d{10}$/.test(phoneStr)) {
            errors.push(`Invalid phone number format: ${phoneStr}. Must be 10 digits.`);
        }
    }

    // Semester validation
    if (student.semester) {
        const semester = Number(student.semester);
        if (isNaN(semester)) {
            errors.push(`Invalid semester value: ${student.semester}. Must be a number.`);
        } else if (semester < 1 || semester > 8) {
            errors.push(`Invalid semester value: ${semester}. Must be between 1 and 8.`);
        }
    }

    // Log the student data for debugging
    console.log('Validating student:', student);

    return errors;
};

const importStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No Excel file uploaded"
            });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Clean up the data
        const cleanedData = data.map(student => {
            const cleanedStudent = {};
            // Clean up each field
            Object.entries(student).forEach(([key, value]) => {
                // Remove spaces from column names and trim values
                const cleanKey = key.trim();
                const cleanValue = typeof value === 'string' ? value.trim() : value;
                cleanedStudent[cleanKey] = cleanValue;
            });
            return cleanedStudent;
        });

        if (cleanedData.length > MAX_BATCH_SIZE) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${MAX_BATCH_SIZE} students can be imported at once`
            });
        }

        const results = {
            success: [],
            errors: []
        };

        // Validate all students first
        for (const student of cleanedData) {
            console.log('Processing student:', student);
            const errors = validateStudentData(student);
            if (errors.length > 0) {
                console.log('Validation errors for student:', errors);
                results.errors.push({
                    row: cleanedData.indexOf(student) + 2,
                    enrollmentNo: student.enrollmentNo,
                    errors,
                    studentData: student
                });
            }
        }

        // If there are validation errors, return them
        if (results.errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation errors found",
                results,
                totalStudents: cleanedData.length,
                errorCount: results.errors.length,
                sampleError: results.errors[0]
            });
        }

        // If validation passes, return the cleaned data for preview
        res.json({
            success: true,
            message: "Validation successful. Preview the data before adding.",
            results: {
                success: cleanedData // Send the full cleaned data for preview
            }
        });

        /* Remove the student creation logic from here, as it will be handled by addMultipleStudents
        // Process valid students 
        for (const student of cleanedData) {
            try {
                // Check for duplicate enrollment
                const existingStudent = await studentDetails.findOne({
                    enrollmentNo: student.enrollmentNo
                });

                if (existingStudent) {
                    results.errors.push({
                        row: cleanedData.indexOf(student) + 2,
                        enrollmentNo: student.enrollmentNo,
                        errors: ["Student with this enrollment number already exists"]
                    });
                    continue;
                }

                // Create student details without profile picture
                const studentData = {
                    ...student,
                    profile: undefined
                };
                const newStudent = await studentDetails.create(studentData);

                // Create student credentials
                await studentCredential.create({
                    loginid: student.enrollmentNo,
                    password: student.enrollmentNo.toString()
                });

                results.success.push({
                    row: cleanedData.indexOf(student) + 2,
                    enrollmentNo: student.enrollmentNo,
                    message: "Student added successfully"
                });
            } catch (error) {
                console.error('Error processing student:', error);
                results.errors.push({
                    row: cleanedData.indexOf(student) + 2,
                    enrollmentNo: student.enrollmentNo,
                    errors: [error.message]
                });
            }
        }

        res.json({
            success: true,
            message: "Import completed",
            results
        });
        */
    } catch (error) {
        console.error('Excel import error:', error);
        res.status(500).json({
            success: false,
            message: "Error importing Excel file",
            error: error.message
        });
    }
};

module.exports = { importStudents }; 