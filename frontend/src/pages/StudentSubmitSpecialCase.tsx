import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Paper,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip,
  InputAdornment,
  alpha,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ArrowBack,
  Warning,
  Description,
  School,
  CalendarToday,
  Edit,
  Delete,
  Upload,
  Download,
  CheckCircle,
  Pending,
  Cancel,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  specialCaseAPI,
  studentAPI,
  resourceAPI,
  BACKEND_BASE_URL,
} from "../services/api";

const StudentSubmitSpecialCase: React.FC = () => {
  const [formData, setFormData] = useState({
    type: "",
    courseId: "",
    description: "",
    evidence: null as File | null,
  });
  const [courses, setCourses] = useState<
    { id: number; courseCode: string; courseName: string }[]
  >([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [specialCases, setSpecialCases] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await studentAPI.getMyCourses();
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };

    const fetchSpecialCases = async () => {
      try {
        const response = await specialCaseAPI.getMyCases();
        setSpecialCases(response.data);
      } catch (error) {
        console.error("Failed to fetch special cases", error);
      }
    };

    fetchCourses();
    fetchSpecialCases();
  }, []);

  const resetForm = () => {
    setFormData({
      type: "",
      courseId: "",
      description: "",
      evidence: null,
    });
    setEditId(null);
    setEditMode(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        evidence: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.type || !formData.courseId || !formData.description) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      let evidenceUrl = undefined;
      if (formData.evidence && typeof formData.evidence !== "string") {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.evidence);
        try {
          const uploadResponse = await resourceAPI.upload(uploadFormData);
          evidenceUrl = uploadResponse.data.fileUrl;
        } catch (uploadErr: any) {
          setError(
            uploadErr.response?.data?.message ||
              "Failed to upload evidence file"
          );
          setLoading(false);
          return;
        }
      } else if (typeof formData.evidence === "string") {
        evidenceUrl = formData.evidence;
      }

      const specialCaseData = {
        type: formData.type,
        courseId: parseInt(formData.courseId),
        description: formData.description.trim(),
        evidence: evidenceUrl,
      };

      if (editMode && editId !== null) {
        await specialCaseAPI.update(editId, specialCaseData);
        setSuccess("Special case updated successfully");
      } else {
        await specialCaseAPI.create(specialCaseData);
        setSuccess("Special case submitted successfully");
      }

      resetForm();
      // Refresh list
      const response = await specialCaseAPI.getMyCases();
      setSpecialCases(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit special case");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (specialCase: any) => {
    setEditMode(true);
    setEditId(specialCase.id);
    setFormData({
      type: specialCase.type,
      courseId: specialCase.courseId.toString(),
      description: specialCase.description,
      evidence: specialCase.evidence || null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id: number) => {
    setCaseToDelete(id);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!caseToDelete) return;

    setDeleteLoading(true);
    setError("");
    setSuccess("");
    try {
      await specialCaseAPI.delete(caseToDelete);
      setSuccess("Special case deleted successfully");
      // Refresh list
      const response = await specialCaseAPI.getMyCases();
      setSpecialCases(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete special case");
    } finally {
      setDeleteLoading(false);
      setDialogOpen(false);
      setCaseToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "rgba(76, 175, 80, 0.2)",
          color: "#4caf50",
          icon: <CheckCircle />,
        };
      case "PENDING":
        return {
          bg: "rgba(255, 193, 7, 0.2)",
          color: "#ffc107",
          icon: <Pending />,
        };
      case "REJECTED":
        return {
          bg: "rgba(244, 67, 54, 0.2)",
          color: "#f44336",
          icon: <Cancel />,
        };
      default:
        return {
          bg: "rgba(158, 158, 158, 0.2)",
          color: "#9e9e9e",
          icon: <Pending />,
        };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "RETAKE":
        return { bg: "rgba(156, 39, 176, 0.2)", color: "#9c27b0" };
      case "SPECIAL":
        return { bg: "rgba(33, 150, 243, 0.2)", color: "#2196f3" };
      case "REASSESSMENT":
        return { bg: "rgba(255, 152, 0, 0.2)", color: "#ff9800" };
      default:
        return { bg: "rgba(158, 158, 158, 0.2)", color: "#9e9e9e" };
    }
  };

  const pendingCases = specialCases.filter(
    (sc) => sc.status === "PENDING"
  ).length;
  const approvedCases = specialCases.filter(
    (sc) => sc.status === "APPROVED"
  ).length;
  const totalCases = specialCases.length;

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
                  {editMode ? "Update Special Case" : "Submit Special Case"}
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
                  <Warning sx={{ fontSize: 20 }} />
                  Request special consideration for academic circumstances
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/studentdashboard")}
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
                <Grid item xs={12} sm={4}>
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
                      <Warning sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalCases}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Cases
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                      <Pending sx={{ fontSize: 40, color: "#ffc107", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {pendingCases}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pending
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                      <CheckCircle
                        sx={{ fontSize: 40, color: "#43e97b", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {approvedCases}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Approved
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

        {success && (
          <Fade in timeout={300}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              {success}
            </Alert>
          </Fade>
        )}

        {/* Submission Form */}
        {/* Submission Form */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
              color: "white",
              mb: 4,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                  p: 2,
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Description sx={{ fontSize: 24, color: "white" }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {editMode ? "Update Your Request" : "Submit New Request"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    {editMode
                      ? "Update your special consideration request details below"
                      : "Fill in the details below to submit a new special consideration request"}
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <Grid container spacing={3}>
                  {/* Request Type with Enhanced Styling */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ position: "relative" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#a5b4fc",
                        }}
                      >
                        <Warning sx={{ fontSize: 18 }} />
                        Request Type *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(165, 180, 252, 0.3)",
                              borderWidth: "2px",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(165, 180, 252, 0.6)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#a5b4fc",
                              boxShadow: "0 0 0 2px rgba(165, 180, 252, 0.2)",
                            },
                          },
                          "& .MuiSelect-icon": {
                            color: "rgba(255, 255, 255, 0.7)",
                          },
                        }}
                      >
                        <MenuItem value="RETAKE">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#9c27b0",
                              }}
                            />
                            <Typography>Retake Request</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="SPECIAL">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#2196f3",
                              }}
                            />
                            <Typography>Special Consideration</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="REASSESSMENT">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#ff9800",
                              }}
                            />
                            <Typography>Reassessment</Typography>
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Box>
                  </Grid>

                  {/* Course Selection with Enhanced Styling */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ position: "relative" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#a5b4fc",
                        }}
                      >
                        <School sx={{ fontSize: 18 }} />
                        Course *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(165, 180, 252, 0.3)",
                              borderWidth: "2px",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(165, 180, 252, 0.6)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#a5b4fc",
                              boxShadow: "0 0 0 2px rgba(165, 180, 252, 0.2)",
                            },
                          },
                          "& .MuiSelect-icon": {
                            color: "rgba(255, 255, 255, 0.7)",
                          },
                        }}
                      >
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            <Box>
                              <Typography fontWeight={600}>
                                {course.courseCode}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {course.courseName}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>

                  {/* Description with Character Counter */}
                  <Grid item xs={12}>
                    <Box sx={{ position: "relative" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#a5b4fc",
                        }}
                      >
                        <Description sx={{ fontSize: 18 }} />
                        Description *
                      </Typography>
                      <TextField
                        fullWidth
                        name="description"
                        multiline
                        rows={1}
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Please provide a detailed explanation of your circumstances and why you need special consideration..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              borderColor: "rgba(165, 180, 252, 0.3)",
                              borderWidth: "2px",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(165, 180, 252, 0.6)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#a5b4fc",
                              boxShadow: "0 0 0 2px rgba(165, 180, 252, 0.2)",
                            },
                            "& textarea": {
                              resize: "vertical",
                              minHeight: "80px",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255, 255, 255, 0.7)",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          right: 12,
                          bottom: 8,
                          opacity: 0.6,
                          color:
                            formData.description.length > 250
                              ? "#f5576c"
                              : "inherit",
                        }}
                      >
                        {formData.description.length}/250
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, mt: 1, display: "block" }}
                    >
                      Be specific about your situation and provide relevant
                      details to help with the assessment.
                    </Typography>
                  </Grid>

                  {/* File Upload with Enhanced Styling */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 3,
                        border: "2px dashed rgba(165, 180, 252, 0.3)",
                        borderRadius: 2,
                        background: "rgba(165, 180, 252, 0.05)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "rgba(165, 180, 252, 0.6)",
                          background: "rgba(165, 180, 252, 0.08)",
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#a5b4fc",
                        }}
                      >
                        <Upload sx={{ fontSize: 18 }} />
                        Supporting Evidence (Optional)
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                          sx={{
                            borderColor: "rgba(102, 126, 234, 0.5)",
                            color: "#667eea",
                            background: "rgba(102, 126, 234, 0.1)",
                            "&:hover": {
                              borderColor: "#667eea",
                              background: "rgba(102, 126, 234, 0.2)",
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.3s ease",
                            py: 1.5,
                            px: 3,
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        >
                          Choose File
                          <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </Button>

                        {formData.evidence &&
                          typeof formData.evidence !== "string" && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.5,
                                background: "rgba(76, 175, 80, 0.1)",
                                borderRadius: 1,
                                border: "1px solid rgba(76, 175, 80, 0.3)",
                              }}
                            >
                              <CheckCircle
                                sx={{ color: "#4caf50", fontSize: 20 }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "#4caf50", fontWeight: 600 }}
                              >
                                {formData.evidence.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8, ml: 1 }}
                              >
                                (
                                {(formData.evidence.size / 1024 / 1024).toFixed(
                                  2
                                )}{" "}
                                MB)
                              </Typography>
                            </Box>
                          )}

                        {formData.evidence &&
                          typeof formData.evidence === "string" && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.5,
                                background: "rgba(33, 150, 243, 0.1)",
                                borderRadius: 1,
                                border: "1px solid rgba(33, 150, 243, 0.3)",
                              }}
                            >
                              <Visibility
                                sx={{ color: "#2196f3", fontSize: 20 }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "#2196f3", fontWeight: 600 }}
                              >
                                Current file attached
                              </Typography>
                              <Button
                                size="small"
                                href={formData.evidence}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  color: "#2196f3",
                                  textTransform: "none",
                                  ml: 1,
                                  minWidth: "auto",
                                }}
                              >
                                View
                              </Button>
                            </Box>
                          )}
                      </Box>

                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, mt: 2, display: "block" }}
                      >
                        Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max:
                        10MB)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Form Actions */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                      },
                      "&:disabled": {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.3)",
                      },
                      py: 2,
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: "1rem",
                      flex: 1,
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {loading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CircularProgress size={20} color="inherit" />
                        <Typography>
                          {editMode ? "Updating..." : "Submitting..."}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircle sx={{ fontSize: 20 }} />
                        <Typography>
                          {editMode ? "Update Request" : "Submit Request"}
                        </Typography>
                      </Box>
                    )}
                  </Button>

                  {editMode && (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      sx={{
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        background: "rgba(255, 255, 255, 0.05)",
                        "&:hover": {
                          borderColor: "white",
                          background: "rgba(255, 255, 255, 0.1)",
                          transform: "translateY(-2px)",
                        },
                        py: 2,
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 600,
                        flex: { xs: 1, sm: 0.5 },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>

                {/* Form Guidelines */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 2,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "#a5b4fc" }}
                  >
                    📋 Submission Guidelines
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0, opacity: 0.8 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Provide clear and honest details about your circumstances
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Include supporting evidence when available (medical
                      certificates, etc.)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Requests are typically processed within 3-5 business days
                    </Typography>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Fade>

        {/* My Special Cases Table */}
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
                <Warning />
                My Special Cases
              </Typography>

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
                        Type
                      </TableCell>
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
                        Description
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        Evidence
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
                        Submitted
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        }}
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specialCases.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={{ color: "white", py: 4 }}
                        >
                          <Description
                            sx={{ fontSize: 40, opacity: 0.3, mb: 1 }}
                          />
                          <Typography>No special cases found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {specialCases.map((sc) => {
                      const statusStyle = getStatusColor(sc.status);
                      const typeStyle = getTypeColor(sc.type);
                      return (
                        <TableRow
                          key={sc.id}
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
                            <Chip
                              label={sc.type}
                              size="small"
                              sx={{
                                background: typeStyle.bg,
                                color: typeStyle.color,
                                fontWeight: 600,
                              }}
                            />
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
                              }}
                            >
                              <School sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography variant="body2">
                                {sc.course?.courseName || "N/A"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {sc.description.length > 100
                                ? `${sc.description.substring(0, 100)}...`
                                : sc.description}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                          >
                            {sc.evidence ? (
                              <a
                                href={`${BACKEND_BASE_URL}${sc.evidence}`}
                                download
                                style={{
                                  color: "#667eea",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  border: "1px solid rgba(102, 126, 234, 0.5)",
                                  background: "transparent",
                                  cursor: "pointer",
                                }}
                              >
                                <Download fontSize="small" />
                                Download
                              </a>
                            ) : (
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                None
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                          >
                            <Chip
                              icon={statusStyle.icon}
                              label={sc.status}
                              size="small"
                              sx={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 600,
                              }}
                            />
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
                              }}
                            >
                              <CalendarToday
                                sx={{ fontSize: 16, opacity: 0.7 }}
                              />
                              <Typography variant="body2">
                                {new Date(sc.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                            align="right"
                          >
                            {sc.status !== "APPROVED" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <IconButton
                                  aria-label="edit"
                                  onClick={() => handleEditClick(sc)}
                                  size="small"
                                  sx={{
                                    color: "#667eea",
                                    "&:hover": {
                                      background: "rgba(102, 126, 234, 0.1)",
                                    },
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => handleDeleteClick(sc.id)}
                                  size="small"
                                  disabled={deleteLoading}
                                  sx={{
                                    color: "#f5576c",
                                    "&:hover": {
                                      background: "rgba(245, 87, 108, 0.1)",
                                    },
                                  }}
                                >
                                  {deleteLoading ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <Delete />
                                  )}
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            </CardContent>
          </Card>
        </Fade>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
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
                  Delete Special Case
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Are you sure you want to delete this special case? This action
                  cannot be undone.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={deleteLoading}
              sx={{
                background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                },
              }}
            >
              {deleteLoading ? <CircularProgress size={20} /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StudentSubmitSpecialCase;
