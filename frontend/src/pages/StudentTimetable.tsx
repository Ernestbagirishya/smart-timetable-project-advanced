import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  alpha,
} from "@mui/material";
import {
  ArrowBack,
  Schedule,
  CalendarToday,
  Person,
  LocationOn,
  Book,
  Today,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { studentAPI, roundAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface TimetableSession {
  id: number;
  dayOfWeek: number;
  timeSlot: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  };
  course: {
    courseCode: string;
    courseName: string;
  };
  lecturer: {
    fullName: string;
  };
  room: {
    roomId: string;
    roomName: string;
  };
}

interface Round {
  id: number;
  name: string;
  isActive: boolean;
}

const StudentTimetable: React.FC = () => {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatTime = (isoDateString: string): string => {
    try {
      const date = new Date(isoDateString);

      if (isNaN(date.getTime())) {
        throw new Error("Invalid time format");
      }

      return date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\s/g, " "); // Ensure consistent spacing
    } catch (error) {
      console.error("Error formatting time:", error);
      return isoDateString;
    }
  };

  const formatTimeSlot = (timeSlot: TimetableSession["timeSlot"]): string => {
    const startTime = formatTime(timeSlot.startTime);
    const endTime = formatTime(timeSlot.endTime);
    return `${startTime} - ${endTime}`;
  };

  const getDayColor = (dayOfWeek: number) => {
    const colors = [
      "#667eea", // Sunday
      "#43e97b", // Monday
      "#f5576c", // Tuesday
      "#4facfe", // Wednesday
      "#a8edea", // Thursday
      "#fed6e3", // Friday
      "#ffdac1", // Saturday
    ];
    return colors[dayOfWeek];
  };

  const fetchRounds = async () => {
    try {
      const response = await roundAPI.getAll();
      setRounds(response.data);
      const activeRound = response.data.find((round: Round) => round.isActive);
      if (activeRound) {
        setActiveRoundId(activeRound.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rounds");
    }
  };

  const fetchTimetable = async (roundId: number) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError("");
      const response = await studentAPI.getTimetable(user.id, roundId);
      setSessions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  useEffect(() => {
    if (activeRoundId !== null) {
      fetchTimetable(activeRoundId);
    }
  }, [activeRoundId, user]);

  const handleRoundChange = (event: any) => {
    const roundId = parseInt(event.target.value);
    setActiveRoundId(roundId);
  };

  const totalSessions = sessions.length;
  const uniqueCourses = new Set(sessions.map((s) => s.course.courseCode)).size;
  const uniqueLecturers = new Set(sessions.map((s) => s.lecturer.fullName))
    .size;
  const weeklyHours = sessions.reduce((total, session) => {
    const start = new Date(session.timeSlot.startTime);
    const end = new Date(session.timeSlot.endTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    return total + duration;
  }, 0);

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
                  Student Timetable
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
                  <Schedule sx={{ fontSize: 20 }} />
                  View your class schedule and course timings
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
                      <Schedule
                        sx={{ fontSize: 40, color: "#667eea", mb: 1 }}
                      />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {totalSessions}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Classes
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
                      <Book sx={{ fontSize: 40, color: "#43e97b", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {uniqueCourses}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Courses
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
                      <Person sx={{ fontSize: 40, color: "#f5576c", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {uniqueLecturers}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Lecturers
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
                      <Today sx={{ fontSize: 40, color: "#4facfe", mb: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {weeklyHours.toFixed(1)}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Weekly Hours
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

        {/* Round Selection */}
        <Fade in timeout={1000} style={{ transitionDelay: "400ms" }}>
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              color: "white",
              mb: 3,
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CalendarToday sx={{ color: "#667eea" }} />
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Select Academic Round
                </InputLabel>
                <Select
                  value={activeRoundId ?? ""}
                  onChange={handleRoundChange}
                  label="Select Academic Round"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                  }}
                >
                  {rounds.map((round) => (
                    <MenuItem key={round.id} value={round.id}>
                      {round.name} {round.isActive && "(Active)"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Card>
        </Fade>

        {/* Timetable Table */}
        <Fade in timeout={1000} style={{ transitionDelay: "600ms" }}>
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
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Schedule />
                Class Schedule
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress sx={{ color: "#667eea" }} />
                </Box>
              ) : sessions.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <School
                    sx={{
                      fontSize: 60,
                      color: "rgba(255, 255, 255, 0.3)",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    No timetable sessions found for this round
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.5, mt: 1 }}>
                    Please select a different academic round or check back later
                  </Typography>
                </Box>
              ) : (
                <Paper
                  sx={{
                    background: "rgba(255, 255, 255, 0.02)",
                    overflow: "auto",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Day
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Time Slot
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Course
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Lecturer
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          Room
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow
                          key={session.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Chip
                              label={
                                [
                                  "Sunday",
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                ][session.dayOfWeek]
                              }
                              size="small"
                              sx={{
                                background: alpha(
                                  getDayColor(session.dayOfWeek),
                                  0.2
                                ),
                                color: getDayColor(session.dayOfWeek),
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Schedule sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography fontWeight={600}>
                                {formatTimeSlot(session.timeSlot)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.7, ml: 3 }}
                            >
                              {session.timeSlot.name}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Book sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Box>
                                <Typography fontWeight={600}>
                                  {session.course.courseCode}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  {session.course.courseName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Person sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Typography>
                                {session.lecturer.fullName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocationOn sx={{ fontSize: 16, opacity: 0.7 }} />
                              <Box>
                                <Typography fontWeight={600}>
                                  {session.room.roomId}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ opacity: 0.8 }}
                                >
                                  {session.room.roomName}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default StudentTimetable;
