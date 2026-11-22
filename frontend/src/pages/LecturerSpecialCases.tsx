import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Fade,
  Zoom,
  Paper,
  alpha,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Person,
  Assignment,
  CalendarToday,
  Description,
  School,
  Warning,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { dashboardAPI, specialCaseAPI } from "../services/api";
import type { SpecialCase, Course } from "../types";

interface CourseWithCases {
  course: Course;
  approvedCases: SpecialCase[];
}

const LecturerSpecialCases: React.FC = () => {
  const [data, setData] = useState<CourseWithCases[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        // Fetch lecturer's courses
        const coursesResponse = await dashboardAPI.getLecturerCourses();
        const courses: Course[] = coursesResponse.data.data;

        // For each course, fetch special cases and filter approved
        const coursesWithCases: CourseWithCases[] = await Promise.all(
          courses.map(async (course) => {
            try {
              const casesResponse = await specialCaseAPI.getCourseCases(
                course.id
              );
              const allCases: SpecialCase[] = casesResponse.data;
              const approvedCases = allCases.filter(
                (sc) => sc.status === "APPROVED"
              );
              return { course, approvedCases };
            } catch (err) {
              console.error(
                `Error fetching cases for course ${course.id}:`,
                err
              );
              return { course, approvedCases: [] };
            }
          })
        );

        setData(coursesWithCases);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load special cases");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const totalApprovedCases = data.reduce(
    (sum, item) => sum + item.approvedCases.length,
    0
  );

  const totalCourses = data.length;
  const coursesWithCases = data.filter(
    (item) => item.approvedCases.length > 0
  ).length;

  const getCaseTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "medical":
        return { bg: "rgba(244, 67, 54, 0.2)", color: "#f44336" };
      case "personal":
        return { bg: "rgba(33, 150, 243, 0.2)", color: "#2196f3" };
      case "academic":
        return { bg: "rgba(76, 175, 80, 0.2)", color: "#4caf50" };
      case "emergency":
        return { bg: "rgba(255, 152, 0, 0.2)", color: "#ff9800" };
      default:
        return { bg: "rgba(158, 158, 158, 0.2)", color: "#9e9e9e" };
    }
  };

  if (loading) {
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress sx={{ color: "#667eea" }} />
          </Box>
        </Container>
      </Box>
    );
  }

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
                  Approved Special Cases
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
                  <CheckCircle sx={{ fontSize: 20 }} />
                  Review approved student special consideration requests
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
                <Grid item xs={12} sm={6} md={4}>
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
                        sx={{ fontSize: 40, color: "#667eea", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalApprovedCases}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Approved Cases
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
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
                        {totalCourses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Courses
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
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
                        sx={{ fontSize: 40, color: "#f5576c", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {coursesWithCases}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Courses with Cases
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

        {/* Special Cases Content */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Box>
            {totalApprovedCases === 0 ? (
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  color: "white",
                  textAlign: "center",
                  p: 6,
                }}
              >
                <CheckCircle
                  sx={{
                    fontSize: 60,
                    color: "rgba(255, 255, 255, 0.3)",
                    mb: 2,
                  }}
                />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  No Approved Special Cases
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  There are currently no approved special cases for your
                  courses.
                </Typography>
              </Card>
            ) : (
              data.map((item) => (
                <Card
                  key={item.course.id}
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    mb: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <School />
                      {item.course.courseCode} - {item.course.courseName}
                    </Typography>

                    {item.approvedCases.length === 0 ? (
                      <Typography sx={{ opacity: 0.7, fontStyle: "italic" }}>
                        No approved special cases for this course.
                      </Typography>
                    ) : (
                      <Paper
                        sx={{
                          background: "rgba(255, 255, 255, 0.02)",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <List disablePadding>
                          {item.approvedCases.map((sc, index) => {
                            const typeStyle = getCaseTypeColor(sc.type);
                            return (
                              <React.Fragment key={sc.id}>
                                <ListItem
                                  alignItems="flex-start"
                                  sx={{ py: 2, px: 3 }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mb: 1,
                                        }}
                                      >
                                        <Person
                                          sx={{ fontSize: 20, opacity: 0.7 }}
                                        />
                                        <Typography
                                          variant="h6"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {sc.student.fullName}
                                        </Typography>
                                        <Chip
                                          label={sc.type}
                                          size="small"
                                          sx={{
                                            background: typeStyle.bg,
                                            color: typeStyle.color,
                                            fontWeight: 600,
                                            ml: 1,
                                          }}
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 1 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            opacity: 0.9,
                                            mb: 1,
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 1,
                                          }}
                                        >
                                          <Description
                                            sx={{
                                              fontSize: 16,
                                              mt: 0.25,
                                              opacity: 0.7,
                                            }}
                                          />
                                          {sc.description}
                                        </Typography>

                                        {sc.evidence && (
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              opacity: 0.8,
                                              mb: 1,
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <Assignment
                                              sx={{
                                                fontSize: 16,
                                                opacity: 0.7,
                                              }}
                                            />
                                            <strong>Evidence:</strong>{" "}
                                            {sc.evidence}
                                          </Typography>
                                        )}

                                        <Typography
                                          variant="body2"
                                          sx={{
                                            opacity: 0.7,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <CalendarToday
                                            sx={{ fontSize: 16, opacity: 0.7 }}
                                          />
                                          <strong>Submitted:</strong>{" "}
                                          {new Date(
                                            sc.createdAt
                                          ).toLocaleDateString()}
                                        </Typography>

                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mt: 1,
                                          }}
                                        >
                                          <CheckCircle
                                            sx={{
                                              fontSize: 16,
                                              color: "#43e97b",
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#43e97b",
                                              fontWeight: 600,
                                            }}
                                          >
                                            Approved
                                          </Typography>
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                                {index < item.approvedCases.length - 1 && (
                                  <Divider
                                    sx={{
                                      borderColor: "rgba(255, 255, 255, 0.1)",
                                    }}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </List>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LecturerSpecialCases;
