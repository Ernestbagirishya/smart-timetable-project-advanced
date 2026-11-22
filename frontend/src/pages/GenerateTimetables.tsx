import React, { useEffect, useState } from "react";
import {
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
  Snackbar,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  PlayArrow,
  Delete,
  Download,
  Search,
  CalendarToday,
  AccessTime,
  Schedule,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { roundAPI, timeslotAPI, timetableAPI } from "../services/api";
import type { Round, TimeSlot, Session } from "../types";

const GenerateTimetables: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [loadingTimeslots, setLoadingTimeslots] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState<string>("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [creatingRound, setCreatingRound] = useState(false);
  const [creatingTimeslot, setCreatingTimeslot] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // New round form state
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundStartDate, setNewRoundStartDate] = useState("");
  const [newRoundEndDate, setNewRoundEndDate] = useState("");

  // New timeslot form state
  const [newTimeslotName, setNewTimeslotName] = useState("");
  const [newTimeslotStartTime, setNewTimeslotStartTime] = useState("");
  const [newTimeslotEndTime, setNewTimeslotEndTime] = useState("");

  const navigate = useNavigate();

  // Fetch rounds
  const fetchRounds = async () => {
    setLoadingRounds(true);
    setError("");
    try {
      const response = await roundAPI.getAll();
      setRounds(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rounds");
    } finally {
      setLoadingRounds(false);
    }
  };

  // Fetch timeslots
  const fetchTimeslots = async () => {
    setLoadingTimeslots(true);
    setError("");
    try {
      const response = await timeslotAPI.getAll();
      setTimeslots(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load timeslots");
    } finally {
      setLoadingTimeslots(false);
    }
  };

  // Fetch sessions for selected round
  const fetchSessions = async (roundId: number) => {
    setLoadingSessions(true);
    setError("");
    try {
      const response = await timetableAPI.getSessions(roundId);
      setSessions(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load timetable sessions"
      );
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchRounds();
    fetchTimeslots();
  }, []);

  useEffect(() => {
    if (selectedRoundId !== null) {
      fetchSessions(selectedRoundId);
    } else {
      setSessions([]);
    }
  }, [selectedRoundId]);

  // Set active round
  const handleSetActiveRound = async (roundId: number) => {
    setError("");
    try {
      await roundAPI.setActive(roundId);
      setNotification({
        open: true,
        message: "Round set as active successfully",
        severity: "success",
      });
      fetchRounds();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set round as active");
    }
  };

  // Deactivate round
  const handleDeactivateRound = async (roundId: number) => {
    setError("");
    try {
      await roundAPI.deactivate(roundId);
      setNotification({
        open: true,
        message: "Round deactivated successfully",
        severity: "success",
      });
      fetchRounds();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deactivate round");
    }
  };

  // Create new round
  const handleCreateRound = async () => {
    if (!newRoundName || !newRoundStartDate || !newRoundEndDate) {
      setError("Please fill all round fields");
      return;
    }
    setCreatingRound(true);
    setError("");
    try {
      // Convert dates to ISO datetime strings
      const startDateTime = new Date(newRoundStartDate);
      startDateTime.setHours(0, 0, 0, 0);
      const endDateTime = new Date(newRoundEndDate);
      endDateTime.setHours(23, 59, 59, 999);

      await roundAPI.create({
        name: newRoundName,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      });
      setNotification({
        open: true,
        message: "Round created successfully",
        severity: "success",
      });
      setNewRoundName("");
      setNewRoundStartDate("");
      setNewRoundEndDate("");
      fetchRounds();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "Failed to create round";
      setError(errorMessage);
    } finally {
      setCreatingRound(false);
    }
  };

  // Create new timeslot
  const handleCreateTimeslot = async () => {
    if (!newTimeslotName || !newTimeslotStartTime || !newTimeslotEndTime) {
      setError("Please fill all timeslot fields");
      return;
    }

    // Validate that end time is after start time
    if (newTimeslotEndTime <= newTimeslotStartTime) {
      setError("End time must be after start time");
      return;
    }
    setCreatingTimeslot(true);
    setError("");
    try {
      // Convert time to HH:MM:SS format
      const formatTime = (time: string) => `${time}:00`;

      await timeslotAPI.create({
        name: newTimeslotName,
        startTime: formatTime(newTimeslotStartTime),
        endTime: formatTime(newTimeslotEndTime),
      });
      setNotification({
        open: true,
        message: "Timeslot created successfully",
        severity: "success",
      });
      setNewTimeslotName("");
      setNewTimeslotStartTime("");
      setNewTimeslotEndTime("");
      fetchTimeslots();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "Failed to create timeslot";
      setError(errorMessage);
    } finally {
      setCreatingTimeslot(false);
    }
  };

  // Generate timetable for selected round
  const handleGenerateTimetable = async () => {
    if (selectedRoundId === null) {
      setError("Please select a round to generate timetable");
      return;
    }
    setError("");
    try {
      await timetableAPI.generate(selectedRoundId);
      setNotification({
        open: true,
        message: "Timetable generated successfully",
        severity: "success",
      });
      fetchSessions(selectedRoundId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate timetable");
    }
  };

  // Delete timetable sessions
  const handleDeleteTimetable = async () => {
    if (selectedRoundId === null) {
      setError("Please select a round to delete timetable");
      return;
    }
    setError("");
    try {
      await timetableAPI.deleteSessions(selectedRoundId);
      setNotification({
        open: true,
        message: "Timetable deleted successfully",
        severity: "success",
      });
      fetchSessions(selectedRoundId);
      setDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete timetable");
    }
  };

  // Download timetable as CSV
  const handleDownloadTimetable = () => {
    if (sessions.length === 0) {
      setError("No timetable sessions to download");
      return;
    }
    // Prepare CSV content
    const header = [
      "Day of Week",
      "Time Slot",
      "Course Code",
      "Course Name",
      "Lecturer",
      "Class",
      "Room",
    ];
    const rows = sessions.map((session) => [
      session.dayOfWeek.toString(),
      session.timeSlot.name,
      session.course.courseCode,
      session.course.courseName,
      session.lecturer.fullName,
      session.class.name,
      session.room.roomName || session.room.roomId,
    ]);
    const csvContent = [header, ...rows]
      .map((e) => e.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `timetable_round_${selectedRoundId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification({
      open: true,
      message: "Timetable downloaded successfully",
      severity: "success",
    });
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session.course.courseName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.lecturer.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      session.class.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRound = rounds.find((round) => round.id === selectedRoundId);

  if (loadingRounds || loadingTimeslots) {
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
        <Typography variant="h6">Loading Timetable Data...</Typography>
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
            Timetable Generation
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <Schedule sx={{ mr: 1, verticalAlign: "middle" }} />
            Automated timetable creation and management
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <CalendarToday sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {rounds.length}
              </Typography>
              <Typography variant="h6">Total Rounds</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <AccessTime sx={{ fontSize: 40, color: "#43e97b", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {timeslots.length}
              </Typography>
              <Typography variant="h6">Time Slots</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Schedule sx={{ fontSize: 40, color: "#f5576c", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {sessions.length}
              </Typography>
              <Typography variant="h6">Generated Sessions</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Rounds Section */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "white",
            }}
          >
            <CardContent>
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
                <CalendarToday />
                Academic Rounds
              </Typography>

              <Card
                sx={{
                  background: "rgba(255,255,255,0.02)",
                  mb: 3,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          Round
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          Period
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rounds.map((round) => (
                        <TableRow
                          key={round.id}
                          hover
                          selected={selectedRoundId === round.id}
                          onClick={() => setSelectedRoundId(round.id)}
                          sx={{
                            cursor: "pointer",
                            backgroundColor:
                              selectedRoundId === round.id
                                ? "rgba(102,126,234,0.2)"
                                : "transparent",
                            "&:hover": {
                              backgroundColor:
                                selectedRoundId === round.id
                                  ? "rgba(102,126,234,0.3)"
                                  : "rgba(255,255,255,0.05)",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            <Box>
                              <Typography fontWeight={600}>
                                {round.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.7 }}
                              >
                                {round._count?.sessions ?? 0} sessions
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                {new Date(round.startDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2">
                                {new Date(round.endDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                          >
                            <Chip
                              label={round.isActive ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                background: round.isActive
                                  ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                  : "rgba(255,255,255,0.1)",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                          >
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetActiveRound(round.id);
                                }}
                                disabled={round.isActive}
                                sx={{
                                  color: "#667eea",
                                  borderColor: "rgba(102,126,234,0.5)",
                                  "&:hover": { borderColor: "#667eea" },
                                }}
                                variant="outlined"
                              >
                                Activate
                              </Button>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeactivateRound(round.id);
                                }}
                                disabled={!round.isActive}
                                sx={{
                                  color: "#f5576c",
                                  borderColor: "rgba(245,87,108,0.5)",
                                  "&:hover": { borderColor: "#f5576c" },
                                }}
                                variant="outlined"
                              >
                                Deactivate
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Add />
                  Create New Round
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Round Name"
                      value={newRoundName}
                      onChange={(e) => setNewRoundName(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={newRoundStartDate}
                      onChange={(e) => setNewRoundStartDate(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={newRoundEndDate}
                      onChange={(e) => setNewRoundEndDate(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      onClick={handleCreateRound}
                      disabled={creatingRound}
                      fullWidth
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      {creatingRound ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeslots Section */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "white",
            }}
          >
            <CardContent>
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
                <AccessTime />
                Time Slots
              </Typography>

              <Card
                sx={{
                  background: "rgba(255,255,255,0.02)",
                  mb: 3,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          Start Time
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          End Time
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timeslots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            {slot.name}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            {new Date(slot.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            {new Date(slot.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Add />
                  Create New Timeslot
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Timeslot Name"
                      value={newTimeslotName}
                      onChange={(e) => setNewTimeslotName(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={newTimeslotStartTime}
                      onChange={(e) => setNewTimeslotStartTime(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={newTimeslotEndTime}
                      onChange={(e) => setNewTimeslotEndTime(e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      onClick={handleCreateTimeslot}
                      disabled={creatingTimeslot}
                      fullWidth
                      sx={{
                        background:
                          "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      }}
                    >
                      {creatingTimeslot ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Timetable Sessions Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Schedule />
                  Timetable Sessions
                  {selectedRound && (
                    <Chip
                      label={selectedRound.name}
                      size="small"
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                      width: 250,
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "rgba(255,255,255,0.5)" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={handleGenerateTimetable}
                    disabled={selectedRoundId === null}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    Generate
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={selectedRoundId === null}
                    sx={{
                      borderColor: "rgba(245,87,108,0.5)",
                      color: "#f5576c",
                      "&:hover": { borderColor: "#f5576c" },
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownloadTimetable}
                    disabled={sessions.length === 0}
                    sx={{
                      borderColor: "rgba(67,233,123,0.5)",
                      color: "#43e97b",
                      "&:hover": { borderColor: "#43e97b" },
                    }}
                  >
                    Download
                  </Button>
                </Box>
              </Box>

              {loadingSessions ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress sx={{ color: "#667eea" }} />
                </Box>
              ) : filteredSessions.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Schedule
                    sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)", mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    {selectedRoundId
                      ? searchTerm
                        ? "No matching sessions found"
                        : "No timetable sessions available for selected round"
                      : "Please select a round to view timetable sessions"}
                  </Typography>
                </Box>
              ) : (
                <Card sx={{ background: "rgba(255,255,255,0.02)" }}>
                  <CardContent sx={{ p: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            Day
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            Time Slot
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            Course
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            Lecturer
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            Class
                          </TableCell>
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          >
                            Room
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {session.dayOfWeek}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {session.timeSlot.name}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
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
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {session.lecturer.fullName}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {session.class.name}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {session.room.roomName || session.room.roomId}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
            color: "white",
          },
        }}
      >
        <DialogTitle>Confirm Timetable Deletion</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Warning sx={{ color: "#f5576c", fontSize: 40 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Delete Timetable Sessions
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Are you sure you want to delete all timetable sessions for this
                round? This action cannot be undone and will remove{" "}
                {sessions.length} sessions.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "white" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTimetable}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
            }}
          >
            Delete Sessions
          </Button>
        </DialogActions>
      </Dialog>

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

export default GenerateTimetables;
