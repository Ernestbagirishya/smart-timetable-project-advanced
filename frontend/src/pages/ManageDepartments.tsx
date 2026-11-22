import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Box,
  Grid,
  Fade,
  Zoom,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  School,
  Person,
  Warning,
  CheckCircle,
  Search,
  CorporateFare,
} from "@mui/icons-material";
import { departmentAPI } from "../services/api";
import type {
  Department,
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "../types";

const ManageDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState<DepartmentCreateInput>({
    name: "",
    code: "",
    departmentType: "PRIVATE",
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    department: null as Department | null,
  });
  const [editForm, setEditForm] = useState<DepartmentUpdateInput>({
    name: "",
    code: "",
    departmentType: "PRIVATE",
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAllDepartments();
      setDepartments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    try {
      await departmentAPI.createDepartment(createForm);
      setCreateForm({ name: "", code: "", departmentType: "PRIVATE" });
      fetchDepartments();
      alert("Department created successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create department");
    }
  };

  const handleEdit = async () => {
    if (!editDialog.department) return;
    try {
      await departmentAPI.updateDepartment(editDialog.department.id, editForm);
      setEditDialog({ open: false, department: null });
      fetchDepartments();
      alert("Department updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update department");
    }
  };

  const handleDelete = async () => {
    try {
      await departmentAPI.deleteDepartment(deleteDialog.id);
      setDeleteDialog({ open: false, id: 0 });
      fetchDepartments();
      alert("Department deleted successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditDialog({ open: true, department: dept });
    setEditForm({
      name: dept.name,
      code: dept.code,
      departmentType: dept.departmentType,
    });
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase())
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
        <CircularProgress size={60} sx={{ color: "#667eea", mb: 2 }} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Departments...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0A192F 0%, #112240 50%, #1a365d 100%)",
        }}
      >
        <Alert severity="error">{error}</Alert>
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
        overflowX: "hidden",
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
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
            Manage Departments
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            <CorporateFare sx={{ mr: 1, verticalAlign: "middle" }} />
            Academic Department Management
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

      {/* Create Section */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          color: "white",
          mb: 4,
          width: "100%",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            <Add sx={{ mr: 1 }} /> Create New Department
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Department Name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                fullWidth
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "white" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Code"
                value={createForm.code}
                onChange={(e) =>
                  setCreateForm({ ...createForm, code: e.target.value })
                }
                fullWidth
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "white" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Type"
                value={createForm.departmentType}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    departmentType: e.target.value as "PUBLIC" | "PRIVATE",
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                }}
              >
                <MenuItem value="PUBLIC">Public</MenuItem>
                <MenuItem value="PRIVATE">Private</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                onClick={handleCreate}
                sx={{
                  py: 1.5,
                  width: "100%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Department Table */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 2,
          color: "white",
          width: "100%",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              <School sx={{ mr: 1 }} /> Department List
            </Typography>
            <TextField
              placeholder="Search..."
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

          <TableContainer component={Paper} sx={{ background: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow>
                  {["ID", "Name", "Code", "Type", "HOD", "Actions"].map(
                    (header) => (
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
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell sx={{ color: "white" }}>{dept.id}</TableCell>
                    <TableCell sx={{ color: "white" }}>{dept.name}</TableCell>
                    <TableCell sx={{ color: "white" }}>{dept.code}</TableCell>
                    <TableCell>
                      <Chip
                        label={dept.departmentType}
                        sx={{
                          background:
                            dept.departmentType === "PUBLIC"
                              ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {dept.hod ? (
                        <Chip
                          icon={<Person />}
                          label={dept.hod.fullName}
                          sx={{
                            background: "rgba(67,233,123,0.2)",
                            color: "#43e97b",
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<Warning />}
                          label="No HOD"
                          sx={{
                            background: "rgba(245,87,108,0.2)",
                            color: "#f5576c",
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          onClick={() => openEditDialog(dept)}
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
                          onClick={() =>
                            setDeleteDialog({ open: true, id: dept.id })
                          }
                          sx={{
                            color: "#f5576c",
                            "&:hover": {
                              background: "rgba(245,87,108,0.2)",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, department: null })}
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
            color: "white",
          },
        }}
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              },
            }}
          />
          <TextField
            label="Code"
            value={editForm.code}
            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialog({ open: false, department: null })}
          >
            Cancel
          </Button>
          <Button onClick={handleEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: 0 })}
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
            color: "white",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this department? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: 0 })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageDepartments;
