import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiUpload, FiEdit2, FiTrash2 } from "react-icons/fi";

const EditFaculty = () => {
  const [file, setFile] = useState();
  const [faculties, setFaculties] = useState([]);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [data, setData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    gender: "",
    experience: "",
    post: "",
    profile: "",
  });
  const [previewImage, setPreviewImage] = useState("");

  // Fetch all faculties on component mount
  useEffect(() => {
    fetchAllFaculties();
  }, []);

  const fetchAllFaculties = () => {
    toast.loading("Fetching Faculties");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL()}/faculty/details/getDetails`, {}, { headers })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          setFaculties(response.data.user);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || "Error fetching faculties");
      });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setData({
      employeeId: faculty.employeeId,
      firstName: faculty.firstName,
      middleName: faculty.middleName,
      lastName: faculty.lastName,
      email: faculty.email,
      phoneNumber: faculty.phoneNumber,
      post: faculty.post,
      department: faculty.department,
      gender: faculty.gender,
      profile: faculty.profile,
      experience: faculty.experience,
    });
    setPreviewImage(`${baseApiURL()}/uploads/${faculty.profile}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this faculty member?")) {
      toast.loading("Deleting Faculty");
      const headers = {
        "Content-Type": "application/json",
      };
      axios
        .delete(`${baseApiURL()}/faculty/details/deleteDetails/${id}`, { headers })
        .then((response) => {
          toast.dismiss();
          if (response.data.success) {
            toast.success(response.data.message);
            fetchAllFaculties();
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.response?.data?.message || "Error deleting faculty");
        });
    }
  };

  const updateFacultyProfile = (e) => {
    e.preventDefault();
    toast.loading("Updating Faculty");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("employeeId", data.employeeId);
    formData.append("firstName", data.firstName);
    formData.append("middleName", data.middleName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("department", data.department);
    formData.append("experience", data.experience);
    formData.append("gender", data.gender);
    formData.append("post", data.post);
    if (file) {
      formData.append("type", "profile");
      formData.append("profile", file);
    }
    axios
      .put(`${baseApiURL()}/faculty/details/updateDetails/${editingFaculty._id}`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setEditingFaculty(null);
          clearForm();
          fetchAllFaculties();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || "Error updating faculty");
      });
  };

  const clearForm = () => {
    setEditingFaculty(null);
    setFile(null);
    setPreviewImage("");
    setData({
      employeeId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      department: "",
      gender: "",
      experience: "",
      post: "",
      profile: "",
    });
  };

  return (
    <div className="my-6 mx-auto w-full">
      {/* Faculty List */}
      <div className="w-[90%] mx-auto">
        <h2 className="text-2xl font-bold mb-4">Faculty List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left">Employee ID</th>
                <th className="px-6 py-3 border-b text-left">Name</th>
                <th className="px-6 py-3 border-b text-left">Department</th>
                <th className="px-6 py-3 border-b text-left">Email</th>
                <th className="px-6 py-3 border-b text-left">Phone</th>
                <th className="px-6 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{faculty.employeeId}</td>
                  <td className="px-6 py-4 border-b">
                    {`${faculty.firstName} ${faculty.middleName} ${faculty.lastName}`}
                  </td>
                  <td className="px-6 py-4 border-b">{faculty.department}</td>
                  <td className="px-6 py-4 border-b">{faculty.email}</td>
                  <td className="px-6 py-4 border-b">{faculty.phoneNumber}</td>
                  <td className="px-6 py-4 border-b">
                    <button
                      onClick={() => handleEdit(faculty)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <FiEdit2 className="inline" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(faculty._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="inline" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form */}
      {editingFaculty && (
        <form
          onSubmit={updateFacultyProfile}
          className="w-[70%] flex justify-center items-center flex-wrap gap-6 mx-auto mt-10"
        >
          <div className="w-[40%]">
            <label htmlFor="firstname" className="leading-7 text-sm">
              Enter First Name
            </label>
            <input
              type="text"
              id="firstname"
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="middlename" className="leading-7 text-sm">
              Enter Middle Name
            </label>
            <input
              type="text"
              id="middlename"
              value={data.middleName}
              onChange={(e) => setData({ ...data, middleName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="lastname" className="leading-7 text-sm">
              Enter Last Name
            </label>
            <input
              type="text"
              id="lastname"
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="employeeId" className="leading-7 text-sm">
              Employee ID
            </label>
            <input
              disabled
              type="number"
              id="employeeId"
              value={data.employeeId}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="phoneNumber" className="leading-7 text-sm">
              Phone Number
            </label>
            <input
              type="number"
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="email" className="leading-7 text-sm">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="department" className="leading-7 text-sm">
              Department
            </label>
            <input
              type="text"
              id="department"
              value={data.department}
              onChange={(e) => setData({ ...data, department: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="post" className="leading-7 text-sm">
              Post
            </label>
            <input
              type="text"
              id="post"
              value={data.post}
              onChange={(e) => setData({ ...data, post: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="gender" className="leading-7 text-sm">
              Gender
            </label>
            <select
              id="gender"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="w-[40%]">
            <label htmlFor="experience" className="leading-7 text-sm">
              Experience
            </label>
            <input
              type="number"
              id="experience"
              value={data.experience}
              onChange={(e) => setData({ ...data, experience: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="profile" className="leading-7 text-sm">
              Profile Image
            </label>
            <input
              type="file"
              id="profile"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          {previewImage && (
            <div className="w-full flex justify-center">
              <img
                src={previewImage}
                alt="Profile Preview"
                className="h-32 w-32 object-cover rounded-full"
              />
            </div>
          )}
          <div className="w-full flex justify-center gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Update Faculty
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditFaculty;
