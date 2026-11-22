import React, { useEffect, useState } from "react";
import {
  Container,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  alpha,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Delete,
  Assignment,
  School,
  Groups,
  Person,
  Search,
  FilterList,
  Edit,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  courseAPI,
  lecturerAPI,
  classAPI,
  assignmentAPI,
} from "../services/api";
import type { Course } from "../types";

interface Assignment {
  id: number;
  courseId: number;
  lecturerId: number;
  classId: number;
  course: { courseCode: string; courseName: string };
  lecturer: { fullName: string };
  class: { name: string };
}

const HodManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    credits: 0,
    type: "",
    classIds: [] as number[],
  });
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    courseId: 0,
    lecturerId: 0,
    classId: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(
    null
  );

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        coursesRes,
        lecturersRes,
        classesRes,
        allClassesRes,
        assignmentsRes,
      ] = await Promise.all([
        courseAPI.getDepartmentCourses(),
        lecturerAPI.getAvailable(),
        classAPI.getDepartmentClasses(),
        classAPI.getAllClasses(),
        assignmentAPI.getDepartmentAssignments(),
      ]);
      setCourses(coursesRes.data);
      setLecturers(lecturersRes.data);
      setClasses(classesRes.data);
      setAllClasses(allClassesRes.data);
      setAssignments(assignmentsRes.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async () => {
    try {
      await courseAPI.create(newCourse);
      setOpenCreateDialog(false);
      setNewCourse({
        courseCode: "",
        courseName: "",
        credits: 0,
        type: "",
        classIds: [],
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await courseAPI.delete(courseToDelete);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    try {
      await assignmentAPI.delete(assignmentToDelete);
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete assignment");
    }
  };

  const handleOpenAssignDialog = (courseId: number) => {
    setSelectedCourseId(courseId);
    setAssignmentData({ courseId, lecturerId: 0, classId: 0 });
    setOpenAssignDialog(true);
  };

  const getAvailableClassesForCourse = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.type === "GENERAL" ? allClasses : classes;
  };

  const handleCreateAssignment = async () => {
    // Check if a lecturer is already assigned to this course in this class
    const existingAssignment = assignments.find(
      (assignment) =>
        assignment.courseId === assignmentData.courseId &&
        assignment.classId === assignmentData.classId
    );
    if (existingAssignment) {
      setError("A lecturer is already assigned to this course in this class.");
      return;
    }

    try {
      await assignmentAPI.create(assignmentData);
      setOpenAssignDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create assignment");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.course.courseCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.course.courseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.lecturer.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const totalCourses = courses.length;
  const totalAssignments = assignments.length;
  const coreCourses = courses.filter((course) => course.type === "CORE").length;
  const generalCourses = courses.filter(
    (course) => course.type === "GENERAL"
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background:
          "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
        color: "white",
        position: "relative",
        overflow: "auto",
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
          `,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  Manage Department Courses
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <School sx={{ fontSize: 20 }} />
                  Course catalog and assignment management
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/hoddashboard")}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  background: "rgba(255, 255, 255, 0.05)",
                  "&:hover": {
                    borderColor: "white",
                    background: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Back to Dashboard
              </Button>
            </Box>

            {/* Statistics Cards */}
            <Zoom in timeout={1000} style={{ transitionDelay: "200ms" }}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <School sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalCourses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Courses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <Assignment
                        sx={{ fontSize: 40, color: "#43e97b", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalAssignments}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Assignments
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <Person sx={{ fontSize: 40, color: "#f5576c", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {coreCourses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Core Courses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <Groups sx={{ fontSize: 40, color: "#4facfe", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {generalCourses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        General Courses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Zoom>
          </Box>
        </Fade>

        {error && (
          <Fade in timeout={300}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Action Bar */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <TextField
              placeholder="Search courses or assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                },
              }}
            >
              Create Course
            </Button>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {/* Courses Table */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1000} style={{ transitionDelay: "600ms" }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <School />
                    Department Courses
                  </Typography>

                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", my: 4 }}
                    >
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </Box>
                  ) : (
                    <Paper
                      sx={{
                        background: "rgba(255, 255, 255, 0.02)",
                        overflow: "auto",
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Course
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Credits
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Type
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCourses.map((course) => (
                            <TableRow
                              key={course.id}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "white",
                                  borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <Box>
                                  <Typography fontWeight={600}>
                                    {course.courseCode}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.8 }}
                                  >
                                    {course.courseName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ opacity: 0.6 }}
                                  >
                                    {course.classes
                                      .map((cls) => cls.name)
                                      .join(", ")}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <Chip
                                  label={`${course.credits} Credits`}
                                  size="small"
                                  sx={{
                                    background: "rgba(102, 126, 234, 0.2)",
                                    color: "#667eea",
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                              >
                                <Chip
                                  label={course.type}
                                  size="small"
                                  sx={{
                                    background:
                                      course.type === "CORE"
                                        ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
                                        : "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                              >
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleOpenAssignDialog(course.id)
                                    }
                                    sx={{
                                      borderColor: "rgba(67, 233, 123, 0.5)",
                                      color: "#43e97b",
                                      "&:hover": {
                                        borderColor: "#43e97b",
                                        background: "rgba(67, 233, 123, 0.1)",
                                      },
                                    }}
                                  >
                                    Assign
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setCourseToDelete(course.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                    sx={{
                                      borderColor: "rgba(245, 87, 108, 0.5)",
                                      color: "#f5576c",
                                      "&:hover": {
                                        borderColor: "#f5576c",
                                        background: "rgba(245, 87, 108, 0.1)",
                                      },
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Assignments Table */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1000} style={{ transitionDelay: "800ms" }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Assignment />
                    Course Assignments
                  </Typography>

                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", my: 4 }}
                    >
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </Box>
                  ) : (
                    <Paper
                      sx={{
                        background: "rgba(255, 255, 255, 0.02)",
                        overflow: "auto",
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Course
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Lecturer
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Class
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredAssignments.map((assignment) => (
                            <TableRow
                              key={assignment.id}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "white",
                                  borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <Box>
                                  <Typography fontWeight={600}>
                                    {assignment.course.courseCode}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.8 }}
                                  >
                                    {assignment.course.courseName}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                {assignment.lecturer.fullName}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "white",
                                  borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <Chip
                                  label={assignment.class.name}
                                  size="small"
                                  sx={{
                                    background: "rgba(102, 126, 234, 0.2)",
                                    color: "#667eea",
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setAssignmentToDelete(assignment.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  sx={{
                                    borderColor: "rgba(245, 87, 108, 0.5)",
                                    color: "#f5576c",
                                    "&:hover": {
                                      borderColor: "#f5576c",
                                      background: "rgba(245, 87, 108, 0.1)",
                                    },
                                  }}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Create Course Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
              color: "white",
            },
          }}
        >
          <DialogTitle
            sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            Create New Course
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              label="Course Code"
              fullWidth
              margin="normal"
              value={newCourse.courseCode}
              onChange={(e) =>
                setNewCourse({ ...newCourse, courseCode: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />
            <TextField
              label="Course Name"
              fullWidth
              margin="normal"
              value={newCourse.courseName}
              onChange={(e) =>
                setNewCourse({ ...newCourse, courseName: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />
            <TextField
              label="Credits"
              type="number"
              fullWidth
              margin="normal"
              value={newCourse.credits}
              onChange={(e) =>
                setNewCourse({ ...newCourse, credits: Number(e.target.value) })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Type
              </InputLabel>
              <Select
                value={newCourse.type}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, type: e.target.value })
                }
                label="Type"
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                  },
                }}
              >
                <MenuItem value="CORE">CORE</MenuItem>
                <MenuItem value="GENERAL">GENERAL</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Classes
              </InputLabel>
              <Select
                multiple
                value={newCourse.classIds}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    classIds:
                      typeof e.target.value === "string"
                        ? e.target.value.split(",").map(Number)
                        : e.target.value,
                  })
                }
                label="Classes"
                renderValue={(selected) => {
                  const availableClasses =
                    newCourse.type === "GENERAL" ? allClasses : classes;
                  return availableClasses
                    .filter((cls) => selected.includes(cls.id))
                    .map((cls) => cls.name)
                    .join(", ");
                }}
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                  },
                }}
              >
                {(newCourse.type === "GENERAL" ? allClasses : classes).map(
                  (cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setOpenCreateDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateCourse}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                },
              }}
            >
              Create Course
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Lecturer & Class Dialog */}
        <Dialog
          open={openAssignDialog}
          onClose={() => setOpenAssignDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
              color: "white",
            },
          }}
        >
          <DialogTitle
            sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            Assign Lecturer and Class
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Lecturer
              </InputLabel>
              <Select
                value={assignmentData.lecturerId}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    lecturerId: Number(e.target.value),
                  })
                }
                label="Lecturer"
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                  },
                }}
              >
                <MenuItem value={0} disabled>
                  Select Lecturer
                </MenuItem>
                {lecturers.map((lecturer) => (
                  <MenuItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Class
              </InputLabel>
              <Select
                value={assignmentData.classId}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    classId: Number(e.target.value),
                  })
                }
                label="Class"
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#667eea",
                  },
                }}
              >
                <MenuItem value={0} disabled>
                  Select Class
                </MenuItem>
                {selectedCourseId &&
                  getAvailableClassesForCourse(selectedCourseId).map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setOpenAssignDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateAssignment}
              disabled={
                assignmentData.lecturerId === 0 ||
                assignmentData.classId === 0 ||
                selectedCourseId === null
              }
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)",
                },
              }}
            >
              Create Assignment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
              color: "white",
            },
          }}
        >
          <DialogTitle
            sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Warning sx={{ color: "#f5576c", fontSize: 40 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {courseToDelete ? "Delete Course" : "Delete Assignment"}
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Are you sure you want to delete this{" "}
                  {courseToDelete ? "course" : "assignment"}? This action cannot
                  be undone.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                courseToDelete ? handleDeleteCourse : handleDeleteAssignment
              }
              variant="contained"
              color="error"
              sx={{
                background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default HodManageCourses;
