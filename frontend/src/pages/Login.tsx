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
  Snackbar,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  School,
  ArrowBack,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      console.log("Login response:", { token, user });
      login(token, user);
      setSuccessOpen(true);

      // Redirect based on role
      console.log("User role:", user.role); // Debug log
      const role = user.role.toUpperCase(); // Normalize to uppercase
      switch (role) {
        case "TIMETABLE_MANAGER":
          navigate("/managerdashboard");
          break;
        case "HOD":
          navigate("/hoddashboard");
          break;
        case "LECTURER":
          navigate("/lecturedashboard");
          break;
        case "STUDENT":
          navigate("/studentdashboard");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
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
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
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
          top: "10%",
          right: "10%",
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
          bottom: "10%",
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
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 4,
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
                    Welcome Back
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ opacity: 0.8 }}
                  >
                    Sign in to your account
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

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
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
                    mb: 2,
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
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          sx={{ color: "text.secondary" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
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
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                <Divider sx={{ my: 3, opacity: 0.3 }} />

                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2, opacity: 0.7 }}
                  >
                    Don't have an account?
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate("/register-student")}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderWidth: 2,
                        borderColor: "#764ba2",
                        background: "rgba(102, 126, 234, 0.04)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Create Student Account
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>

        <Snackbar
          open={successOpen}
          autoHideDuration={3000}
          onClose={handleSuccessClose}
          message="Login successful"
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

export default Login;
