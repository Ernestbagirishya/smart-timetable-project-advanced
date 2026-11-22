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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tabs,
  Tab,
  TextField,
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
  CheckCircle,
  Cancel,
  Assignment,
  Person,
  School,
  Class,
  Search,
  FilterList,
  Warning,
  PendingActions,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { catAPI } from "../services/api";

interface CatPlan {
  id: number;
  courseId: number;
  lecturerId: number;
  classId: number;
  status: string;
  createdAt: string;
  course: {
    courseCode: string;
    courseName: string;
  };
  lecturer: {
    fullName: string;
  };
  class: {
    name: string;
  };
}

const HodManageCatPlans: React.FC = () => {
  const [catPlans, setCatPlans] = useState<CatPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<CatPlan | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchCatPlans = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching CAT plans...");

      // Use getAll for "All" tab, getPending for other cases
      const response = await (tabValue === 0
        ? catAPI.getAll()
        : catAPI.getPending());
      console.log("CAT plans response:", response.data);

      if (response.data.success) {
        setCatPlans(response.data.data);
        setError(""); // Clear any previous errors
      } else {
        setError(response.data.message || "Failed to load CAT plans");
        console.warn("API returned success: false", response.data);
      }
    } catch (err: any) {
      console.error("Error fetching CAT plans:", {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || "Failed to load CAT plans");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatPlans();
  }, [navigate, tabValue]); // Also refetch when tab changes

  const handleApprove = async () => {
    if (!selectedPlan) return;
    try {
      await catAPI.approve(selectedPlan.id);
      setOpenApproveDialog(false);
      setSelectedPlan(null);
      setSuccessMessage("CAT plan approved successfully");
      fetchCatPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve CAT plan");
    }
  };

  const handleReject = async () => {
    if (!selectedPlan) return;
    try {
      await catAPI.reject(selectedPlan.id);
      setOpenRejectDialog(false);
      setSelectedPlan(null);
      setSuccessMessage("CAT plan rejected successfully");
      fetchCatPlans();
    } catch (err: any) {
      console.error("Error rejecting CAT plan:", err);
      setError(err.response?.data?.message || "Failed to reject CAT plan");
    }
  };

  const pendingPlans = catPlans.filter((plan) => plan.status === "PENDING");
  const approvedPlans = catPlans.filter((plan) => plan.status === "APPROVED");
  const rejectedPlans = catPlans.filter((plan) => plan.status === "REJECTED");

  const filteredPlans = catPlans
    .filter((plan) => {
      if (tabValue === 0) return true; // All
      if (tabValue === 1) return plan.status === "PENDING";
      if (tabValue === 2) return plan.status === "APPROVED";
      if (tabValue === 3) return plan.status === "REJECTED";
      return true;
    })
    .filter(
      (plan) =>
        plan.course.courseCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        plan.course.courseName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        plan.lecturer.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        plan.class.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPlans = catPlans.length;
  const pendingCount = pendingPlans.length;
  const approvedCount = approvedPlans.length;
  const rejectedCount = rejectedPlans.length;

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
                  Continuous Assessment Test plan review and approval
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
                      <Assignment
                        sx={{ fontSize: 40, color: "#667eea", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalPlans}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Plans
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
                      <PendingActions
                        sx={{ fontSize: 40, color: "#f5576c", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {pendingCount}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pending Review
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
                      <CheckCircle
                        sx={{ fontSize: 40, color: "#43e97b", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {approvedCount}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Approved
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
                      <Cancel sx={{ fontSize: 40, color: "#4facfe", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {rejectedCount}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Rejected
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

        {/* Tabs and Search Section */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              color: "white",
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  sx={{
                    "& .MuiTab-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                      "&.Mui-selected": {
                        color: "#667eea",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#667eea",
                    },
                  }}
                >
                  <Tab label="All" />
                  <Tab label="Pending" />
                  <Tab label="Approved" />
                  <Tab label="Rejected" />
                </Tabs>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    placeholder="Search CAT plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      width: 300,
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
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
                </Box>
              </Box>
            </CardContent>
          </Card>
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
                CAT Plan Submissions
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
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPlans.map((plan) => (
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
                                {plan.course.courseCode}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {plan.course.courseName}
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
                              <Person sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography>{plan.lecturer.fullName}</Typography>
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
                              <Class sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography>{plan.class.name}</Typography>
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
                                  plan.status === "APPROVED"
                                    ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                    : plan.status === "PENDING"
                                    ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
                                    : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                color: "white",
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
                              <Schedule sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography variant="body2">
                                {new Date(plan.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                          >
                            {plan.status === "PENDING" && (
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<CheckCircle />}
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setOpenApproveDialog(true);
                                  }}
                                  sx={{
                                    borderColor: "rgba(67, 233, 123, 0.5)",
                                    color: "#43e97b",
                                    "&:hover": {
                                      borderColor: "#43e97b",
                                      background: "rgba(67, 233, 123, 0.1)",
                                    },
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setOpenRejectDialog(true);
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
                                  Reject
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

        {/* Approve Dialog */}
        <Dialog
          open={openApproveDialog}
          onClose={() => setOpenApproveDialog(false)}
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
            <CheckCircle sx={{ color: "#43e97b", mr: 1 }} />
            Approve CAT Plan
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Confirm Approval
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 2 }}>
              Are you sure you want to approve this CAT plan? This action will
              allow the lecturer to proceed with the assessment.
            </Typography>
            {selectedPlan && (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Plan Details:
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography variant="body2">
                    <strong>Course:</strong> {selectedPlan.course.courseCode} -{" "}
                    {selectedPlan.course.courseName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Lecturer:</strong> {selectedPlan.lecturer.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Class:</strong> {selectedPlan.class.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Submitted:</strong>{" "}
                    {new Date(selectedPlan.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setOpenApproveDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApprove}
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)",
                },
              }}
            >
              Approve Plan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={openRejectDialog}
          onClose={() => setOpenRejectDialog(false)}
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
            <Cancel sx={{ color: "#f5576c", mr: 1 }} />
            Reject CAT Plan
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Confirm Rejection
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 2 }}>
              Are you sure you want to reject this CAT plan? The lecturer will
              need to resubmit with corrections.
            </Typography>
            {selectedPlan && (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Plan Details:
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography variant="body2">
                    <strong>Course:</strong> {selectedPlan.course.courseCode} -{" "}
                    {selectedPlan.course.courseName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Lecturer:</strong> {selectedPlan.lecturer.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Class:</strong> {selectedPlan.class.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Submitted:</strong>{" "}
                    {new Date(selectedPlan.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setOpenRejectDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              sx={{
                background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                },
              }}
            >
              Reject Plan
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

export default HodManageCatPlans;
