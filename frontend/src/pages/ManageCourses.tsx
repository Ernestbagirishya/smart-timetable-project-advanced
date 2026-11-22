import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import type { Course } from "../types";
import { ArrowBack, Search, MenuBook } from "@mui/icons-material";

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAllCourses();
      setCourses(response.data.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
          color: "white",
        }}
      >
        <CircularProgress sx={{ color: "#667eea", mr: 2 }} />
        <Typography variant="h6">Loading Courses...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
        color: "white",
        px: { xs: 2, sm: 4, md: 6 },
        py: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Manage Courses
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <MenuBook sx={{ mr: 1, verticalAlign: "middle" }} />
            View and Manage All Courses
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/managerdashboard")}
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            color: "white",
            "&:hover": { borderColor: "white" },
          }}
        >
          Back
        </Button>
      </Box>

      {/* Stats Card */}
      <Card
        sx={{
          mb: 4,
          maxWidth: 400,
          mx: "auto",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          textAlign: "center",
          color: "white",
        }}
      >
        <CardContent>
          <Typography sx={{ opacity: 0.8 }}>Total Courses Available</Typography>
          <Typography variant="h4" fontWeight="bold">
            {loading ? <CircularProgress size={24} /> : courses.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset": { borderColor: "white" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "rgba(255,255,255,0.5)" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          color: "white",
          overflow: "auto",
        }}
      >
        <CardContent>
          {error && <Alert severity="error">{error}</Alert>}
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Course Code",
                  "Course Name",
                  "Credits",
                  "Type",
                  "Department",
                  "Classes",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell sx={{ color: "white" }}>
                    {course.courseCode}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {course.courseName}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {course.credits}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>{course.type}</TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {course.department?.name || "—"}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {course.classes?.map((cls) => cls.name).join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManageCourses;
