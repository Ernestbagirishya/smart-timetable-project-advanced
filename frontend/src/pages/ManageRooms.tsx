import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { roomAPI } from "../services/api";
import type { Room } from "../types";
import {
  Add,
  ArrowBack,
  Edit,
  Delete,
  Search,
  MeetingRoom,
} from "@mui/icons-material";

const ManageRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    roomId: "",
    roomName: "",
  });
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

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      setRooms(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditRoom(room);
      setFormData({
        roomId: room.roomId,
        roomName: room.roomName,
      });
    } else {
      setEditRoom(null);
      setFormData({
        roomId: "",
        roomName: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editRoom) {
        await roomAPI.update(editRoom.id, formData);
        setNotification({
          open: true,
          message: "Room updated successfully",
          severity: "success",
        });
      } else {
        await roomAPI.create(formData);
        setNotification({
          open: true,
          message: "Room created successfully",
          severity: "success",
        });
      }
      setOpenDialog(false);
      fetchRooms();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.response?.data?.message || "Operation failed",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await roomAPI.delete(id);
      setNotification({
        open: true,
        message: "Room deleted successfully",
        severity: "success",
      });
      fetchRooms();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Typography variant="h6">Loading Rooms...</Typography>
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
            Manage Rooms
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <MeetingRoom sx={{ mr: 1, verticalAlign: "middle" }} />
            Create and Manage Room Information
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

      {/* Stats Card */}
      <Card
        sx={{
          mb: 4,
          maxWidth: 400,
          mx: "auto",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          textAlign: "center",
          color: "white",
        }}
      >
        <CardContent>
          <Typography sx={{ opacity: 0.8 }}>Total Rooms</Typography>
          <Typography variant="h4" fontWeight="bold">
            {loading ? <CircularProgress size={24} /> : rooms.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Action bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            px: 3,
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Create New Room
        </Button>

        <TextField
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset": { borderColor: "white" },
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
      </Box>

      {/* Table */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          color: "white",
          overflow: "auto",
        }}
      >
        <CardContent>
          {error && <Alert severity="error">{error}</Alert>}
          <Table>
            <TableHead>
              <TableRow>
                {["Room ID", "Room Name", "Actions"].map((header) => (
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
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell sx={{ color: "white" }}>{room.roomId}</TableCell>
                  <TableCell sx={{ color: "white" }}>{room.roomName}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(room)}
                      sx={{
                        color: "#667eea",
                        "&:hover": {
                          background: "rgba(102,126,234,0.2)",
                        },
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(room.id)}
                      sx={{
                        color: "#f5576c",
                        "&:hover": {
                          background: "rgba(245,87,108,0.2)",
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
            color: "white",
          },
        }}
      >
        <DialogTitle>{editRoom ? "Edit Room" : "Create New Room"}</DialogTitle>
        <DialogContent>
          {["roomId", "roomName"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field === "roomId" ? "Room ID" : "Room Name"}
              name={field}
              type="text"
              value={(formData as any)[field]}
              onChange={handleChange}
              fullWidth
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {editRoom ? "Update" : "Create"}
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

export default ManageRooms;
