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
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Chip,
} from "@mui/material"
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material"
import { useNavigate, useParams } from "react-router-dom"
import { lecturerApi } from "../../../services/lecturerApi"
import type { ClassStudent } from "../../../types"

const StudentEdit: React.FC = () => {
  const navigate = useNavigate()
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>()
  const [student, setStudent] = useState<ClassStudent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    status: "active",
    notes: "",
    attendance_rate: 0,
  })

  useEffect(() => {
    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const response = await lecturerApi.getStudentDetail(studentId!)
      setStudent(response.data)
      setFormData({
        status: response.data.status || "active",
        notes: response.data.notes || "",
        attendance_rate: response.data.attendance_rate || 0,
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch student")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)
      setError(null)
      await lecturerApi.updateStudentInClass(classId!, studentId!, formData)
      setSuccess("Student information updated successfully!")
      setTimeout(() => {
        navigate(`/lecturer/students-management`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to update student")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Edit Student Information
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Student Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, fontSize: 32, mx: "auto", mb: 2 }}>
                  {student?.student_name?.charAt(0)}
                </Avatar>
                <Typography variant="h6">{student?.student_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {student?.student_id}
                </Typography>
                <Chip
                  label={student?.status || "Active"}
                  color={student?.status === "active" ? "success" : "default"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">{student?.email || "-"}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2">{student?.phone || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current Score
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {student?.current_score?.toFixed(2) || "-"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Note: You can only update limited information about students in your class.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Manual Attendance Rate (%)"
                    value={formData.attendance_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attendance_rate: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    inputProps={{ min: 0, max: 100 }}
                    helperText="Override attendance rate if needed"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this student..."
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default StudentEdit
