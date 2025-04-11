const express = require("express");
const router = express.Router();
const { importStudents } = require("../../controllers/Student/excel.controller.js");
const multer = require("multer");

// Configure multer for Excel files
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed!'), false);
        }
    }
});

router.post("/import", upload.single("file"), importStudents);

module.exports = router; 