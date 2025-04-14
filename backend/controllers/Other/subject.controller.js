const Subject = require("../../models/Other/subject.model");

// Get all subjects
const getSubject = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json({
            success: true,
            subject: subjects,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get subjects by branch and semester
const getSubjectsByBranchAndSemester = async (req, res) => {
    try {
        const { branch, semester } = req.query;
        
        if (!branch || !semester) {
            return res.status(400).json({
                success: false,
                message: "Branch and semester are required",
            });
        }

        const subjects = await Subject.find({ branch, semester: parseInt(semester) });
        res.status(200).json({
            success: true,
            subjects,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Add a new subject
const addSubject = async (req, res) => {
    try {
        const { name, code, branch, semester } = req.body;

        // Check if subject with same code exists
        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject with this code already exists",
            });
        }

        const subject = new Subject({
            name,
            code,
            branch,
            semester: parseInt(semester)
        });

        await subject.save();
        res.status(201).json({
            success: true,
            message: "Subject added successfully",
            subject,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete a subject
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        await Subject.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getSubject,
    getSubjectsByBranchAndSemester,
    addSubject,
    deleteSubject,
};