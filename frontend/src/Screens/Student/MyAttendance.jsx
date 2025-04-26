import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseApiURL } from '../../baseUrl';
import { FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const MyAttendance = () => {
  const [viewType, setViewType] = useState('daily');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state) => state.userData);

  useEffect(() => {
    if (userData?.enrollmentNo) {
      fetchAttendance(userData.enrollmentNo);
    }
  }, [viewType, userData?.enrollmentNo]);

  const fetchAttendance = async (enrollmentNo) => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseApiURL()}/attendance/student`, {
        params: {
          enrollmentNo,
          viewType
        }
      });

      if (response.data.success) {
        setAttendanceData(response.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error(error.response?.data?.message || 'Error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAttendanceStats = () => {
    if (!attendanceData?.statistics) return null;

    const { totalClasses, presentClasses, attendancePercentage } = attendanceData.statistics;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Classes</h3>
          <p className="text-3xl font-bold text-primary">{totalClasses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Classes Attended</h3>
          <p className="text-3xl font-bold text-green-600">{presentClasses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Attendance Percentage</h3>
          <p className="text-3xl font-bold text-blue-600">{attendancePercentage}%</p>
        </div>
      </div>
    );
  };

  const renderAttendanceList = () => {
    if (!attendanceData?.records) return null;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.records.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.isPresent ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="mr-1" /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiX className="mr-1" /> Absent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600">View your attendance records</p>
      </div>

      {/* View Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setViewType('daily')}
              className={`${
                viewType === 'daily'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FiCalendar className="inline-block mr-2" />
              Daily View
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={`${
                viewType === 'monthly'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FiCalendar className="inline-block mr-2" />
              Monthly View
            </button>
            <button
              onClick={() => setViewType('semester')}
              className={`${
                viewType === 'semester'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FiCalendar className="inline-block mr-2" />
              Semester View
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {renderAttendanceStats()}
          {renderAttendanceList()}
        </>
      )}
    </div>
  );
};

export default MyAttendance;