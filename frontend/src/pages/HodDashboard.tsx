import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Person,
  Groups,
  School,
  Class,
  ManageAccounts,
  Assignment,
  Cases,
  Schedule,
  Lock,
  ExitToApp,
  TrendingUp,
  Notifications,
  AdminPanelSettings,
  BarChart,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { dashboardAPI, departmentAPI } from "../services/api";
import type { Department } from "../types";

interface HodDashboardData {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  totalClasses: number;
}

const HodDashboard: React.FC = () => {
  const [data, setData] = useState<HodDashboardData | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Authenticated user present, proceeding to fetch data");
      await fetchDashboardData();
    };

    const fetchDashboardData = async () => {
      try {
        console.log("Fetching HOD dashboard data");
        const response = await dashboardAPI.getHodDashboard();

        if (response.data.success) {
          console.log("Dashboard data fetched successfully:", response.data);
          setData(response.data.data);

          // Fetch department if user has departmentId
          if (user?.departmentId) {
            try {
              console.log(
                "Fetching department for user departmentId:",
                user.departmentId
              );
              const deptsResponse = await departmentAPI.getPublicDepartments();
              console.log("Departments response:", deptsResponse.data);
              const userDept = deptsResponse.data.find(
                (dept: Department) => dept.id === user.departmentId
              );
              console.log("Found department:", userDept);
              setDepartment(userDept || null);
            } catch (err) {
              console.error("Failed to fetch department", err);
            }
          }
        } else {
          console.warn(
            "Dashboard fetch failed with error:",
            response.data.message
          );
          setError(response.data.message || "Failed to load dashboard data");
        }
      } catch (err: any) {
        console.error("Dashboard error:", {
          error: err,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Auth error in dashboard, logging out");
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [isAuthenticated, navigate]);

  const managementActions = [
    {
      icon: <School sx={{ fontSize: 32 }} />,
      title: "Manage Courses",
      description: "Oversee department courses and curriculum",
      action: () => navigate("/manage-department-courses"),
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <ManageAccounts sx={{ fontSize: 32 }} />,
      title: "Manage Lecturers",
      description: "Handle lecturer accounts and assignments",
      action: () => navigate("/manage-hod-accounts"),
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <Class sx={{ fontSize: 32 }} />,
      title: "Manage Classes",
      description: "Organize and schedule department classes",
      action: () => navigate("/manage-classes"),
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <Assignment sx={{ fontSize: 32 }} />,
      title: "CAT Plans",
      description: "Review and approve assessment plans",
      action: () => navigate("/manage-cat-plans"),
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      icon: <Cases sx={{ fontSize: 32 }} />,
      title: "Special Cases",
      description: "Handle student accommodation requests",
      action: () => navigate("/special-cases"),
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    },
    {
      icon: <Schedule sx={{ fontSize: 32 }} />,
      title: "Timetables",
      description: "Manage department schedules",
      action: () => navigate("/hod-view-department-timetables"),
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
    {
      icon: <Lock sx={{ fontSize: 32 }} />,
      title: "Security",
      description: "Update account security settings",
      action: () => navigate("/hod_change_password"),
      color: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
    },
  ];

  const stats = [
    {
      label: "Students",
      value: data?.totalStudents || 0,
      icon: <Groups />,
      color: "#667eea",
      description: "Total enrolled students",
    },
    {
      label: "Lecturers",
      value: data?.totalLecturers || 0,
      icon: <Person />,
      color: "#f5576c",
      description: "Teaching staff",
    },
    {
      label: "Courses",
      value: data?.totalCourses || 0,
      icon: <School />,
      color: "#43e97b",
      description: "Active courses",
    },
    {
      label: "Classes",
      value: data?.totalClasses || 0,
      icon: <Class />,
      color: "#4facfe",
      description: "Scheduled classes",
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
          color: "white",
        }}
      >
        <CircularProgress sx={{ color: "#667eea", mr: 2 }} />
        <Typography variant="h6">Loading Department Dashboard...</Typography>
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
          color: "white",
          px: { xs: 2, sm: 4, md: 6 },
          py: 4,
        }}
      >
        <Alert severity="error" sx={{ width: "100%", maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
        color: "white",
        px: { xs: 2, sm: 4, md: 6 },
        py: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Head of Department Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
            Welcome, Dr. {user?.fullName}!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8, mt: 0.5 }}>
            Department: {department?.name || "Not Assigned"}
          </Typography>
          <Chip
            icon={<TrendingUp />}
            label="Department Management Portal"
            sx={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              mt: 1,
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            color: "white",
            "&:hover": { borderColor: "white" },
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Department Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Management Actions */}
      <Box sx={{ mb: 4 }}>
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
          <ManageAccounts />
          Department Management
        </Typography>

        <Grid container spacing={3}>
          {managementActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
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
                    background: "rgba(255,255,255,0.08)",
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

      {/* Quick Reports Section */}
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
          <Notifications />
          Department Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                color: "white",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Recent Activities
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#43e97b",
                    }}
                  />
                  <Typography variant="body2">
                    <strong>5 new course registrations</strong> this week
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#667eea",
                    }}
                  />
                  <Typography variant="body2">
                    <strong>2 lecturer accounts</strong> pending approval
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#f5576c",
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Timetable conflicts</strong> require attention
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                color: "white",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      justifyContent: "flex-start",
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "white",
                      "&:hover": { borderColor: "white" },
                    }}
                  >
                    Generate Department Report
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      justifyContent: "flex-start",
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "white",
                      "&:hover": { borderColor: "white" },
                    }}
                  >
                    View Performance Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      justifyContent: "flex-start",
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "white",
                      "&:hover": { borderColor: "white" },
                    }}
                  >
                    Schedule Department Meeting
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HodDashboard;
