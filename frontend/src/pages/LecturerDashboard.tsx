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
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Book,
  Class,
  Assignment,
  Upload,
  Schedule,
  CasesOutlined as Cases,
  Lock,
  ExitToApp,
  TrendingUp,
  Notifications,
  Download,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { dashboardAPI } from "../services/api";

interface LecturerDashboardData {
  assignedCourses: number;
  assignedClasses: number;
  pendingCATs: number;
  pendingSpecialCases: number;
  recentActivities: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

const LecturerDashboard: React.FC = () => {
  const [data, setData] = useState<LecturerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login...");
        navigate("/login");
        return;
      }
      await fetchDashboardData();
    };

    const fetchDashboardData = async () => {
      try {
        console.log("Fetching lecturer dashboard data...");
        const response = await dashboardAPI.getLecturerDashboard();

        if (response.data.success) {
          console.log("Dashboard data loaded successfully:", response.data);
          setData(response.data.data);
        } else {
          setError(response.data.message || "Failed to load dashboard data");
        }
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [isAuthenticated, navigate, logout]);

  const quickActions = [
    {
      icon: <Assignment sx={{ fontSize: 32 }} />,
      title: "Create CAT Plans",
      description: "Create and manage continuous assessment tests",
      action: () => navigate("/cat-plans"),
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <Upload sx={{ fontSize: 32 }} />,
      title: "Upload Resources",
      description: "Share course materials and learning resources",
      action: () => navigate("/upload-resources"),
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <Schedule sx={{ fontSize: 32 }} />,
      title: "View Timetable",
      description: "Check your teaching schedule and classes",
      action: () => navigate("/lecturer-timetable"),
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <Cases sx={{ fontSize: 32 }} />,
      title: "Special Cases",
      description: "Review student accommodation requests",
      action: () => navigate("/lecturer-special-cases"),
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      icon: <Lock sx={{ fontSize: 32 }} />,
      title: "Security",
      description: "Update password and account settings",
      action: () => navigate("/lecturer-change-password"),
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    },
  ];

  const stats = [
    {
      label: "Courses Assigned",
      value: data?.assignedCourses || 0,
      icon: <Book />,
      color: "#667eea",
    },
    {
      label: "Classes Assigned",
      value: data?.assignedClasses || 0,
      icon: <Class />,
      color: "#f5576c",
    },
    {
      label: "Pending CATs",
      value: data?.pendingCATs || 0,
      icon: <Assignment />,
      color: "#f093fb",
    },
    {
      label: "Pending Special Cases",
      value: data?.pendingSpecialCases || 0,
      icon: <Cases />,
      color: "#43e97b",
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
        }}
      >
        <Container maxWidth="sm">
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            {error}
          </Alert>
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
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          width: "95%",
          px: { xs: 2, md: 4 },
        }}
      >
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
                  Lecturer Dashboard
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
                  <Person sx={{ fontSize: 20 }} />
                  Welcome,{" "}
                  {user?.fullName ? `Prof. ${user.fullName}` : "Lecturer"}!
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="Academic Portal"
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

            {/* Stats Section */}
            <Zoom in timeout={1000}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(4, 1fr)",
                  },
                  gap: 2,
                  mb: 4,
                }}
              >
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      color: "white",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          color: stat.color,
                          mb: 1,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2">{stat.label}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Zoom>
          </Box>
        </Fade>

        {/* Quick Actions */}
        <Fade in timeout={1000}>
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
              <Assignment />
              Teaching Tools
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  onClick={action.action}
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                      background: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: action.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Recent Activity */}
        <Fade in timeout={1000}>
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
              Recent Activity
            </Typography>

            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                color: "white",
              }}
            >
              <CardContent>
                {data?.recentActivities && data.recentActivities.length > 0 ? (
                  data.recentActivities.map((activity, index) => (
                    <Typography
                      key={activity.id}
                      variant="body1"
                      sx={{
                        mb: index < data.recentActivities.length - 1 ? 1 : 0,
                      }}
                    >
                      {activity.type === "cat_plan" && "📝 "}
                      {activity.type === "special_case" && "⚠️ "}
                      {activity.type === "resource" && "📚 "}
                      {activity.message}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body1" sx={{ opacity: 0.7 }}>
                    No recent activities
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

export default LecturerDashboard;
