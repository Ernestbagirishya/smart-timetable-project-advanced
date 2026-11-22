import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Snackbar,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Lock,
  Email,
  Badge,
  School,
  Group,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { authAPI, departmentAPI, classAPI } from "../services/api";
import type { Department, Class } from "../types";

const StudentRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    registrationNumber: "",
    departmentId: "",
    classId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentAPI.getPublicDepartments();
        setDepartments(response.data);
      } catch (err: any) {
        console.error("Failed to fetch departments:", err);
        setError(err.response?.data?.message || "Failed to load departments");
      }
    };
    fetchDepartments();
  }, []);

  React.useEffect(() => {
    const fetchClasses = async () => {
      if (formData.departmentId) {
        try {
          const response = await classAPI.getPublicClassesByDepartment(
            parseInt(formData.departmentId)
          );
          setClasses(response.data);
        } catch (err: any) {
          console.error("Failed to fetch classes:", err);
          setError(err.response?.data?.message || "Failed to load classes");
          setClasses([]);
        }
      } else {
        setClasses([]);
      }
    };
    fetchClasses();
  }, [formData.departmentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Reset class selection when department changes
    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        classId: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const registerData = {
        ...formData,
        role: "STUDENT" as const,
        departmentId: parseInt(formData.departmentId),
        classId: parseInt(formData.classId),
      };

      await authAPI.register(registerData);
      setSuccessMessage("Account created successfully! Please login.");
      setSnackbarOpen(true);
      // Navigate after a short delay to show the message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background:
          "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        color: "white",
        position: "relative",
        overflow: "auto",
        display: "flex",
        alignItems: "center",
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
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
          `,
        },
      }}
    >
      {/* Background elements */}
      <Box
        sx={{
          position: "absolute",
          top: "5%",
          right: "5%",
          width: isMobile ? 150 : 200,
          height: isMobile ? 150 : 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "5%",
          left: "5%",
          width: isMobile ? 100 : 150,
          height: isMobile ? 100 : 150,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)",
        }}
      />

      <Container
        component="main"
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Fade in timeout={800}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Back to Home Button */}
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/")}
              sx={{
                alignSelf: "flex-start",
                mb: 2,
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  color: "white",
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Back to Home
            </Button>

            <Paper
              elevation={24}
              sx={{
                padding: { xs: 3, md: 4 },
                width: "100%",
                maxWidth: 600,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                },
              }}
            >
              <Zoom in timeout={600}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <School
                    sx={{
                      fontSize: 48,
                      color: "#667eea",
                      mb: 2,
                    }}
                  />
                  <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    Student Registration
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ opacity: 0.8 }}
                  >
                    Create your student account to get started
                  </Typography>
                </Box>
              </Zoom>

              {error && (
                <Fade in timeout={300}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {/* Personal Information Section */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: "#667eea",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Person />
                  Personal Information
                </Typography>

                <Box sx={{ display: "grid", gap: 2, mb: 3 }}>
                  <TextField
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Academic Information Section */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: "#667eea",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <School />
                  Academic Information
                </Typography>

                <Box sx={{ display: "grid", gap: 2, mb: 3 }}>
                  <TextField
                    required
                    fullWidth
                    id="registrationNumber"
                    label="Registration Number"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    select
                    id="departmentId"
                    label="Department"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <School sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required
                    fullWidth
                    select
                    id="classId"
                    label="Class"
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    disabled={!formData.departmentId || classes.length === 0}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Group sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Account Information Section */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: "#667eea",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Lock />
                  Account Information
                </Typography>

                <Box sx={{ display: "grid", gap: 2, mb: 4 }}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover fieldset": {
                          borderColor: "#667eea",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <CheckCircle />
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: "rgba(102, 126, 234, 0.5)",
                    },
                    transition: "all 0.3s ease",
                    mb: 2,
                  }}
                >
                  {loading ? "Creating Account..." : "Create Student Account"}
                </Button>

                <Divider sx={{ my: 2, opacity: 0.3 }} />

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#764ba2",
                        background: "rgba(102, 126, 234, 0.04)",
                      },
                    }}
                  >
                    Already have an account? Login
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={successMessage}
          sx={{
            "& .MuiSnackbarContent-root": {
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              borderRadius: 2,
            },
          }}
        />
      </Container>
    </Box>
  );
};

export default StudentRegister;
