import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { classAPI, roundAPI, timetableAPI } from "../services/api";
import { ArrowBack, Schedule } from "@mui/icons-material";

interface Class {
  id: number;
  name: string;
  year: number;
}

interface Round {
  id: number;
  name: string;
  isActive: boolean;
}

interface Session {
  id: number;
  dayOfWeek: number;
  timeSlot: {
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

const HodViewDepartmentTimetables: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [timetable, setTimetable] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, roundsRes] = await Promise.all([
        classAPI.getDepartmentClasses(),
        roundAPI.getAll(),
      ]);

      if (!Array.isArray(classesRes.data) || !Array.isArray(roundsRes.data)) {
        setError("Invalid data received from server");
        return;
      }

      setClasses(classesRes.data);
      setRounds(roundsRes.data);

      const activeRound = roundsRes.data.find((r: Round) => r.isActive);
      if (activeRound) setSelectedRoundId(activeRound.id);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchTimetable = async () => {
    if (!selectedClassId || !selectedRoundId) return;
    try {
      setLoading(true);
      setError("");
      const response = await timetableAPI.getClassTimetable(
        selectedRoundId,
        selectedClassId
      );

      if (!Array.isArray(response.data)) {
        setError("Invalid timetable data received from server");
        setTimetable([]);
        return;
      }

      setTimetable(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load timetable");
      setTimetable([]);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedRoundId) fetchTimetable();
  }, [selectedClassId, selectedRoundId]);

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek] || "Unknown";
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

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
        <Typography variant="h6">Loading Department Timetables...</Typography>
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
            Department Timetables
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <Schedule sx={{ mr: 1, verticalAlign: "middle" }} />
            View and analyze class schedules for your department
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/hoddashboard")}
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            color: "white",
            "&:hover": { borderColor: "white" },
          }}
        >
          Back
        </Button>
      </Box>

      {/* Main Content Card */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          color: "white",
          overflow: "auto",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Selection Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl
                sx={{
                  minWidth: 220,
                }}
                size="small"
              >
                <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Select Class
                </InputLabel>
                <Select
                  value={selectedClassId || ""}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  label="Select Class"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} (Year {cls.year})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                sx={{
                  minWidth: 220,
                }}
                size="small"
              >
                <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Select Round
                </InputLabel>
                <Select
                  value={selectedRoundId || ""}
                  onChange={(e) => setSelectedRoundId(Number(e.target.value))}
                  label="Select Round"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                >
                  {rounds.map((round) => (
                    <MenuItem key={round.id} value={round.id}>
                      {round.name} {round.isActive ? "(Active)" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Timetable Table */}
          {selectedClassId && selectedRoundId ? (
            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress sx={{ color: "#667eea" }} />
                </Box>
              ) : timetable.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Schedule
                    sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)", mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    No timetable sessions found for this selection
                  </Typography>
                </Box>
              ) : (
                <Card sx={{ background: "rgba(255,255,255,0.02)" }}>
                  <CardContent sx={{ p: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {[
                            "Day",
                            "Period & Time",
                            "Course",
                            "Lecturer",
                            "Room",
                          ].map((header) => (
                            <TableCell
                              key={header}
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {timetable.map((session) => (
                          <TableRow
                            key={session.id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.05)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {getDayName(session.dayOfWeek)}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "white",
                                borderColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              {session.timeSlot.name} (
                              {formatTime(session.timeSlot.startTime)} -{" "}
                              {formatTime(session.timeSlot.endTime)})
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
                              {session.room.roomId} - {session.room.roomName}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Schedule
                sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)", mb: 2 }}
              />
              <Typography variant="h6" sx={{ opacity: 0.7 }}>
                Please select a class and round to view the timetable
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default HodViewDepartmentTimetables;
