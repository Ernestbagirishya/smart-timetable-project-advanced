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
  Grid,
  CircularProgress,
  Fade,
  Zoom,
  Paper,
  alpha,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Description,
  PictureAsPdf,
  VideoLibrary,
  Slideshow,
  InsertDriveFile,
  Download,
  CalendarToday,
  School,
  Class,
  CloudDownload,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { resourceAPI } from "../services/api";
import type { Resource } from "../types";

const StudentResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchResources = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        const response = await resourceAPI.getStudentResources();
        setResources(response.data);
      } catch (err: any) {
        console.error("Error fetching resources:", err);
        setError(err.response?.data?.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [isAuthenticated, navigate]);

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <PictureAsPdf sx={{ fontSize: 24 }} />;
      case "DOCUMENT":
        return <Description sx={{ fontSize: 24 }} />;
      case "SLIDES":
        return <Slideshow sx={{ fontSize: 24 }} />;
      case "VIDEO":
        return <VideoLibrary sx={{ fontSize: 24 }} />;
      default:
        return <InsertDriveFile sx={{ fontSize: 24 }} />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return { bg: "rgba(244, 67, 54, 0.2)", color: "#f44336" };
      case "DOCUMENT":
        return { bg: "rgba(33, 150, 243, 0.2)", color: "#2196f3" };
      case "SLIDES":
        return { bg: "rgba(255, 193, 7, 0.2)", color: "#ffc107" };
      case "VIDEO":
        return { bg: "rgba(156, 39, 176, 0.2)", color: "#9c27b0" };
      default:
        return { bg: "rgba(158, 158, 158, 0.2)", color: "#9e9e9e" };
    }
  };

  const totalResources = resources.length;
  const pdfResources = resources.filter((r) => r.fileType === "PDF").length;
  const documentResources = resources.filter(
    (r) => r.fileType === "DOCUMENT"
  ).length;
  const videoResources = resources.filter((r) => r.fileType === "VIDEO").length;
  const slideResources = resources.filter(
    (r) => r.fileType === "SLIDES"
  ).length;

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
                  Learning Resources
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
                  <Description sx={{ fontSize: 20 }} />
                  Access course materials and learning resources
                </Typography>
              </Box>
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
                }}
              >
                Back to Dashboard
              </Button>
            </Box>

            {/* Statistics Cards */}
            <Zoom in timeout={1000} style={{ transitionDelay: "200ms" }}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
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
                      <CloudDownload
                        sx={{ fontSize: 40, color: "#667eea", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Resources
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      <PictureAsPdf
                        sx={{ fontSize: 40, color: "#f5576c", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {pdfResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        PDF Files
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      <Description
                        sx={{ fontSize: 40, color: "#43e97b", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {documentResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Documents
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      <VideoLibrary
                        sx={{ fontSize: 40, color: "#4facfe", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {videoResources + slideResources}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Media Files
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

        {/* Resources Content */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Box>
            {resources.length === 0 ? (
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
                <Description
                  sx={{
                    fontSize: 60,
                    color: "rgba(255, 255, 255, 0.3)",
                    mb: 2,
                  }}
                />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  No Resources Available
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  There are currently no learning resources available for your
                  courses.
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {resources.map((resource) => {
                  const fileTypeStyle = getFileTypeColor(resource.fileType);
                  return (
                    <Grid item xs={12} md={6} key={resource.id}>
                      <Card
                        sx={{
                          background: "rgba(255, 255, 255, 0.05)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: 2,
                          color: "white",
                          height: "100%",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            background: "rgba(255, 255, 255, 0.08)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                background: fileTypeStyle.bg,
                                color: fileTypeStyle.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {getFileTypeIcon(resource.fileType)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 0.5 }}
                              >
                                {resource.title}
                              </Typography>
                              <Chip
                                label={resource.fileType}
                                size="small"
                                sx={{
                                  background: fileTypeStyle.bg,
                                  color: fileTypeStyle.color,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>

                          {resource.description && (
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.8, mb: 2, lineHeight: 1.5 }}
                            >
                              {resource.description}
                            </Typography>
                          )}

                          <Divider
                            sx={{
                              borderColor: "rgba(255, 255, 255, 0.1)",
                              my: 2,
                            }}
                          />

                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <School sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {resource.course.courseCode} -{" "}
                                {resource.course.courseName}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Class sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Class: {resource.class.name}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CalendarToday
                                sx={{ fontSize: 16, opacity: 0.7 }}
                              />
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Uploaded:{" "}
                                {new Date(
                                  resource.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          <Button
                            variant="contained"
                            startIcon={<Download />}
                            fullWidth
                            href={`http://localhost:5000${resource.fileUrl.replace(
                              "/api/resources/files",
                              "/uploads"
                            )}`}
                            target="_blank"
                            sx={{
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                              },
                              py: 1,
                              borderRadius: 1,
                              fontWeight: 600,
                            }}
                          >
                            Download Resource
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default StudentResources;
