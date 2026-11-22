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
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  AdminPanelSettings,
  School,
  Groups,
  Person,
  Class,
  MeetingRoom,
  Schedule,
  Lock,
  ExitToApp,
  TrendingUp,
  Notifications,
  Dashboard,
  ManageAccounts,
  Apartment,
  Book,
} from "@mui/icons-material";
import { dashboardAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { DashboardData } from "../types";

const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getManagerDashboard();
        setData(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const managementActions = [
    {
      icon: <Apartment sx={{ fontSize: 32 }} />,
      title: "Manage Departments",
      description: "Oversee academic departments and structure",
      action: () => navigate("/manage-departments"),
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <ManageAccounts sx={{ fontSize: 32 }} />,
      title: "Manage HODs",
      description: "Handle Head of Department accounts",
      action: () => navigate("/manage-hods"),
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <MeetingRoom sx={{ fontSize: 32 }} />,
      title: "Manage Rooms",
      description: "Organize classroom and facility allocation",
      action: () => navigate("/manage-rooms"),
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <Book sx={{ fontSize: 32 }} />,
      title: "Manage Courses",
      description: "Coordinate course catalog and offerings",
      action: () => navigate("/manage-courses"),
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      icon: <Schedule sx={{ fontSize: 32 }} />,
      title: "Generate Timetables",
      description: "Create and optimize academic schedules",
      action: () => navigate("/generate-timetables"),
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    },
    {
      icon: <Lock sx={{ fontSize: 32 }} />,
      title: "Security",
      description: "Update account and system security",
      action: () => navigate("/change-password"),
      color: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
    },
  ];

  const stats = [
    {
      label: "Departments",
      value: data?.totalDepartments || 0,
      icon: <School />,
      color: "#667eea",
      description: "Academic departments",
    },
    {
      label: "Lecturers",
      value: data?.totalLecturers || 0,
      icon: <Person />,
      color: "#f5576c",
      description: "Teaching staff",
    },
    {
      label: "HODs",
      value: data?.totalHods || 0,
      icon: <AdminPanelSettings />,
      color: "#43e97b",
      description: "Department heads",
    },
    {
      label: "Students",
      value: data?.totalStudents || 0,
      icon: <Groups />,
      color: "#4facfe",
      description: "Enrolled students",
    },
    {
      label: "Courses",
      value: data?.totalCourses || 0,
      icon: <Book />,
      color: "#ff9a9e",
      description: "Active courses",
    },
    {
      label: "Rooms",
      value: data?.totalRooms || 0,
      icon: <MeetingRoom />,
      color: "#a8edea",
      description: "Available rooms",
    },
    {
      label: "Classes",
      value: data?.totalClasses || 0,
      icon: <Class />,
      color: "#ffd89b",
      description: "Scheduled classes",
    },
    {
      label: "Active Rounds",
      value: data?.activeRounds || 0,
      icon: <Schedule />,
      color: "#667eea",
      description: "Current rounds",
    },
    {
      label: "Timetables",
      value: data?.generatedTimetables || 0,
      icon: <Schedule />,
      color: "#f5576c",
      description: "Generated schedules",
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
          <CircularProgress
            size={60}
            sx={{
              color: "#667eea",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="white">
            Loading System Dashboard...
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
        background:
          "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
        color: "white",
        position: "relative",
        overflow: "auto",
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
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 4 }}>
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
                  Timetable Manager
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
                  <Dashboard sx={{ fontSize: 20 }} />
                  Welcome, {user?.fullName}!
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="Institutional Management Portal"
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

            {/* System Overview Stats */}
            <Zoom in timeout={1000} style={{ transitionDelay: "200ms" }}>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
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
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1,
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, mb: 0.5 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.8, lineHeight: 1 }}
                        >
                          {stat.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Zoom>
          </Box>
        </Fade>

        {/* Management Actions */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AdminPanelSettings />
              System Management
            </Typography>

            <Grid container spacing={3}>
              {managementActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
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
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
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
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.8,
                          lineHeight: 1.4,
                        }}
                      >
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* System Status Section */}
        <Fade in timeout={1000} style={{ transitionDelay: "600ms" }}>
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Notifications />
              System Status
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
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
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Recent System Activities
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#43e97b",
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            Timetable Generation Completed
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            rount 1 2025 schedule successfully generated
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          13 hours ago
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#667eea",
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            New Department Added
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Hospitality Management Department
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          day 4 ago
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#f5576c",
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            System Maintenance Required
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Database optimization scheduled for weekend
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          1 day ago
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Quick System Stats
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">System Uptime</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          99.8%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">Active Users</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          48
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">Storage Used</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          26%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">Pending Tasks</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          0
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ManagerDashboard;
