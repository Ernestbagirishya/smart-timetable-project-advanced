import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Zoom,
  Chip,
  Paper,
  InputAdornment,
  alpha,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  Assignment,
  CalendarToday,
  School,
  Warning,
  Search,
  FilterList,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { catAPI, dashboardAPI } from "../services/api";

interface CatPlan {
  id: number;
  courseId: number;
  classId: number;
  title: string;
  description?: string;
  maxMarks: number;
  dueDate: string;
  status: string;
  createdAt: string;
  course: {
    courseCode: string;
    courseName: string;
  };
  class: {
    name: string;
  };
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
}

const LecturerManageCatPlans: React.FC = () => {
  const [catPlans, setCatPlans] = useState<CatPlan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CatPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    maxMarks: "",
    dueDate: "",
  });

  const navigate = useNavigate();

  const fetchCatPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await catAPI.getMyPlans();
      setCatPlans(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load CAT plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await dashboardAPI.getLecturerCourses();
      setCourses(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load courses");
    }
  };

  useEffect(() => {
    fetchCatPlans();
    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateOpen = () => {
    setFormData({
      courseId: "",
      title: "",
      description: "",
      maxMarks: "",
      dueDate: "",
    });
    setOpenCreateDialog(true);
  };

  const handleCreateClose = () => {
    setOpenCreateDialog(false);
  };

  const handleEditOpen = (plan: CatPlan) => {
    setSelectedPlan(plan);
    setFormData({
      courseId: plan.courseId.toString(),
      title: plan.title,
      description: plan.description || "",
      maxMarks: plan.maxMarks.toString(),
      dueDate: plan.dueDate.split("T")[0],
    });
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    setSelectedPlan(null);
  };

  const handleDeleteOpen = (plan: CatPlan) => {
    setSelectedPlan(plan);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
    setSelectedPlan(null);
  };

  const handleCreateSubmit = async () => {
    try {
      if (
        !formData.courseId ||
        !formData.title ||
        !formData.maxMarks ||
        !formData.dueDate
      ) {
        setError("Please fill in all required fields");
        return;
      }

      const maxMarksNum = Number(formData.maxMarks);
      if (isNaN(maxMarksNum) || maxMarksNum < 1) {
        setError("Maximum marks must be a number greater than 0");
        return;
      }

      const dueDateObj = new Date(formData.dueDate);
      if (isNaN(dueDateObj.getTime())) {
        setError("Invalid due date format");
        return;
      }

      const payload = {
        courseId: Number(formData.courseId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        maxMarks: maxMarksNum,
        dueDate: dueDateObj.toISOString(),
      };
      await catAPI.create(payload);
      setSuccessMessage(
        "CAT plans created successfully for all assigned classes"
      );
      setOpenCreateDialog(false);
      fetchCatPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create CAT plan");
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedPlan) return;
    try {
      const maxMarksNum = Number(formData.maxMarks);
      if (isNaN(maxMarksNum) || maxMarksNum < 1) {
        setError("Maximum marks must be a number greater than 0");
        return;
      }
      if (!formData.dueDate || isNaN(Date.parse(formData.dueDate))) {
        setError("Invalid due date format");
        return;
      }
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        maxMarks: maxMarksNum,
        dueDate: formData.dueDate,
      };
      await catAPI.update(selectedPlan.id, payload);
      setSuccessMessage("CAT plan updated successfully");
      setOpenEditDialog(false);
      setSelectedPlan(null);
      fetchCatPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update CAT plan");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedPlan) return;
    try {
      await catAPI.delete(selectedPlan.id);
      setSuccessMessage("CAT plan deleted successfully");
      setOpenDeleteDialog(false);
      setSelectedPlan(null);
      fetchCatPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete CAT plan");
    }
  };

  const filteredCatPlans = catPlans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.class.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlans = catPlans.length;
  const pendingPlans = catPlans.filter(
    (plan) => plan.status === "PENDING"
  ).length;
  const activePlans = catPlans.filter(
    (plan) => plan.status === "ACTIVE"
  ).length;
  const completedPlans = catPlans.filter(
    (plan) => plan.status === "COMPLETED"
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
                  Manage CAT Plans
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
                  <Assignment sx={{ fontSize: 20 }} />
                  Create and manage Continuous Assessment Tests
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/lecturedashboard")}
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
                      <Assignment
                        sx={{ fontSize: 40, color: "#667eea", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalPlans}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total CAT Plans
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
                      <School sx={{ fontSize: 40, color: "#43e97b", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {pendingPlans}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pending Plans
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
                      <CalendarToday
                        sx={{ fontSize: 40, color: "#f5576c", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {activePlans}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Active Plans
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
                      <Warning sx={{ fontSize: 40, color: "#4facfe", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {completedPlans}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Completed
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
              placeholder="Search CAT plans..."
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
              onClick={handleCreateOpen}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                },
              }}
            >
              Create CAT Plan
            </Button>
          </Box>
        </Fade>

        {/* CAT Plans Table */}
        <Fade in timeout={1000} style={{ transitionDelay: "600ms" }}>
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              color: "white",
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
                CAT Plans Overview
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
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
                          Course & Class
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Title & Description
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Marks & Due Date
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Status
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
                      {filteredCatPlans.map((plan) => (
                        <TableRow
                          key={plan.id}
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
                                {plan.course.courseCode} -{" "}
                                {plan.course.courseName}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Class: {plan.class.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Box>
                              <Typography fontWeight={600}>
                                {plan.title}
                              </Typography>
                              {plan.description && (
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8, mt: 0.5 }}
                                >
                                  {plan.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <School sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography fontWeight={600}>
                                {plan.maxMarks} marks
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CalendarToday
                                sx={{ fontSize: 16, opacity: 0.7 }}
                              />
                              <Typography variant="body2">
                                {new Date(plan.dueDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                          >
                            <Chip
                              label={plan.status}
                              size="small"
                              sx={{
                                background:
                                  plan.status === "PENDING"
                                    ? "rgba(255, 193, 7, 0.2)"
                                    : plan.status === "ACTIVE"
                                    ? "rgba(67, 233, 123, 0.2)"
                                    : "rgba(102, 126, 234, 0.2)",
                                color:
                                  plan.status === "PENDING"
                                    ? "#ffc107"
                                    : plan.status === "ACTIVE"
                                    ? "#43e97b"
                                    : "#667eea",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                          >
                            {plan.status === "PENDING" && (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => handleEditOpen(plan)}
                                  sx={{
                                    borderColor: "rgba(102, 126, 234, 0.5)",
                                    color: "#667eea",
                                    "&:hover": {
                                      borderColor: "#667eea",
                                      background: "rgba(102, 126, 234, 0.1)",
                                    },
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<Delete />}
                                  onClick={() => handleDeleteOpen(plan)}
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
                            )}
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

        {/* Create Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={handleCreateClose}
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
            Create CAT Plan
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Select Course
              </InputLabel>
              <Select
                name="courseId"
                value={formData.courseId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, courseId: e.target.value }))
                }
                label="Select Course"
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
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id.toString()}>
                    {course.courseCode} - {course.courseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              label="Title"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleInputChange}
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
              margin="normal"
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
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
              margin="normal"
              label="Max Marks"
              name="maxMarks"
              type="number"
              fullWidth
              value={formData.maxMarks}
              onChange={handleInputChange}
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
              margin="normal"
              label="Due Date"
              name="dueDate"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={handleInputChange}
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
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={handleCreateClose}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateSubmit}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                },
              }}
            >
              Create Plan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={handleEditClose}
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
            Edit CAT Plan
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              label="Title"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleInputChange}
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
              margin="normal"
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
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
              margin="normal"
              label="Max Marks"
              name="maxMarks"
              type="number"
              fullWidth
              value={formData.maxMarks}
              onChange={handleInputChange}
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
              margin="normal"
              label="Due Date"
              name="dueDate"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={handleInputChange}
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
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={handleEditClose}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSubmit}
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)",
                },
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleDeleteClose}
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
            Confirm CAT Plan Deletion
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Warning sx={{ color: "#f5576c", fontSize: 40 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Delete CAT Plan
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Are you sure you want to delete this CAT plan? This action
                  cannot be undone and will remove all associated data.
                </Typography>
                {selectedPlan && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, opacity: 0.9, fontWeight: 600 }}
                  >
                    {selectedPlan.title} - {selectedPlan.course.courseCode} -{" "}
                    {selectedPlan.class.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={handleDeleteClose}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSubmit}
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
              Delete Plan
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
        >
          <Alert
            severity="success"
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default LecturerManageCatPlans;
