import React, { useState, useEffect } from 'react';
import Heading from '../../components/Heading';
import axios from 'axios';
import { baseApiURL } from '../../baseUrl';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [selected, setSelected] = useState('attendance');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

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

  const handleSearch = async () => {
    if (!selectedBranch || !selectedSemester) {
      toast.error('Please select branch and semester');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        branch: selectedBranch,
        semester: selectedSemester
      });

      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const url = `${baseApiURL()}/reports/attendance?${params}`;
      console.log('Making API request to:', url);

      const response = await axios.get(url);
      console.log('API response:', response.data);

      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        branch: selectedBranch,
        semester: selectedSemester
      });

      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      window.location.href = `${baseApiURL()}/reports/attendance/export?${params}`;
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      toast.error('Failed to export attendance data');
    }
  };

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Reports" />
        <div className="flex justify-end items-center w-full">
          <button
            className={`${
              selected === 'attendance' && 'border-b-2 '
            }border-blue-500 px-4 py-2 text-black rounded-sm mr-6`}
            onClick={() => setSelected('attendance')}
          >
            Attendance Reports
          </button>
        </div>
      </div>

      {selected === 'attendance' && (
        <div className="w-full mt-8">
          <div className="flex gap-4 mb-6">
            <select
              className="px-4 py-2 border border-gray-300 rounded"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </button>

            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleExport}
              disabled={loading || attendanceData.length === 0}
            >
              Export to Excel
            </button>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment No
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Total Classes
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((student) => (
                    <tr key={student.enrollmentNo}>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {student.enrollmentNo}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {student.totalClasses}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {student.presentClasses}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {student.totalClasses - student.presentClasses}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {student.attendancePercentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {attendanceData.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center border-b border-gray-200">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;