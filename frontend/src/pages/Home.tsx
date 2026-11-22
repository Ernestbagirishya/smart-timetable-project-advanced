import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
} from "@mui/material";
import type { Theme } from "@mui/material";
import type { SxProps } from "@mui/system";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const features = [
    {
      icon: <ManageAccountsIcon sx={{ fontSize: 32 }} />,
      title: "Timetable Manager",
      description:
        "Manage and schedule timetables efficiently for all departments.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 32 }} />,
      title: "Head of Department",
      description: "Oversee lecturer schedules and departmental timetables.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      title: "Lecturer",
      description: "Easily view and manage personal lecture schedules.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
      title: "Students",
      description: "Access class timetables and stay updated with changes.",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  const stats = [
    { value: "50+", label: "Departments" },
    { value: "2,000+", label: "Active Users" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support" },
  ];

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
      {/* Simplified background elements */}
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
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: { xs: 3, md: 4 },
          }}
        >
          {/* Hero Section */}
          <Fade in timeout={800}>
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
              <Chip
                icon={<AutoAwesomeIcon />}
                label="Smart timetable system"
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  mb: 3,
                  px: 2,
                  py: 1,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              />

              <Typography
                variant={isSmallMobile ? "h4" : isMobile ? "h3" : "h2"}
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                  fontSize: {
                    xs: "1.75rem",
                    sm: "2.5rem",
                    md: "3rem",
                  },
                }}
              >
                Smart Timetable system
              </Typography>

              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  maxWidth: 600,
                  mx: "auto",
                  opacity: 0.9,
                  mb: 3,
                  lineHeight: 1.5,
                  fontSize: {
                    xs: "0.9rem",
                    sm: "1rem",
                    md: "1.1rem",
                  },
                }}
              >
                academic scheduling with automated optimization and real-time
                updates communication
              </Typography>

              {/* Stats */}
              <Zoom in timeout={1000} style={{ transitionDelay: "300ms" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(4, 1fr)",
                    },
                    gap: 2,
                    mb: 4,
                    maxWidth: 500,
                    mx: "auto",
                  }}
                >
                  {stats.map((stat, index) => (
                    <Box key={index} textAlign="center">
                      <Typography
                        variant={isMobile ? "h5" : "h4"}
                        sx={{
                          fontWeight: 700,
                          background:
                            "linear-gradient(135deg, #7332bcff 0%, #421b71ff 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          mb: 0.5,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Zoom>

              {/* Action Buttons */}
              <Fade in timeout={1000} style={{ transitionDelay: "500ms" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate("/login")}
                    sx={{
                      minWidth: { xs: 140, sm: 160, md: 180 },
                      py: { xs: 1, md: 1.5 },
                      px: { xs: 2, md: 3 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isMobile ? "Login" : " Login to Dashboard"}
                  </Button>

                  <Button
                    variant="outlined"
                    size={isMobile ? "medium" : "large"}
                    endIcon={<SchoolIcon />}
                    onClick={() => navigate("/register-student")}
                    sx={{
                      minWidth: { xs: 140, sm: 160, md: 180 },
                      py: { xs: 1, md: 1.5 },
                      px: { xs: 2, md: 3 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.05)",
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255, 255, 255, 0.1)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isMobile ? "Sign Up" : "Student Registration"}
                  </Button>
                </Box>
              </Fade>

              {/* Security Badge */}
              <Fade in timeout={1000} style={{ transitionDelay: "700ms" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    opacity: 0.8,
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    Secure • Reliable • Ready
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Fade>

          {/* Features Section */}
          <Fade in timeout={1000} style={{ transitionDelay: "900ms" }}>
            <Box sx={{ mt: { xs: 6, md: 8 } }}>
              <Box textAlign="center" mb={4}>
                <Chip
                  icon={<TrendingUpIcon />}
                  label="Platform Features"
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    mb: 2,
                    px: 2,
                    py: 0.5,
                    fontSize: "0.7rem",
                  }}
                />
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  Designed for Everyone
                </Typography>
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  sx={{ opacity: 0.8, maxWidth: 500, mx: "auto" }}
                >
                  Tailored experiences for different roles
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                }}
              >
                {features.map((feature, index) => (
                  <Box key={index}>
                    <Card
                      sx={{
                        height: "100%",
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
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
                          background: feature.gradient,
                        },
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: "center" }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: feature.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                            color: "white",
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            fontSize: "1rem",
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            lineHeight: 1.4,
                            fontSize: "0.8rem",
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
