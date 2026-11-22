import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Zoom,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  ArrowBack,
  Lock,
  Security,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const StudentChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess("✅ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
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
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
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
                mb: 3,
              }}
            >
              Back to Dashboard
            </Button>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
              }}
            >
              Change Password
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Security sx={{ fontSize: 20 }} />
              Update your account security settings
            </Typography>
          </Box>
        </Fade>

        {/* Password Change Card */}
        <Zoom in timeout={1000} style={{ transitionDelay: "200ms" }}>
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
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                <Lock />
                Security Settings
              </Typography>

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
              {success && (
                <Fade in timeout={300}>
                  <Alert
                    severity="success"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.95)",
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{
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
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            minWidth: "auto",
                          }}
                        >
                          {showCurrentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{
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
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            minWidth: "auto",
                          }}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{
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
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            minWidth: "auto",
                          }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      },
                      py: 1.5,
                      fontSize: "1rem",
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Change Password"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/studentdashboard")}
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                      background: "rgba(255, 255, 255, 0.05)",
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </form>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 3,
                  opacity: 0.7,
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                Make sure your new password is strong and unique
              </Typography>
            </CardContent>
          </Card>
        </Zoom>
      </Container>
    </Box>
  );
};

export default StudentChangePassword;
