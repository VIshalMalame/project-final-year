import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { baseApiURL } from '../../utils/api';
import { toast } from 'react-toastify';

const AttendanceReports = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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
      toast.warning('Please select branch and semester');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        branch: selectedBranch,
        semester: selectedSemester
      });

      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      const url = `${baseApiURL()}/reports/attendance?${params}`;
      console.log('Making API request to:', url);

      const response = await axios.get(url);
      console.log('API response:', response.data);

      if (response.data.success) {
        const formattedData = response.data.data.map(student => ({
          ...student,
          absentClasses: student.totalClasses - student.presentClasses,
          attendancePercentage: parseFloat(student.attendancePercentage.toFixed(2))
        }));
        setAttendanceData(formattedData);
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
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }

      window.location.href = `${baseApiURL()}/reports/export-attendance?${params}`;
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      toast.error('Failed to export attendance data');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Attendance Reports
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Branch</InputLabel>
              <Select
                value={selectedBranch}
                label="Branch"
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch._id} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Semester"
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={loading || attendanceData.length === 0}
          >
            Export to Excel
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Enrollment No</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Total Classes</TableCell>
                <TableCell>Present</TableCell>
                <TableCell>Absent</TableCell>
                <TableCell>Attendance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((student) => (
                <TableRow key={student.enrollmentNo}>
                  <TableCell>{student.enrollmentNo}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.totalClasses}</TableCell>
                  <TableCell>{student.presentClasses}</TableCell>
                  <TableCell>{student.absentClasses}</TableCell>
                  <TableCell>{student.attendancePercentage}%</TableCell>
                </TableRow>
              ))}
              {attendanceData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AttendanceReports; 