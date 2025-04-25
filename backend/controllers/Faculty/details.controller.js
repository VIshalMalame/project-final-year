const facultyDetails = require("../../models/Faculty/details.model.js")

const getDetails = async (req, res) => {
    try {
        let user = await facultyDetails.find(req.body);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "No Faculty Found" });
        }
        const data = {
            success: true,
            message: "Faculty Details Found!",
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
        // Validate required fields
        const requiredFields = ['employeeId', 'firstName', 'middleName', 'lastName', 'email', 'phoneNumber', 'department', 'gender', 'experience', 'post'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check if faculty already exists
        let user = await facultyDetails.findOne({ employeeId: req.body.employeeId });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Faculty With This EmployeeId Already Exists"
            });
        }

        // Create new faculty with optional profile image
        const facultyData = {
            ...req.body,
            profile: req.file ? req.file.filename : 'default-profile.png' // Use default image if none uploaded
        };
        
        user = await facultyDetails.create(facultyData);

        const data = {
            success: true,
            message: "Faculty Details Added Successfully!",
            user
        };
        res.json(data);
    } catch (error) {
        console.error("Error in addDetails:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: error.message 
        });
    }
}

const updateDetails = async (req, res) => {
    try {
        let user;
        if (req.file) {
            user = await facultyDetails.findByIdAndUpdate(req.params.id, { ...req.body, profile: req.file.filename });
        } else {
            user = await facultyDetails.findByIdAndUpdate(req.params.id, req.body);
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Faculty Found",
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
    try {
        let user = await facultyDetails.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Faculty Found",
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
        let user = await facultyDetails.count(req.body);
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

module.exports = { getDetails, addDetails, updateDetails, deleteDetails, getCount }