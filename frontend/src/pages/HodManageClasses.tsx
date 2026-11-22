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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
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
  Edit,
  School,
  CalendarToday,
  Groups,
  Search,
  FilterList,
  Warning,
  Class,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { classAPI } from "../services/api";

interface Class {
  id: number;
  name: string;
  year: number;
  departmentId: number;
}

const HodManageClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassYear, setNewClassYear] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log("Fetching classes...");
      const response = await classAPI.getDepartmentClasses();
      console.log("Classes response:", response.data);

      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setClasses(response.data);
        setError("");
      } else {
        setError("Invalid data format received from server");
        console.error("Invalid data format:", response.data);
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [navigate]);

  const handleCreateClass = async () => {
    try {
      const response = await classAPI.create({
        name: newClassName,
        year: Number(newClassYear),
      });

      console.log("Create class response:", response.data);

      setOpenCreateDialog(false);
      setNewClassName("");
      setNewClassYear("");
      setSuccessMessage(response.data.message || "Class created successfully");
      fetchClasses();
    } catch (err: any) {
      console.error("Error creating class:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to create class";
      setError(errorMessage);
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
      }
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass) return;
    try {
      const response = await classAPI.update(selectedClass.id, {
        name: newClassName,
        year: Number(newClassYear),
      });

      console.log("Update class response:", response.data);

      setOpenEditDialog(false);
      setSelectedClass(null);
      setNewClassName("");
      setNewClassYear("");
      setSuccessMessage(response.data.message || "Class updated successfully");
      fetchClasses();
    } catch (err: any) {
      console.error("Error updating class:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update class";
      setError(errorMessage);
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
      }
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      const response = await classAPI.delete(classToDelete.id);
      console.log("Delete class response:", response.data);
      setSuccessMessage(response.data.message || "Class deleted successfully");
      setOpenDeleteDialog(false);
      setClassToDelete(null);
      fetchClasses();
    } catch (err: any) {
      console.error("Error deleting class:", err);
      setError(err.response?.data?.message || "Failed to delete class");
      if (err.response?.status === 400 && err.response?.data?.message) {
        // Handle specific error for classes with course assignments
        setError(err.response.data.message);
      }
    }
  };

  const openEdit = (cls: Class) => {
    setSelectedClass(cls);
    setNewClassName(cls.name);
    setNewClassYear(cls.year);
    setOpenEditDialog(true);
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.year.toString().includes(searchTerm)
  );

  const totalClasses = classes.length;
  const currentYear = new Date().getFullYear();
  const currentYearClasses = classes.filter(
    (cls) => cls.year === currentYear
  ).length;
  const upcomingYearClasses = classes.filter(
    (cls) => cls.year === currentYear + 1
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
                  Manage Classes
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
                  <Class sx={{ fontSize: 20 }} />
                  Academic class organization and management
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
                      <Groups sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalClasses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Classes
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
                        sx={{ fontSize: 40, color: "#43e97b", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {currentYearClasses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Current Year
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
                      <School sx={{ fontSize: 40, color: "#f5576c", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {upcomingYearClasses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Next Year
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
                      <Class sx={{ fontSize: 40, color: "#4facfe", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {classes.filter((cls) => cls.year < currentYear).length}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Previous Years
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
              placeholder="Search classes..."
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
              Create Class
            </Button>
          </Box>
        </Fade>

        {/* Classes Table */}
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
                <Class />
                Department Classes
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
                          Class Name
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Academic Year
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
                      {filteredClasses.map((cls) => (
                        <TableRow
                          key={cls.id}
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
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Groups sx={{ fontSize: 20, opacity: 0.7 }} />
                              <Typography fontWeight={600}>
                                {cls.name}
                              </Typography>
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
                              }}
                            >
                              <CalendarToday
                                sx={{ fontSize: 16, opacity: 0.7 }}
                              />
                              <Typography>{cls.year}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                          >
                            <Chip
                              label={
                                cls.year === currentYear
                                  ? "Current"
                                  : cls.year > currentYear
                                  ? "Upcoming"
                                  : "Previous"
                              }
                              size="small"
                              sx={{
                                background:
                                  cls.year === currentYear
                                    ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                    : cls.year > currentYear
                                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    : "rgba(255, 255, 255, 0.1)",
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
                                startIcon={<Edit />}
                                onClick={() => openEdit(cls)}
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
                                onClick={() => {
                                  setClassToDelete(cls);
                                  setOpenDeleteDialog(true);
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

        {/* Create Class Dialog */}
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
            Create New Class
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              label="Class Name"
              fullWidth
              margin="normal"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
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
              label="Academic Year"
              type="number"
              fullWidth
              margin="normal"
              value={newClassYear}
              onChange={(e) =>
                setNewClassYear(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              InputProps={{
                inputProps: {
                  min: currentYear - 5,
                  max: currentYear + 5,
                },
              }}
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
              onClick={() => setOpenCreateDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateClass}
              disabled={!newClassName || newClassYear === ""}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                },
              }}
            >
              Create Class
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
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
            Edit Class
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              label="Class Name"
              fullWidth
              margin="normal"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
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
              label="Academic Year"
              type="number"
              fullWidth
              margin="normal"
              value={newClassYear}
              onChange={(e) =>
                setNewClassYear(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              InputProps={{
                inputProps: {
                  min: currentYear - 5,
                  max: currentYear + 5,
                },
              }}
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
              onClick={() => setOpenEditDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditClass}
              disabled={!newClassName || newClassYear === ""}
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
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
            Confirm Class Deletion
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Warning sx={{ color: "#f5576c", fontSize: 40 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Delete Class "{classToDelete?.name}"
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Are you sure you want to delete this class? This action cannot
                  be undone and may affect course assignments.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteClass}
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
              Delete Class
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
        >
          <Alert
            onClose={() => setSuccessMessage("")}
            severity="success"
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              fontWeight: 600,
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default HodManageClasses;
