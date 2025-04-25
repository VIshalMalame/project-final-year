import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiUpload, FiFileText, FiChevronDown, FiChevronUp, FiEdit, FiTrash2 } from "react-icons/fi";

const AddStudent = () => {
  const [file, setFile] = useState();
  const [excelFile, setExcelFile] = useState();
  const [branch, setBranch] = useState();
  const [previewImage, setPreviewImage] = useState("");
  const [importedStudents, setImportedStudents] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [data, setData] = useState({
    enrollmentNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    semester: "",
    branch: "",
    gender: "",
  });

  const getBranchData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch branches");
      });
  };

  useEffect(() => {
    getBranchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        const imageUrl = URL.createObjectURL(selectedFile);
        setPreviewImage(imageUrl);
    } else {
        toast.error("Please select a valid image file.");
        setFile(null);
        setPreviewImage("");
    }
  };

  const handleExcelFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls",
        ".xlsx"
    ];
    if (selectedFile && (allowedTypes.includes(selectedFile.type) || allowedTypes.some(type => selectedFile.name.endsWith(type)))) {
        setExcelFile(selectedFile);
    } else {
        toast.error("Please select a valid Excel file (.xls, .xlsx).");
        setExcelFile(null);
    }
  };

  const handleExcelImport = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    toast.loading("Processing Excel file...");
    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const response = await axios.post(
        `${baseApiURL()}/student/excel/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.dismiss();
      if (response.data.success) {
        setImportedStudents(response.data.results.success);
        setShowImportPreview(true);
        setExpandedRows(new Set());
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Validation failed");
        if (response.data.results?.errors && response.data.results.errors.length > 0) {
          const errorCount = response.data.errorCount;
          const totalStudents = response.data.totalStudents;
          toast.error(
            `${errorCount} error${errorCount > 1 ? 's' : ''} found in ${totalStudents} students. Check console for details.`,
            { duration: 6000 }
          );
          console.error("Validation Errors:", response.data.results.errors);
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error("Excel Import Error:", error);
      toast.error(error.response?.data?.message || "Error importing Excel file");
    }
  };

  const addImportedStudents = async () => {
    if (importedStudents.length === 0) {
        toast.error("No students to add.");
        return;
    }
    toast.loading("Adding students...");
    try {
      const response = await axios.post(
        `${baseApiURL()}/student/details/addMultiple`,
        { students: importedStudents }
      );

      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setImportedStudents([]);
        setShowImportPreview(false);
        setExcelFile(null);
        setExpandedRows(new Set());
      } else {
        toast.error(response.data.message);
        if (response.data.results?.failed && response.data.results.failed.length > 0) {
            toast.error(`Failed to add ${response.data.results.failed.length} students. Check console.`, { duration: 6000 });
            console.error("Failed Additions:", response.data.results.failed);
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error("Add Multiple Students Error:", error);
      toast.error(error.response?.data?.message || "Error adding students");
    }
  };

  const toggleRowExpansion = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleRemoveStudent = (indexToRemove) => {
    const studentToRemove = importedStudents[indexToRemove];
    toast.success(`Removed student: ${studentToRemove.enrollmentNo}`);
    setImportedStudents(prev => prev.filter((_, index) => index !== indexToRemove));
    const newExpandedRows = new Set();
    expandedRows.forEach(expandedIndex => {
      if (expandedIndex === indexToRemove) return; // Skip the removed row
      if (expandedIndex > indexToRemove) {
        newExpandedRows.add(expandedIndex - 1); // Adjust index for subsequent rows
      } else {
        newExpandedRows.add(expandedIndex);
      }
    });
    setExpandedRows(newExpandedRows);
  };

  const handleEditStudent = (index) => {
    toast(`Edit for ${importedStudents[index].enrollmentNo} - Not implemented.`);
    // Add modal opening logic here
  };

  const addStudentProfile = (e) => {
    e.preventDefault();
    // Basic validation
    if (!data.enrollmentNo || !data.firstName || !data.lastName || !data.email || !data.semester || !data.branch || !data.gender) {
        toast.error("Please fill all required fields.");
        return;
    }

    // Convert enrollmentNo and phoneNumber to numbers
    const formDataToSend = {
        ...data,
        enrollmentNo: parseInt(data.enrollmentNo),
        phoneNumber: data.phoneNumber ? parseInt(data.phoneNumber) : undefined,
        semester: parseInt(data.semester)
    };

    toast.loading("Adding Student...");
    const formData = new FormData();
    
    // Append data fields
    Object.entries(formDataToSend).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });

    if (file) {
        formData.append("profile", file);
    }

    axios
      .post(`${baseApiURL()}/student/details/addDetails`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success("Student added successfully!");
          // Reset form
          setFile(null);
          setData({
            enrollmentNo: "",
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            semester: "",
            branch: "",
            gender: "",
          });
          setPreviewImage("");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        console.error("Add Student Error:", error);
        const errorMessage = error.response?.data?.message || "Error adding student details";
        toast.error(errorMessage);
      });
  };

  return (
    <div className="w-full p-6 md:p-8 lg:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-semibold text-neutral-dark">Add Student</h2>
        <div className="flex flex-wrap gap-3">
          <label
            htmlFor="excelFile"
            className="btn btn-secondary text-white cursor-pointer shadow-soft"
          >
            <FiFileText className="mr-2" />
            Import Excel
          </label>
          <input
            hidden
            type="file"
            id="excelFile"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleExcelFileChange}
            onClick={(e) => (e.target.value = null)} 
          />
          {excelFile && (
            <button
              onClick={handleExcelImport}
              className="btn btn-accent text-white shadow-soft"
              disabled={!excelFile}
            >
              Process "{excelFile.name}"
            </button>
          )}
        </div>
      </div>

      {showImportPreview && (
        <div className="bg-white p-6 rounded-2xl shadow-soft-md space-y-6">
          <h3 className="text-2xl font-semibold text-neutral-dark border-b pb-3 border-neutral-medium">
            Import Preview ({importedStudents.length} Students)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead >
                <tr className="border-b border-neutral-medium">
                  <th className="p-4 text-left text-sm font-semibold text-neutral-dark uppercase tracking-wider">Enrollment No</th>
                  <th className="p-4 text-left text-sm font-semibold text-neutral-dark uppercase tracking-wider">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-neutral-dark uppercase tracking-wider">Email</th>
                  <th className="p-4 text-center text-sm font-semibold text-neutral-dark uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {importedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-neutral-medium italic">No students to display.</td>
                  </tr>
                ) : (
                  importedStudents.map((student, index) => (
                    <React.Fragment key={student.enrollmentNo || index}>
                      <tr className="border-b border-neutral hover:bg-primary-light transition duration-150 ease-in-out">
                        <td className="p-4 text-sm text-neutral-dark font-medium whitespace-nowrap">{student.enrollmentNo}</td>
                        <td className="p-4 text-sm text-neutral-dark whitespace-nowrap">
                          {`${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim()}
                        </td>
                        <td className="p-4 text-sm text-neutral-dark whitespace-nowrap">{student.email}</td>
                        <td className="p-4 text-sm text-neutral-dark text-center whitespace-nowrap">
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="p-2 rounded-lg text-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-dark mr-2 transition duration-150"
                            title={expandedRows.has(index) ? "Hide Details" : "Show Details"}
                          >
                            {expandedRows.has(index) ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => handleEditStudent(index)}
                            className="p-2 rounded-lg text-accent hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent-dark mr-2 transition duration-150"
                            title="Edit Student"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveStudent(index)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150"
                            title="Remove Student"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(index) && (
                        <tr className="bg-primary-light border-l-4 border-primary">
                          <td colSpan="4" className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm text-neutral-dark">
                              <div><strong>Phone:</strong> {student.phoneNumber || 'N/A'}</div>
                              <div><strong>Semester:</strong> {student.semester || 'N/A'}</div>
                              <div><strong>Branch:</strong> {student.branch || 'N/A'}</div>
                              <div><strong>Gender:</strong> {student.gender || 'N/A'}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {importedStudents.length > 0 && (
              <div className="pt-4 flex justify-end border-t border-neutral-medium">
                  <button
                      onClick={addImportedStudents}
                      className="btn btn-secondary text-white shadow-soft flex items-center gap-2"
                      disabled={importedStudents.length === 0}
                  >
                      Add All {importedStudents.length} Students
                  </button>
              </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-soft-md space-y-6">
        <h3 className="text-2xl font-semibold text-neutral-dark border-b pb-3 border-neutral-medium">Add Single Student Manually</h3>
        <form
          onSubmit={addStudentProfile}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
        >
          {[ 
            {id: 'firstName', label: 'First Name', type: 'text', required: true},
            {id: 'middleName', label: 'Middle Name', type: 'text'},
            {id: 'lastName', label: 'Last Name', type: 'text', required: true},
            {id: 'enrollmentNo', label: 'Enrollment No', type: 'number', required: true},
            {id: 'email', label: 'Email Address', type: 'email', required: true},
            {id: 'phoneNumber', label: 'Phone Number', type: 'tel'},
          ].map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-neutral-dark mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                id={field.id}
                value={data[field.id]}
                onChange={(e) => setData({ ...data, [field.id]: e.target.value })}
                className="w-full bg-neutral p-3 rounded-xl border border-neutral-medium focus:ring-1 focus:ring-primary focus:border-primary text-base outline-none transition duration-200 ease-in-out shadow-sm"
                required={field.required}
                {...(field.type === 'number' && { className: `${field.className} appearance-none`})}
              />
            </div>
          ))}

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-neutral-dark mb-1">
              Select Semester <span className="text-red-500">*</span>
            </label>
            <select
              id="semester"
              className="w-full bg-neutral p-3 rounded-xl border border-neutral-medium focus:ring-1 focus:ring-primary focus:border-primary text-base outline-none transition duration-200 ease-in-out shadow-sm appearance-none pr-8"
              value={data.semester}
              onChange={(e) => setData({ ...data, semester: e.target.value })}
              required
            >
              <option value="" disabled>-- Select Semester --</option>
              {[...Array(8).keys()].map(i => (
                <option key={i + 1} value={i + 1}>{`${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Semester`}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-neutral-dark mb-1">
              Select Branch <span className="text-red-500">*</span>
            </label>
            <select
              id="branch"
              className="w-full bg-neutral p-3 rounded-xl border border-neutral-medium focus:ring-1 focus:ring-primary focus:border-primary text-base outline-none transition duration-200 ease-in-out shadow-sm appearance-none pr-8"
              value={data.branch}
              onChange={(e) => setData({ ...data, branch: e.target.value })}
              required
            >
              <option value="" disabled>-- Select Branch --</option>
              {branch?.map((b) => (
                <option value={b.name} key={b._id || b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-neutral-dark mb-1">
              Select Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              className="w-full bg-neutral p-3 rounded-xl border border-neutral-medium focus:ring-1 focus:ring-primary focus:border-primary text-base outline-none transition duration-200 ease-in-out shadow-sm appearance-none pr-8"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              required
            >
              <option value="" disabled>-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-neutral-dark mb-1">
              Select Profile Picture (Optional)
            </label>
            <label
              htmlFor="file"
              className="w-full bg-neutral p-3 rounded-xl border border-neutral-medium focus-within:ring-1 focus-within:ring-primary focus-within:border-primary text-base outline-none transition duration-200 ease-in-out shadow-sm flex justify-center items-center cursor-pointer hover:bg-neutral-medium"
            >
              {previewImage ? "Change Picture" : "Upload Picture"}
              <span className="ml-2">
                <FiUpload />
              </span>
            </label>
            <input
              hidden
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {previewImage && (
            <div className="md:col-span-2 flex justify-center items-center p-4 border border-dashed border-neutral-medium rounded-xl">
              <img src={previewImage} alt="student profile preview" className="h-36 w-36 object-cover rounded-full shadow-soft" />
            </div>
          )}
          
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="btn btn-primary shadow-soft"
            >
              Add New Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
