import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Description,
  CalendarToday,
  Download,
  Warning,
  PendingActions,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { specialCaseAPI } from "../services/api";

interface SpecialCase {
  id: number;
  type: string;
  description: string;
  evidence: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  course: {
    courseCode: string;
    courseName: string;
  };
  student: {
    fullName: string;
    registrationNumber: string;
    class: {
      name: string;
    };
  };
}

const HodManageSpecialCases: React.FC = () => {
  const [specialCases, setSpecialCases] = useState<SpecialCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<SpecialCase | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchSpecialCases = async () => {
    setLoading(true);
    try {
      const response = await specialCaseAPI.getDepartmentCases();
      setSpecialCases(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load special cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialCases();
  }, []);

  const handleApprove = async () => {
    if (!selectedCase) return;
    try {
      await specialCaseAPI.approve(selectedCase.id);
      setNotification("Special case approved successfully");
      setOpenApproveDialog(false);
      setSelectedCase(null);
      fetchSpecialCases();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve special case");
    }
  };

  const handleReject = async () => {
    if (!selectedCase) return;
    try {
      await specialCaseAPI.reject(selectedCase.id);
      setNotification("Special case rejected successfully");
      setOpenRejectDialog(false);
      setSelectedCase(null);
      fetchSpecialCases();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject special case");
    }
  };

  const filteredCases = specialCases.filter((sc) => {
    const matchesSearch =
      sc.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.student.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sc.course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || sc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCases = specialCases.filter((sc) => sc.status === "PENDING");
  const approvedCases = specialCases.filter((sc) => sc.status === "APPROVED");
  const rejectedCases = specialCases.filter((sc) => sc.status === "REJECTED");

  const totalCases = specialCases.length;
  const pendingCount = pendingCases.length;
  const approvedCount = approvedCases.length;
  const rejectedCount = rejectedCases.length;

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
                  Manage Special Cases
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
                  Student accommodation requests and special considerations
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
                        {totalCases}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Cases
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

        {/* Filters and Search Section */}
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
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant={statusFilter === "ALL" ? "contained" : "outlined"}
                    onClick={() => setStatusFilter("ALL")}
                    sx={{
                      background:
                        statusFilter === "ALL"
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "transparent",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  >
                    All ({totalCases})
                  </Button>
                  <Button
                    variant={
                      statusFilter === "PENDING" ? "contained" : "outlined"
                    }
                    onClick={() => setStatusFilter("PENDING")}
                    sx={{
                      background:
                        statusFilter === "PENDING"
                          ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)"
                          : "transparent",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  >
                    Pending ({pendingCount})
                  </Button>
                  <Button
                    variant={
                      statusFilter === "APPROVED" ? "contained" : "outlined"
                    }
                    onClick={() => setStatusFilter("APPROVED")}
                    sx={{
                      background:
                        statusFilter === "APPROVED"
                          ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                          : "transparent",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  >
                    Approved ({approvedCount})
                  </Button>
                  <Button
                    variant={
                      statusFilter === "REJECTED" ? "contained" : "outlined"
                    }
                    onClick={() => setStatusFilter("REJECTED")}
                    sx={{
                      background:
                        statusFilter === "REJECTED"
                          ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                          : "transparent",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                    }}
                  >
                    Rejected ({rejectedCount})
                  </Button>
                </Box>

                <Box sx={{ minWidth: 300 }}>
                  <input
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px",
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Special Cases Table */}
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
                Special Case Submissions
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
                          Student
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
                          Type
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
                      {filteredCases.map((sc) => (
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
                            <Box>
                              <Typography fontWeight={600}>
                                {sc.student.fullName}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {sc.student.registrationNumber}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.6 }}
                              >
                                {sc.student.class.name}
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
                                {sc.course.courseCode}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {sc.course.courseName}
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
                              label={sc.type}
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
                              label={sc.status}
                              size="small"
                              sx={{
                                background:
                                  sc.status === "APPROVED"
                                    ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                    : sc.status === "PENDING"
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
                          >
                            <Box
                              sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => {
                                  setSelectedCase(sc);
                                  setOpenDetailsDialog(true);
                                }}
                                sx={{
                                  borderColor: "rgba(102, 126, 234, 0.5)",
                                  color: "#667eea",
                                  "&:hover": {
                                    borderColor: "#667eea",
                                    background: "rgba(102, 126, 234, 0.1)",
                                  },
                                }}
                              >
                                View
                              </Button>
                              {sc.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CheckCircle />}
                                    onClick={() => {
                                      setSelectedCase(sc);
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
                                      setSelectedCase(sc);
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
                                </>
                              )}
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

        {/* Case Details Dialog */}
        <Dialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth="md"
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
            <Description sx={{ mr: 1 }} />
            Case Details
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedCase && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#667eea" }}
                    >
                      Student Information
                    </Typography>
                    <Typography>
                      <strong>Name:</strong> {selectedCase.student.fullName}
                    </Typography>
                    <Typography>
                      <strong>Registration:</strong>{" "}
                      {selectedCase.student.registrationNumber}
                    </Typography>
                    <Typography>
                      <strong>Class:</strong> {selectedCase.student.class.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#667eea" }}
                    >
                      Course Information
                    </Typography>
                    <Typography>
                      <strong>Course:</strong> {selectedCase.course.courseCode}{" "}
                      - {selectedCase.course.courseName}
                    </Typography>
                    <Typography>
                      <strong>Type:</strong> {selectedCase.type}
                    </Typography>
                    <Typography>
                      <strong>Status:</strong> {selectedCase.status}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "#667eea" }}
                  >
                    Description
                  </Typography>
                  <Paper
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography>{selectedCase.description}</Typography>
                  </Paper>
                </Box>

                {selectedCase.evidence && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#667eea" }}
                    >
                      Evidence
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      href={`http://localhost:5000${selectedCase.evidence}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: "rgba(102, 126, 234, 0.5)",
                        color: "#667eea",
                      }}
                    >
                      Download Evidence
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", p: 2 }}
          >
            <Button
              onClick={() => setOpenDetailsDialog(false)}
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

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
            Approve Special Case
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Confirm Approval
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 2 }}>
              Are you sure you want to approve this special case? This will
              grant the student's accommodation request.
            </Typography>
            {selectedCase && (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Case Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Student:</strong> {selectedCase.student.fullName} (
                  {selectedCase.student.registrationNumber})
                </Typography>
                <Typography variant="body2">
                  <strong>Course:</strong> {selectedCase.course.courseCode} -{" "}
                  {selectedCase.course.courseName}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedCase.type}
                </Typography>
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
              Approve Case
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
            Reject Special Case
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Confirm Rejection
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 2 }}>
              Are you sure you want to reject this special case? The student's
              accommodation request will be denied.
            </Typography>
            {selectedCase && (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Case Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Student:</strong> {selectedCase.student.fullName} (
                  {selectedCase.student.registrationNumber})
                </Typography>
                <Typography variant="body2">
                  <strong>Course:</strong> {selectedCase.course.courseCode} -{" "}
                  {selectedCase.course.courseName}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedCase.type}
                </Typography>
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
              Reject Case
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity="success"
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              fontWeight: 600,
            }}
          >
            {notification}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default HodManageSpecialCases;
