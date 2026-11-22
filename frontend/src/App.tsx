import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./hooks/useAuth";

import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentRegister from "./pages/StudentRegister";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManageDepartments from "./pages/ManageDepartments";
import ManageHODs from "./pages/ManageHODs";
import ManageRooms from "./pages/ManageRooms";
import ManageCourses from "./pages/ManageCourses";
import GenerateTimetables from "./pages/GenerateTimetables";
import ManagerChangePassword from "./pages/ManagerChangePassword";
import HodDashboard from "./pages/HodDashboard";
import HodManageCourses from "./pages/HodManageCourses";
import HodManageLecturerAccount from "./pages/HodManageLecturerAccount";
import HodManageClasses from "./pages/HodManageClasses";
import HodManageCatPlans from "./pages/HodManageCatPlans";
import HodManageSpecialCases from "./pages/HodManageSpecialCases";
import HodViewDepartmentTimetables from "./pages/HodViewDepartmentTimetables";
import HodChangePassword from "./pages/HodChangePassword";
import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerManageCatPlans from "./pages/LecturerManageCatPlans";
import LecturerUploadResources from "./pages/LecturerUploadResources";
import LecturerTimetable from "./pages/LecturerTimetable";
import LecturerSpecialCases from "./pages/LecturerSpecialCases";
import LecturerChangePassword from "./pages/LecturerChangePassword";
import StudentDashboard from "./pages/StudentDashboard";
import StudentTimetable from "./pages/StudentTimetable";
import StudentResources from "./pages/StudentResources";
import StudentSubmitSpecialCase from "./pages/StudentSubmitSpecialCase";
import StudentChangePassword from "./pages/StudentChangePassword";
import StudentViewCatPlans from "./pages/StudentViewCatPlans";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-student" element={<StudentRegister />} />
            <Route path="/managerdashboard" element={<ManagerDashboard />} />
            <Route path="/manage-departments" element={<ManageDepartments />} />
            <Route path="/manage-hods" element={<ManageHODs />} />
            <Route path="/manage-rooms" element={<ManageRooms />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route
              path="/generate-timetables"
              element={<GenerateTimetables />}
            />
            <Route
              path="/change-password"
              element={<ManagerChangePassword />}
            />
            <Route path="/hoddashboard" element={<HodDashboard />} />
            <Route
              path="/manage-department-courses"
              element={<HodManageCourses />}
            />
            <Route
              path="/manage-hod-accounts"
              element={<HodManageLecturerAccount />}
            />
            <Route path="/manage-classes" element={<HodManageClasses />} />
            <Route path="/manage-cat-plans" element={<HodManageCatPlans />} />
            <Route path="/special-cases" element={<HodManageSpecialCases />} />
            <Route
              path="/hod-view-department-timetables"
              element={<HodViewDepartmentTimetables />}
            />
            <Route
              path="/hod_change_password"
              element={<HodChangePassword />}
            />
            <Route path="/lecturedashboard" element={<LecturerDashboard />} />
            <Route path="/cat-plans" element={<LecturerManageCatPlans />} />
            <Route
              path="/upload-resources"
              element={<LecturerUploadResources />}
            />
            <Route path="/lecturer-timetable" element={<LecturerTimetable />} />
            <Route
              path="/lecturer-special-cases"
              element={<LecturerSpecialCases />}
            />
            <Route
              path="/lecturer-change-password"
              element={<LecturerChangePassword />}
            />
            <Route path="/studentdashboard" element={<StudentDashboard />} />
            <Route path="/student-timetable" element={<StudentTimetable />} />
            <Route path="/student-resources" element={<StudentResources />} />
            <Route
              path="/submit-special-case"
              element={<StudentSubmitSpecialCase />}
            />
            <Route
              path="/student-change-password"
              element={<StudentChangePassword />}
            />
            <Route
              path="/student-view-catplans"
              element={<StudentViewCatPlans />}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
