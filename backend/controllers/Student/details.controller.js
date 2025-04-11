const studentDetails = require("../../models/Students/details.model.js")
const studentCredential = require("../../models/Students/credential.model.js")

const getDetails = async (req, res) => {
    try {
        let user = await studentDetails.find(req.body);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "No Student Found" });
        }
        const data = {
            success: true,
            message: "Student Details Found!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addDetails = async (req, res) => {
    try {
        let user = await studentDetails.findOne({
            enrollmentNo: req.body.enrollmentNo,
        });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Student With This Enrollment Already Exists",
            });
        }
        const studentData = {
            ...req.body,
            profile: req.file ? req.file.filename : undefined
        };
        user = await studentDetails.create(studentData);
        const data = {
            success: true,
            message: "Student Details Added!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
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