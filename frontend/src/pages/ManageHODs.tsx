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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { hodAPI, departmentAPI } from "../services/api";
import type { User, Department } from "../types";
import {
  Add,
  ArrowBack,
  Edit,
  Delete,
  Search,
  ManageAccounts,
} from "@mui/icons-material";

const ManageHODs: React.FC = () => {
  const [hods, setHods] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editHod, setEditHod] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    departmentId: 0,
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

  const fetchData = async () => {
    try {
      const [hodRes, deptRes] = await Promise.all([
        hodAPI.getAllHods(),
        departmentAPI.getAllDepartments(),
      ]);
      setHods(hodRes.data);
      setDepartments(deptRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (hod?: User) => {
    if (hod) {
      setEditHod(hod);
      setFormData({
        username: hod.username,
        password: "",
        fullName: hod.fullName,
        email: hod.email,
        departmentId: hod.departmentId || 0,
      });
    } else {
      setEditHod(null);
      setFormData({
        username: "",
        password: "",
        fullName: "",
        email: "",
        departmentId: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "departmentId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editHod) {
        const updateData = Object.fromEntries(
          Object.entries(formData).filter(
            ([key, value]) => key !== "password" || value !== ""
          )
        );
        await hodAPI.updateHod(editHod.id, updateData);
        setNotification({
          open: true,
          message: "HOD updated successfully",
          severity: "success",
        });
      } else {
        await hodAPI.createHod(formData);
        setNotification({
          open: true,
          message: "HOD created successfully",
          severity: "success",
        });
      }
      setOpenDialog(false);
      fetchData();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.response?.data?.message || "Operation failed",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this HOD?")) return;
    try {
      await hodAPI.deleteHod(id);
      setNotification({
        open: true,
        message: "HOD deleted successfully",
        severity: "success",
      });
      fetchData();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  const filteredHods = hods.filter(
    (hod) =>
      hod.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hod.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hod.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h6">Loading HODs...</Typography>
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
            Manage HOD Accounts
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <ManageAccounts sx={{ mr: 1, verticalAlign: "middle" }} />
            Assign and Manage Departmental Heads
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
          Create New HOD
        </Button>

        <TextField
          placeholder="Search HOD..."
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
                {[
                  "Username",
                  "Full Name",
                  "Email",
                  "Department",
                  "Created At",
                  "Actions",
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
              {filteredHods.map((hod) => (
                <TableRow key={hod.id}>
                  <TableCell sx={{ color: "white" }}>{hod.username}</TableCell>
                  <TableCell sx={{ color: "white" }}>{hod.fullName}</TableCell>
                  <TableCell sx={{ color: "white" }}>{hod.email}</TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {hod.department?.name || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    {new Date(hod.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(hod)}
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
                      onClick={() => handleDelete(hod.id)}
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
        <DialogTitle>
          {editHod ? "Edit HOD Account" : "Create New HOD"}
        </DialogTitle>
        <DialogContent>
          {["username", "fullName", "email"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={
                field === "username"
                  ? "Username"
                  : field === "fullName"
                  ? "Full Name"
                  : "Email"
              }
              name={field}
              type={field === "email" ? "email" : "text"}
              value={(formData as any)[field]}
              onChange={handleChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                },
              }}
            />
          ))}
          <TextField
            margin="dense"
            label={
              editHod
                ? "New Password (leave blank to keep current)"
                : "Password"
            }
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Department"
            name="departmentId"
            select
            SelectProps={{ native: true }}
            value={formData.departmentId}
            onChange={handleChange}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              },
            }}
          >
            <option value={0} style={{ color: "black" }}>
              Select Department
            </option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id} style={{ color: "black" }}>
                {dept.name}
              </option>
            ))}
          </TextField>
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
            {editHod ? "Update" : "Create"}
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

export default ManageHODs;
