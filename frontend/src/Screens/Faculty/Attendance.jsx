import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseApiURL } from '../../baseUrl';
import toast from 'react-hot-toast';
import { FiSearch, FiCheck, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

function Attendance() {
  const location = useLocation();
  const facultyId = location.state?.loginid;

  // Get current date in IST
  const getCurrentISTDate = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5:30 hours for IST
    return istTime.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: getCurrentISTDate(),
    branch: '',
    semester: '',
    subject: '',
  });
  
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/branch/getBranch`);
        if (response.data.success) {
          setBranches(response.data.branches);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to fetch branches');
      }
    };
    fetchBranches();
  }, []);

  // Fetch subjects when branch and semester are selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.branch || !formData.semester) {
        setSubjects([]); // Clear subjects when either branch or semester is not selected
        return;
      }

      try {
        const response = await axios.get(
          `${baseApiURL()}/subject/getSubject`, {
            params: {
              branch: formData.branch,
              semester: parseInt(formData.semester)
            }
          }
        );
        if (response.data.success) {
          // Filter subjects based on branch and semester
          const filteredSubjects = response.data.subject.filter(
            subject => subject.branch === formData.branch && 
                      subject.semester === parseInt(formData.semester)
          );
          setSubjects(filteredSubjects);
          console.log('Filtered subjects:', filteredSubjects);
        } else {
          console.error("Failed to fetch subjects:", response.data.message);
          setSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error.response?.data || error.message);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [formData.branch, formData.semester]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent date from being changed
    if (name === 'date') return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.branch || !formData.semester || !formData.subject) {
      toast.error('Please select all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching students for branch: ${formData.branch}, semester: ${formData.semester}`);
      const response = await axios.get(
        `${baseApiURL()}/attendance/students/${formData.branch}/${formData.semester}`
      );
      
      if (response.data.success) {
        console.log(`Received ${response.data.students.length} students`);
        const studentsWithAttendance = response.data.students.map(student => ({
          ...student,
          isPresent: true // Default all students as present
        }));
        setStudents(studentsWithAttendance);
        setShowAttendanceForm(true);
      } else {
        toast.error(response.data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceToggle = (enrollmentNo) => {
    setStudents(prev =>
      prev.map(student =>
        student.enrollmentNo === enrollmentNo
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };

  const handleSubmitAttendance = async () => {
    if (!students.length) {
      toast.error('No students to mark attendance for');
      return;
    }

    const attendanceData = {
      date: formData.date,
      branch: formData.branch,
      semester: formData.semester,
      subject: formData.subject,
      facultyId,
      attendance: students.map(student => ({
        enrollmentNo: student.enrollmentNo,
        isPresent: student.isPresent
      }))
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${baseApiURL()}/attendance/mark`,
        attendanceData
      );
      if (response.data.success) {
        toast.success('Attendance marked successfully');
        // Reset form
        setShowAttendanceForm(false);
        setStudents([]);
        setFormData(prev => ({
          ...prev,
          branch: '',
          semester: '',
          subject: ''
        }));
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollmentNo.toString().includes(searchQuery)
  );

  return (
    <div className="w-full p-6 md:p-8 lg:p-10 space-y-8">
      <div className="bg-white rounded-2xl shadow-soft-md p-6">
        <h2 className="text-2xl font-semibold text-neutral-dark border-b pb-4 mb-6">Mark Attendance</h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              className="w-full bg-neutral-light p-3 rounded-xl border focus:ring-1 focus:ring-primary focus:border-primary cursor-not-allowed"
              required
              disabled
            />
            <p className="mt-1 text-xs text-neutral-medium">Current date in IST</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full bg-neutral p-3 rounded-xl border focus:ring-1 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full bg-neutral p-3 rounded-xl border focus:ring-1 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full bg-neutral p-3 rounded-xl border focus:ring-1 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 py-3 rounded-xl shadow-soft flex items-center gap-2"
            >
              <FiSearch className="w-5 h-5" />
              {loading ? 'Loading...' : 'Get Students'}
            </button>
          </div>
        </form>

        {/* Attendance Marking Section */}
        {showAttendanceForm && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
              <h3 className="text-xl font-semibold text-neutral-dark">
                Student Attendance
              </h3>
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-medium">
                <thead>
                  <tr className="bg-neutral">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                      Enrollment No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-medium">
                  {filteredStudents.map((student) => (
                    <tr key={student.enrollmentNo} className="hover:bg-neutral transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-dark">
                        {student.enrollmentNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                        {`${student.firstName} ${student.lastName}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleAttendanceToggle(student.enrollmentNo)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            student.isPresent
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {student.isPresent ? <FiCheck /> : <FiX />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-neutral-medium">
              <button
                onClick={handleSubmitAttendance}
                disabled={loading}
                className="btn btn-primary px-6 py-3 rounded-xl shadow-soft"
              >
                {loading ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;
