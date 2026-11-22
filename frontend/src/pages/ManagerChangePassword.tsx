import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { ArrowBack, Lock } from "@mui/icons-material";

const ManagerChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotification({ open: false, message: "", severity: "success" });

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
      setNotification({
        open: true,
        message: "Password changed successfully",
        severity: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
      setNotification({
        open: true,
        message: err.response?.data?.message || "Failed to change password",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 500 }}>
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
              Change Password
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
              <Lock sx={{ mr: 1, verticalAlign: "middle" }} />
              Update your account password
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/managerdashboard")}
            sx={{
              borderColor: "rgba(255,255,255,0.3)",
              color: "white",
              "&:hover": { borderColor: "white" },
            }}
          >
            Back
          </Button>
        </Box>

        {/* Password Form Card */}
        <Card
          sx={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 2,
            color: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  background: "rgba(245,87,108,0.1)",
                  color: "#f5576c",
                  border: "1px solid rgba(245,87,108,0.3)",
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
              />
              <Box sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Lock />
                  }
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                    "&:disabled": {
                      background: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card
          sx={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 2,
            color: "white",
            mt: 3,
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "#667eea" }}
          >
            Password Requirements
          </Typography>
          <Box component="ul" sx={{ pl: 2, opacity: 0.8 }}>
            <Typography component="li" variant="body2">
              Minimum 6 characters long
            </Typography>
            <Typography component="li" variant="body2">
              Use a combination of letters, numbers, and symbols
            </Typography>
            <Typography component="li" variant="body2">
              Avoid using easily guessable information
            </Typography>
            <Typography component="li" variant="body2">
              Do not reuse old passwords
            </Typography>
          </Box>
        </Card>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerChangePassword;
