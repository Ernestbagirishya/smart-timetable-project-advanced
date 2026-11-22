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
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  Assignment,
  CalendarToday,
  Person,
  Book,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { catAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface CatPlan {
  id: number;
  course: {
    courseCode: string;
    courseName: string;
  };
  lecturer: {
    fullName: string;
  };
  title: string;
  description: string;
  maxMarks: number;
  dueDate: string;
  status: string;
  createdAt: string;
}

const StudentViewCatPlans: React.FC = () => {
  const [catPlans, setCatPlans] = useState<CatPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchCatPlans = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await catAPI.getStudentCatPlans();
        if (response.data.success) {
          // Filter only approved CAT plans
          const approvedPlans = response.data.data.filter(
            (plan: CatPlan) => plan.status === "APPROVED"
          );
          setCatPlans(approvedPlans);
        } else {
          throw new Error(response.data.message || "Failed to load CAT plans");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load CAT plans");
      } finally {
        setLoading(false);
      }
    };

    fetchCatPlans();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "#43e97b";
      case "PENDING":
        return "#f5576c";
      case "REJECTED":
        return "#ff6b6b";
      default:
        return "#667eea";
    }
  };

  const totalPlans = catPlans.length;
  const uniqueCourses = new Set(catPlans.map((plan) => plan.course.courseCode))
    .size;
  const upcomingPlans = catPlans.filter(
    (plan) => new Date(plan.dueDate) > new Date()
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
                  Approved CAT Plans
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
                  View your approved Continuous Assessment Test schedules
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                  mb: 4,
                }}
              >
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
                    <Book sx={{ fontSize: 40, color: "#43e97b", mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {uniqueCourses}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Courses
                    </Typography>
                  </CardContent>
                </Card>
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
                      {upcomingPlans}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Upcoming
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
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

        {/* CAT Plans Table */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
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
                <Schedule />
                Approved CAT Plans
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress sx={{ color: "#667eea" }} />
                </Box>
              ) : catPlans.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Assignment
                    sx={{
                      fontSize: 60,
                      color: "rgba(255, 255, 255, 0.3)",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    No approved CAT plans found
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.5, mt: 1 }}>
                    Approved CAT plans for your class will appear here
                  </Typography>
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
                          Title
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
                          Due Date
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Max Marks
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {catPlans.map((plan) => (
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
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Book sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Box>
                                <Typography fontWeight={600}>
                                  {plan.course.courseCode}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  {plan.course.courseName}
                                </Typography>
                              </Box>
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
                                  sx={{ opacity: 0.7, mt: 0.5 }}
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
                              <CalendarToday
                                sx={{ fontSize: 16, opacity: 0.7 }}
                              />
                              <Typography>
                                {formatDate(plan.dueDate)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Typography fontWeight={600}>
                              {plan.maxMarks}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Chip
                              icon={<CheckCircle />}
                              label={plan.status}
                              size="small"
                              sx={{
                                background: `rgba(${getStatusColor(
                                  plan.status
                                )}, 0.2)`,
                                color: getStatusColor(plan.status),
                                fontWeight: 600,
                              }}
                            />
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
      </Container>
    </Box>
  );
};

export default StudentViewCatPlans;
