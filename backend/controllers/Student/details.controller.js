const studentDetails = require("../../models/Students/details.model.js")
const studentCredential = require("../../models/Students/credential.model.js")

const getDetails = async (req, res) => {
    try {
        // Check if we're searching by enrollment number or by branch/semester
        let query = {};
        
        if (req.body.enrollmentNo) {
            query.enrollmentNo = req.body.enrollmentNo;
        } else if (req.body.branch && req.body.semester) {
            query.branch = req.body.branch;
            query.semester = parseInt(req.body.semester);
        } else {
            return res.status(400).json({
                success: false,
                message: "Please provide enrollment number or branch and semester"
            });
        }
        
        const users = await studentDetails.find(query);
        
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Student Found"
            });
        }
        
        res.json({
            success: true,
            message: "Student Details Found!",
            user: users,
        });
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal Server Error" 
        });
    }
}

const addDetails = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['enrollmentNo', 'firstName', 'lastName', 'email', 'semester', 'branch', 'gender'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate data types
        if (isNaN(req.body.enrollmentNo)) {
            return res.status(400).json({
                success: false,
                message: "Enrollment number must be a valid number"
            });
        }

        if (isNaN(req.body.semester)) {
            return res.status(400).json({
                success: false,
                message: "Semester must be a valid number"
            });
        }

        // Check for existing student
        const existingStudent = await studentDetails.findOne({
            enrollmentNo: req.body.enrollmentNo,
        });
        
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "Student With This Enrollment Already Exists",
            });
        }

        // Create student details
        const studentData = {
            enrollmentNo: parseInt(req.body.enrollmentNo),
            firstName: req.body.firstName,
            middleName: req.body.middleName || '',
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber ? parseInt(req.body.phoneNumber) : undefined,
            semester: parseInt(req.body.semester),
            branch: req.body.branch,
            gender: req.body.gender,
            profile: req.file ? req.file.filename : undefined
        };

        const user = await studentDetails.create(studentData);
        
        // Create student credentials
        try {
            await studentCredential.create({
                loginid: studentData.enrollmentNo,
                password: studentData.enrollmentNo.toString() // Default password is enrollment number
            });
        } catch (credError) {
            console.error('Error creating student credentials:', credError);
            // Continue even if credential creation fails
        }
        
        res.json({
            success: true,
            message: "Student Details Added Successfully!",
            user,
        });
    } catch (error) {
        console.error('Error adding student details:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error adding student details",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}


const updateDetails = async (req, res) => {
    try {
        let user;
        if (req.file) {
            user = await studentDetails.findByIdAndUpdate(req.params.id, { ...req.body, profile: req.file.filename });
        } else {
            user = await studentDetails.findByIdAndUpdate(req.params.id, req.body);
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Student Found",
            });
        }
        const data = {
            success: true,
            message: "Updated Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteDetails = async (req, res) => {
    let { id } = req.body;
    try {
        let user = await studentDetails.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Student Found",
            });
        }
        const data = {
            success: true,
            message: "Deleted Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getCount = async (req, res) => {
    try {
        let user = await studentDetails.count(req.body);
        const data = {
            success: true,
            message: "Count Successfull!",
            user,
        };
        res.json(data);
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Internal Server Error", error });
    }
}

const addMultipleStudents = async (req, res) => {
    try {
        const { students } = req.body;
        const results = {
            success: [],
            errors: []
        };

        for (const student of students) {
            try {
                // Check for duplicate enrollment
                const existingStudent = await studentDetails.findOne({
                    enrollmentNo: student.enrollmentNo
                });

                if (existingStudent) {
                    results.errors.push({
                        enrollmentNo: student.enrollmentNo,
                        message: "Student with this enrollment number already exists"
                    });
                    continue;
                }

                // Create student details
                const newStudent = await studentDetails.create(student);

                // Create student credentials
                await studentCredential.create({
                    loginid: student.enrollmentNo,
                    password: student.enrollmentNo.toString()
                });

                results.success.push({
                    enrollmentNo: student.enrollmentNo,
                    message: "Student added successfully"
                });
            } catch (error) {
                results.errors.push({
                    enrollmentNo: student.enrollmentNo,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            message: "Students added successfully",
            results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { getDetails, addDetails, updateDetails, deleteDetails, getCount, addMultipleStudents }