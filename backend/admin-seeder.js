const adminDetails = require("./models/Admin/details.model.js");
const adminCredential = require("./models/Admin/credential.model.js");
const connectToMongo = require("./Database/db.js");
const mongoose = require("mongoose");

const seedData = async () => {
    try {
        await connectToMongo();

        await adminCredential.deleteMany({})
        await adminDetails.deleteMany({})

        await adminCredential.create({
            loginid: 123456,
            password: "admin123"
        });

        const adminDetail = {
            employeeId: "123456",
            firstName: "Sundar",
            middleName: "R",
            lastName: "Pichai",
            email: "sundarpichar@gmail.com",
            phoneNumber: "1234567890",
            gender: "Male",
            type: "Admin",
            profile: "Faculty_Profile_123456.jpg",
        };

        await adminDetails.create(adminDetail);

        // Add faculty data
        const facultyCredentialModel = require("./models/Faculty/credential.model.js");
        const facultyDetailsModel = require("./models/Faculty/details.model.js");

        await facultyCredentialModel.deleteMany({});
        await facultyDetailsModel.deleteMany({});

        await facultyCredentialModel.create({
            loginid: 789012,
            password: "faculty123"
        });

        const facultyDetail = {
            employeeId: "789012",
            firstName: "John",
            middleName: "D",
            lastName: "Doe",
            email: "john.doe@example.com",
            phoneNumber: "0987654321",
            gender: "Male",
            type: "Faculty",
            department: "Computer Science",
            experience: 5,
            post: "Professor",
            profile: "Faculty_Profile_789012.jpg",
        };

        await facultyDetailsModel.create(facultyDetail);

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error while seeding:", error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seedData();
