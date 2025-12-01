"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  FileDownload as DownloadIcon,
  Person as PersonIcon,
} from "@mui/icons-material"
import { useAuthStore } from "../../../store/authStore"
import type { LecturerClass, ClassStudent } from "../../../types"

const MOCK_CLASSES: LecturerClass[] = [
  {
    class_id: "C001",
    class_name: "Lập trình Web 101",
    subject_name: "Web Development",
    semester: "Học kỳ I",
    schedule: "T2-T4",
    room: "A301",
  },
  {
    class_id: "C002",
    class_name: "Cơ sở dữ liệu",
    subject_name: "Database",
    semester: "Học kỳ II",
    schedule: "T3-T5",
    room: "A302",
  },
]

const MOCK_STUDENTS: ClassStudent[] = [
  {
    student_id: "S001",
    student_name: "Nguyễn Văn A",
    email: "student1@university.edu",
    attendance_rate: 92,
    current_score: 8.5,
    status: "Active",
    assignments_completed: 10,
  },
  {
    student_id: "S002",
    student_name: "Trần Thị B",
    email: "student2@university.edu",
    attendance_rate: 88,
    current_score: 7.8,
    status: "Active",
    assignments_completed: 9,
  },
  {
    student_id: "S003",
    student_name: "Lê Văn C",
    email: "student3@university.edu",
    attendance_rate: 95,
    current_score: 9.0,
    status: "Active",
    assignments_completed: 10,
  },
  {
    student_id: "S004",
    student_name: "Phạm Thị D",
    email: "student4@university.edu",
    attendance_rate: 70,
    current_score: 5.5,
    status: "Warning",
    assignments_completed: 6,
  },
  {
    student_id: "S005",
    student_name: "Hoàng Văn E",
    email: "student5@university.edu",
    attendance_rate: 45,
    current_score: 3.2,
    status: "Inactive",
    assignments_completed: 3,
  },
]

const StudentsManagementList: React.FC = () => {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<LecturerClass[]>(MOCK_CLASSES)
  const [selectedClassId, setSelectedClassId] = useState<string>("C001")
  const [students, setStudents] = useState<ClassStudent[]>(MOCK_STUDENTS)
  const [loading, setLoading] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Student detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {}, [])

  const handleViewStudent = async (student: ClassStudent) => {
    setSelectedStudent(student)
    setDetailOpen(true)
    setLoadingDetail(false)
  }

  const handleExportStudents = async () => {
    try {
      const csvContent = [
        ["ID", "Name", "Email", "Attendance", "Score", "Status"],
        ...students.map((s) => [s.student_id, s.student_name, s.email, s.attendance_rate, s.current_score, s.status]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `students_${selectedClassId}.csv`)
      link.click()
    } catch (err: any) {
      setError(err.message || "Failed to export students")
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success"
      case "inactive":
        return "error"
      case "warning":
        return "warning"
      default:
        return "default"
    }
  }

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý sinh viên
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              select
              label="Chọn lớp"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              sx={{ minWidth: 250 }}
              disabled={loadingClasses}
            >
              {classes.map((cls) => (
                <MenuItem key={cls.class_id} value={cls.class_id}>
                  {cls.class_name} ({cls.class_id})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              placeholder="Tìm kiếm sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ flexGrow: 1 }} />

            <Chip label={`${filteredStudents.length} sinh viên`} color="primary" variant="outlined" />

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportStudents}
              disabled={!selectedClassId}
            >
              Xuất CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Class Info Card */}
      {selectedClass && (
        <Card sx={{ mb: 3, backgroundColor: "#f5f7ff" }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="primary">
                  {selectedClass.class_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedClass.subject_name} | {selectedClass.semester}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", gap: 3, justifyContent: { md: "flex-end" } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Lịch học
                    </Typography>
                    <Typography variant="body2">{selectedClass.schedule || "Chưa xác định"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phòng học
                    </Typography>
                    <Typography variant="body2">{selectedClass.room || "Chưa xác định"}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card sx={{ backgroundColor: "#fafafa" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sinh viên</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                  Có mặt
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                  Điểm TB
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                  Trạng thái
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Không tìm thấy sinh viên</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.student_id} hover sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, backgroundColor: "#dd7323" }}>
                          {student.student_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {student.student_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.student_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{student.email || "-"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${student.attendance_rate?.toFixed(0) || 0}%`}
                        size="small"
                        color={
                          (student.attendance_rate || 0) >= 80
                            ? "success"
                            : (student.attendance_rate || 0) >= 50
                              ? "warning"
                              : "error"
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        fontWeight="bold"
                        color={(student.current_score || 0) >= 5 ? "success.main" : "error.main"}
                      >
                        {student.current_score?.toFixed(2) || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={student.status || "Active"}
                        size="small"
                        color={getStatusColor(student.status || "active") as any}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" color="primary" onClick={() => handleViewStudent(student)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Gửi email">
                        <IconButton
                          size="small"
                          color="secondary"
                          href={`mailto:${student.email}`}
                          disabled={!student.email}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon color="primary" />
            Chi tiết sinh viên
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent ? (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{ width: 100, height: 100, fontSize: 40, mx: "auto", mb: 2, backgroundColor: "#dd7323" }}
                    >
                      {selectedStudent.student_name?.charAt(0)}
                    </Avatar>
                    <Typography variant="h6">{selectedStudent.student_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudent.student_id}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Thông tin liên hệ
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2">{selectedStudent.email || "-"}</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Kết quả học tập
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center", p: 2, backgroundColor: "grey.100", borderRadius: 2 }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {selectedStudent.attendance_rate?.toFixed(0) || 0}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Có mặt
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center", p: 2, backgroundColor: "grey.100", borderRadius: 2 }}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {selectedStudent.current_score?.toFixed(1) || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Điểm TB
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center", p: 2, backgroundColor: "grey.100", borderRadius: 2 }}>
                        <Typography variant="h4" color="info.main" fontWeight="bold">
                          {selectedStudent.assignments_completed || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bài tập hoàn thành
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
          {selectedStudent?.email && (
            <Button variant="contained" startIcon={<EmailIcon />} href={`mailto:${selectedStudent.email}`}>
              Gửi email
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentsManagementList
