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
  CloudUpload,
  Description,
  VideoLibrary,
  PictureAsPdf,
  Slideshow,
  InsertDriveFile,
  Search,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { resourceAPI, assignmentAPI } from "../services/api";

interface Resource {
  id: number;
  courseId: number;
  classId: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  course: {
    courseCode: string;
    courseName: string;
  };
  class: {
    name: string;
  };
}

interface Assignment {
  id: number;
  courseId: number;
  classId: number;
  course: {
    courseCode: string;
    courseName: string;
  };
  class: {
    name: string;
  };
}

const LecturerUploadResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    assignmentId: "",
    title: "",
    description: "",
    file: null as File | null,
    fileUrl: "",
    fileType: "",
  });

  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await resourceAPI.getMyResources();
      setResources(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await assignmentAPI.getMyAssignments();
      setAssignments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load assignments");
    }
  };

  useEffect(() => {
    fetchResources();
    fetchAssignments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleCreateOpen = () => {
    setFormData({
      assignmentId: "",
      title: "",
      description: "",
      file: null,
      fileUrl: "",
      fileType: "",
    });
    setOpenCreateDialog(true);
  };

  const handleCreateClose = () => {
    setOpenCreateDialog(false);
  };

  const handleDeleteOpen = (resource: Resource) => {
    setSelectedResource(resource);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
    setSelectedResource(null);
  };

  const mapMimeTypeToFileType = (mimeType: string): string => {
    if (!mimeType) return "OTHER";
    const type = mimeType.toLowerCase();
    if (type.includes("pdf")) return "PDF";
    if (
      type.includes("word") ||
      type.includes("msword") ||
      type.includes("officedocument")
    )
      return "DOCUMENT";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "SLIDES";
    if (type.includes("video")) return "VIDEO";
    return "OTHER";
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <PictureAsPdf sx={{ fontSize: 16 }} />;
      case "DOCUMENT":
        return <Description sx={{ fontSize: 16 }} />;
      case "SLIDES":
        return <Slideshow sx={{ fontSize: 16 }} />;
      case "VIDEO":
        return <VideoLibrary sx={{ fontSize: 16 }} />;
      default:
        return <InsertDriveFile sx={{ fontSize: 16 }} />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return { bg: "rgba(244, 67, 54, 0.2)", color: "#f44336" };
      case "DOCUMENT":
        return { bg: "rgba(33, 150, 243, 0.2)", color: "#2196f3" };
      case "SLIDES":
        return { bg: "rgba(255, 193, 7, 0.2)", color: "#ffc107" };
      case "VIDEO":
        return { bg: "rgba(156, 39, 176, 0.2)", color: "#9c27b0" };
      default:
        return { bg: "rgba(158, 158, 158, 0.2)", color: "#9e9e9e" };
    }
  };

  const handleUploadFile = async () => {
    if (!formData.file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const formDataUpload = new FormData();
      formDataUpload.append("file", formData.file);

      const response = await resourceAPI.upload(formDataUpload);
      setFormData((prev) => ({
        ...prev,
        fileUrl: response.data.fileUrl,
        fileType: formData.file
          ? mapMimeTypeToFileType(formData.file.type)
          : "OTHER",
      }));
      setSuccessMessage("File uploaded successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async () => {
    try {
      if (!formData.assignmentId || !formData.title || !formData.fileUrl) {
        setError("Please fill in all required fields and upload a file");
        return;
      }

      const selectedAssignment = assignments.find(
        (a) => a.id.toString() === formData.assignmentId
      );
      if (!selectedAssignment) {
        setError("Invalid assignment selected");
        return;
      }

      const payload = {
        courseId: selectedAssignment.courseId,
        classId: selectedAssignment.classId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        fileUrl: formData.fileUrl,
        fileType: formData.fileType,
      };

      await resourceAPI.create(payload);
      setSuccessMessage("Resource created successfully");
      setOpenCreateDialog(false);
      fetchResources();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create resource");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedResource) return;
    try {
      await resourceAPI.delete(selectedResource.id);
      setSuccessMessage("Resource deleted successfully");
      setOpenDeleteDialog(false);
      setSelectedResource(null);
      fetchResources();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete resource");
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.course.courseCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resource.course.courseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resource.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.fileType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResources = resources.length;
  const pdfResources = resources.filter((r) => r.fileType === "PDF").length;
  const documentResources = resources.filter(
    (r) => r.fileType === "DOCUMENT"
  ).length;
  const videoResources = resources.filter((r) => r.fileType === "VIDEO").length;
  const slideResources = resources.filter(
    (r) => r.fileType === "SLIDES"
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
                  Upload Resources
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
                  <CloudUpload sx={{ fontSize: 20 }} />
                  Share learning materials and resources with students
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
                      <CloudUpload
                        sx={{ fontSize: 40, color: "#667eea", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Resources
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
                      <PictureAsPdf
                        sx={{ fontSize: 40, color: "#f5576c", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {pdfResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        PDF Files
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
                      <Description
                        sx={{ fontSize: 40, color: "#43e97b", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {documentResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Documents
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
                      <VideoLibrary
                        sx={{ fontSize: 40, color: "#4facfe", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {videoResources + slideResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Media Files
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
              placeholder="Search resources..."
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
              Upload Resource
            </Button>
          </Box>
        </Fade>

        {/* Resources Table */}
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
                <CloudUpload />
                Learning Resources
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
                          Resource Details
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          File Type
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Upload Date
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
                      {filteredResources.map((resource) => {
                        const fileTypeStyle = getFileTypeColor(
                          resource.fileType
                        );
                        return (
                          <TableRow
                            key={resource.id}
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
                                  {resource.course.courseCode} -{" "}
                                  {resource.course.courseName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  Class: {resource.class.name}
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
                                  {resource.title}
                                </Typography>
                                {resource.description && (
                                  <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.8, mt: 0.5 }}
                                  >
                                    {resource.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                            >
                              <Chip
                                icon={getFileTypeIcon(resource.fileType)}
                                label={resource.fileType}
                                size="small"
                                sx={{
                                  background: fileTypeStyle.bg,
                                  color: fileTypeStyle.color,
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
                              <Typography variant="body2">
                                {new Date(
                                  resource.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteOpen(resource)}
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
                        );
                      })}
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
            Upload Resource
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: "1px dashed rgba(255, 255, 255, 0.3)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <CloudUpload />
                File Upload
              </Typography>
              <input
                type="file"
                onChange={handleFileChange}
                style={{
                  marginBottom: 16,
                  color: "white",
                  padding: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "4px",
                  width: "100%",
                }}
              />
              <Button
                variant="outlined"
                onClick={handleUploadFile}
                disabled={!formData.file || uploading}
                startIcon={
                  uploading ? <CircularProgress size={16} /> : <CloudUpload />
                }
                sx={{
                  borderColor: "rgba(102, 126, 234, 0.5)",
                  color: "#667eea",
                  "&:hover": {
                    borderColor: "#667eea",
                    background: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
              {formData.fileUrl && (
                <Alert
                  severity="success"
                  sx={{
                    mt: 2,
                    background: "rgba(76, 175, 80, 0.1)",
                    color: "#4caf50",
                  }}
                >
                  File uploaded successfully!
                </Alert>
              )}
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Select Assignment
              </InputLabel>
              <Select
                name="assignmentId"
                value={formData.assignmentId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assignmentId: e.target.value,
                  }))
                }
                label="Select Assignment"
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
                {assignments.map((assignment) => (
                  <MenuItem
                    key={assignment.id}
                    value={assignment.id.toString()}
                  >
                    {assignment.course.courseCode} -{" "}
                    {assignment.course.courseName} - {assignment.class.name}
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
              disabled={!formData.fileUrl}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                },
              }}
            >
              Create Resource
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
            Confirm Resource Deletion
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Warning sx={{ color: "#f5576c", fontSize: 40 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Delete Learning Resource
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Are you sure you want to delete this resource? This action
                  cannot be undone and students will no longer have access to
                  this file.
                </Typography>
                {selectedResource && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, opacity: 0.9, fontWeight: 600 }}
                  >
                    {selectedResource.title} -{" "}
                    {selectedResource.course.courseCode} -{" "}
                    {selectedResource.class.name}
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
              Delete Resource
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

export default LecturerUploadResources;
