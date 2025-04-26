// Importing the adminCredential Mongoose model
const adminCredential = require("../../models/Admin/credential.model.js");

// Handler for login
const loginHandler = async (req, res) => {
    // Destructure loginid and password from request body
    let { loginid, password } = req.body;
    try {
        // Find user by loginid
        let user = await adminCredential.findOne({ loginid });

        // If user not found, return error
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }

        // If password doesn't match, return error
        if (password !== user.password) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }

        // If login successful, send user data
        const data = {
            success: true,
            message: "Login Successfull!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        // Catch any unexpected errors
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Handler for registration
const registerHandler = async (req, res) => {
    // Destructure loginid and password from request body
    let { loginid, password } = req.body;
    try {
        // Check if user already exists
        let user = await adminCredential.findOne({ loginid });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Admin With This LoginId Already Exists",
            });
        }

        // Create a new admin user
        user = await adminCredential.create({
            loginid,
            password,
        });

        // Send response on successful registration
        const data = {
            success: true,
            message: "Register Successfull!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        // Handle any unexpected errors
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Handler for updating admin details
const updateHandler = async (req, res) => {
    try {
        // Update admin data by ID with the new data from request body
        let user = await adminCredential.findByIdAndUpdate(req.params.id, req.body);

        // If admin not found, return error
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Admin Exists!",
            });
        }

        // Send response on successful update
        const data = {
            success: true,
            message: "Updated Successfull!",
        };
        res.json(data);
    } catch (error) {
        // Handle any unexpected errors
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Handler for deleting admin by ID
const deleteHandler = async (req, res) => {
    try {
        // Delete admin data by ID
        let user = await adminCredential.findByIdAndDelete(req.params.id);

        // If admin not found, return error
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Admin Exists!",
            });
        }

        // Send response on successful deletion
        const data = {
            success: true,
            message: "Deleted Successfull!",
        };
        res.json(data);
    } catch (error) {
        // Handle any unexpected errors
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// Export all handlers for use in route files
module.exports = { loginHandler, registerHandler, updateHandler, deleteHandler };
