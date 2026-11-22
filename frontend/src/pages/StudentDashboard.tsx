import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Schedule,
  Book,
  Assignment,
  Lock,
  ExitToApp,
  Person,
  School,
  Today,
  Download,
  Notifications,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";

interface DashboardResponse {
  success: boolean;
  data: {
    activeCourses: number;
    coursesAssignedWithLecturer: number;
    todayClasses: number;
    pendingTasks: number;
    pendingCATs: number;
    resources: number;
    recentUpdates: Array<{
      id: number;
      type: string;
      message: string;
      timestamp: string;
    }>;
  };
  message: string;
}

interface DashboardData {
  activeCourses: number;
  coursesAssignedWithLecturer: number;
  todayClasses: number;
  pendingTasks: number;
  pendingCATs: number;
  resources: number;
  recentUpdates: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeCourses: 4,
    coursesAssignedWithLecturer: 3,
    todayClasses: 3,
    pendingTasks: 2,
    pendingCATs: 1,
    resources: 12,
    recentUpdates: [
      {
        id: 1,
        type: "assignment",
        message: "New assignment posted for Data Structures",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: "class",
        message: "Upcoming class: Introduction to Algorithms",
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<DashboardResponse>(
          "http://localhost:5000/api/dashboard/student",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Failed to load dashboard data"
          );
        }
        setLoading(false);
      } catch (err) {
        let errorMessage = "Failed to load dashboard data";
        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const quickActions = [
    {
      icon: <Schedule sx={{ fontSize: 32 }} />,
      title: "View Timetable",
      description: "Check your class schedule and upcoming lectures",
      action: () => navigate("/student-timetable"),
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <Book sx={{ fontSize: 32 }} />,
      title: "Study Resources",
      description: "Access course materials and learning resources",
      action: () => navigate("/student-resources"),
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <Assignment sx={{ fontSize: 32 }} />,
      title: "View CAT Plan",
      description: "View your Continuous Assessment Test schedule",
      action: () => navigate("/student-view-catplans"),
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    },
    {
      icon: <Assignment sx={{ fontSize: 32 }} />,
      title: "Special Cases",
      description: "Submit special requests and accommodations",
      action: () => navigate("/submit-special-case"),
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <Lock sx={{ fontSize: 32 }} />,
      title: "Security",
      description: "Update your password and security settings",
      action: () => navigate("/student-change-password"),
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  const stats = [
    {
      label: "Today's Classes",
      value: dashboardData.todayClasses.toString(),
      icon: <Today />,
    },
    {
      label: "Approved CATs",
      value: dashboardData.pendingCATs.toString(),
      icon: <Assignment />,
    },
  ];

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
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: "#667eea", mb: 2 }} />
          <Typography variant="h6" color="white">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
          p: 3,
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: "600px",
            width: "100%",
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            color: "white",
            "& .MuiAlert-icon": { color: "white" },
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Error Loading Dashboard
          </Typography>
          <Typography>{error}</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            color="error"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Alert>
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
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        color: "white",
        overflowX: "hidden",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 2, md: 4 },
          py: 4,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 2, sm: 0 },
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
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
                  Student Dashboard
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  <Person sx={{ fontSize: 20 }} />
                  Welcome back, {user?.fullName}!
                </Typography>
                <Chip
                  icon={<School />}
                  label={`Registration: ${user?.registrationNumber || "N/A"}`}
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    mt: 1,
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
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
                Logout
              </Button>
            </Box>

            {/* Stats Cards */}
            <Zoom in timeout={1000} style={{ transitionDelay: "200ms" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(6, 1fr)",
                  },
                  gap: 2,
                  mb: 4,
                }}
              >
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: 2,
                      color: "white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                          color: "#667eea",
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          fontSize: { xs: "1.5rem", sm: "2rem" },
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Zoom>
          </Box>
        </Fade>

        {/* Quick Actions */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Schedule />
              Quick Actions
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  sx={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: action.color,
                    },
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                      background: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: action.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        color: "white",
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.8,
                        lineHeight: 1.4,
                        fontSize: { xs: "0.875rem", sm: "0.9rem" },
                      }}
                    >
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Recent Activity Section */}
        <Fade in timeout={1000} style={{ transitionDelay: "600ms" }}>
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Notifications />
              Recent Updates
            </Typography>

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
                {dashboardData.recentUpdates.length > 0 ? (
                  dashboardData.recentUpdates.map((update) => (
                    <Box
                      key={update.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        "&:last-child": { mb: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            update.type === "assignment"
                              ? "#43e97b"
                              : "#667eea",
                        }}
                      />
                      <Box>
                        <Typography variant="body1">
                          {update.message}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {new Date(update.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", opacity: 0.7 }}
                  >
                    No recent updates
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
