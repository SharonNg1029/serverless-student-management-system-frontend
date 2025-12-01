'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Send as SendIcon,
  Search as SearchIcon,
  SelectAll as SelectAllIcon,
  History as HistoryIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { useAuthStore } from '../../store/authStore'
import { lecturerApi } from '../../services/lecturerApi'
import type { LecturerClass, ClassStudent, NotificationHistory, NotificationRequest } from '../../types'

const MOCK_CLASSES: LecturerClass[] = [
  { class_id: 'C001', class_name: 'Lập trình Web 101', subject_name: 'Web Development', semester: 'Học kỳ I' },
  { class_id: 'C002', class_name: 'Cơ sở dữ liệu', subject_name: 'Database', semester: 'Học kỳ II' }
]

const MOCK_STUDENTS: ClassStudent[] = [
  {
    student_id: 'S001',
    student_name: 'Nguyễn Văn A',
    email: 'student1@university.edu',
    attendance_rate: 92,
    current_score: 8.5,
    status: 'Active',
    assignments_completed: 10
  },
  {
    student_id: 'S002',
    student_name: 'Trần Thị B',
    email: 'student2@university.edu',
    attendance_rate: 88,
    current_score: 7.8,
    status: 'Active',
    assignments_completed: 9
  },
  {
    student_id: 'S003',
    student_name: 'Lê Văn C',
    email: 'student3@university.edu',
    attendance_rate: 95,
    current_score: 9.0,
    status: 'Active',
    assignments_completed: 10
  },
  {
    student_id: 'S004',
    student_name: 'Phạm Thị D',
    email: 'student4@university.edu',
    attendance_rate: 70,
    current_score: 5.5,
    status: 'Warning',
    assignments_completed: 6
  },
  {
    student_id: 'S005',
    student_name: 'Hoàng Văn E',
    email: 'student5@university.edu',
    attendance_rate: 45,
    current_score: 3.2,
    status: 'Inactive',
    assignments_completed: 3
  }
]

const MOCK_NOTIFICATION_HISTORY: NotificationHistory[] = [
  {
    notification_id: 'N001',
    title: 'Thông báo hạn nộp bài tập',
    message: 'Sinh viên vui lòng nộp bài tập trước hạn',
    type: 'info',
    recipient_count: 30,
    sent_at: '2024-01-20T10:30:00Z'
  },
  {
    notification_id: 'N002',
    title: 'Kiểm tra giữa kỳ',
    message: 'Kiểm tra giữa kỳ sẽ diễn ra vào thứ năm',
    type: 'warning',
    recipient_count: 35,
    sent_at: '2024-01-15T14:15:00Z'
  }
]

const MOCK_STUDENT_NOTIFICATIONS = [
  {
    notification_id: 'SN001',
    title: 'Bài tập tuần 1',
    message: 'Giáo viên đã gửi bài tập tuần 1',
    type: 'info',
    sent_at: '2024-01-20T10:30:00Z',
    sender: 'Giáo viên Nguyễn'
  },
  {
    notification_id: 'SN002',
    title: 'Nhắc nhở nộp bài',
    message: 'Bạn chưa nộp bài tập tuần 2',
    type: 'warning',
    sent_at: '2024-01-15T14:15:00Z',
    sender: 'Hệ thống'
  }
]

const MOCK_SYSTEM_NOTIFICATIONS = [
  {
    notification_id: 'SYS001',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống đã được cập nhật phiên bản mới',
    type: 'info',
    sent_at: '2024-01-18T08:00:00Z'
  },
  {
    notification_id: 'SYS002',
    title: 'Bảo trì định kỳ',
    message: 'Hệ thống sẽ bảo trì vào thứ sáu 22:00',
    type: 'warning',
    sent_at: '2024-01-10T09:00:00Z'
  }
]

const MOCK_LECTURER_NOTIFICATIONS = [
  {
    notification_id: 'LN001',
    title: 'Lịch thi cuối kỳ',
    message: 'Lịch thi cuối kỳ đã được công bố',
    type: 'info',
    sent_at: '2024-01-20T16:30:00Z'
  },
  {
    notification_id: 'LN002',
    title: 'Công khai điểm',
    message: 'Công khai điểm giữa kỳ',
    type: 'info',
    sent_at: '2024-01-08T13:15:00Z'
  }
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const NotificationsSend: React.FC = () => {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<LecturerClass[]>(MOCK_CLASSES)
  const [selectedClassId, setSelectedClassId] = useState<string>('C001')
  const [students, setStudents] = useState<ClassStudent[]>(MOCK_STUDENTS)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>(MOCK_NOTIFICATION_HISTORY)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tabValue, setTabValue] = useState(0)

  // Notification form
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'urgent',
    sendToAll: false
  })

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<NotificationHistory | null>(null)
  const [notificationType, setNotificationType] = useState<'sent' | 'student' | 'system' | 'lecturer'>('sent')

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents()
      fetchNotificationHistory()
    }
  }, [selectedClassId])

  const fetchClasses = async () => {
    try {
      try {
        const response = await lecturerApi.getClasses(user?.lecturer_id || '')
        setClasses(response.data || MOCK_CLASSES)
      } catch {
        setClasses(MOCK_CLASSES)
      }
      if (MOCK_CLASSES.length > 0) {
        setSelectedClassId(MOCK_CLASSES[0].class_id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch classes')
      setClasses(MOCK_CLASSES)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      try {
        const response = await lecturerApi.getClassStudents(selectedClassId)
        setStudents(response.data || MOCK_STUDENTS)
      } catch {
        setStudents(MOCK_STUDENTS)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students')
      setStudents(MOCK_STUDENTS)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationHistory = async () => {
    try {
      try {
        const response = await lecturerApi.getNotificationHistory(selectedClassId)
        setNotificationHistory(response.data || MOCK_NOTIFICATION_HISTORY)
      } catch {
        setNotificationHistory(MOCK_NOTIFICATION_HISTORY)
      }
    } catch (err: any) {
      console.error('Failed to fetch notification history:', err)
      setNotificationHistory(MOCK_NOTIFICATION_HISTORY)
    }
  }

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.student_id))
    }
  }

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      setError('Please fill in title and message')
      return
    }

    if (!notificationForm.sendToAll && selectedStudents.length === 0) {
      setError("Please select at least one student or check 'Send to all'")
      return
    }

    try {
      setSending(true)
      setError(null)

      const request: NotificationRequest = {
        class_id: selectedClassId,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        student_ids: notificationForm.sendToAll ? students.map((s) => s.student_id) : selectedStudents
      }

      await lecturerApi.sendNotification(request)
      setSuccess('Notification sent successfully!')
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        sendToAll: false
      })
      setSelectedStudents([])
      fetchNotificationHistory()
    } catch (err: any) {
      setError(err.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const handleViewNotification = (notification: NotificationHistory) => {
    setSelectedNotification(notification)
    setPreviewOpen(true)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'error'
      case 'warning':
        return 'warning'
      default:
        return 'info'
    }
  }

  const renderNotificationList = (notifications: any[]) => (
    <TableContainer component={Paper} variant='outlined' sx={{ backgroundColor: 'white' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#1976d2' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tiêu đề</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại</TableCell>
            {notificationType !== 'student' && notificationType !== 'system' && (
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người gửi</TableCell>
            )}
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thời gian</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align='center'>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                <Typography color='text.secondary'>Không có thông báo nào</Typography>
              </TableCell>
            </TableRow>
          ) : (
            notifications.map((notification) => (
              <TableRow key={notification.notification_id} hover>
                <TableCell>
                  <Typography variant='body2' fontWeight='medium'>
                    {notification.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={notification.type} color={getTypeColor(notification.type) as any} size='small' />
                </TableCell>
                {notificationType !== 'student' && notificationType !== 'system' && (
                  <TableCell>{notification.sender || '-'}</TableCell>
                )}
                <TableCell>{new Date(notification.sent_at).toLocaleString('vi-VN')}</TableCell>
                <TableCell align='center'>
                  <Tooltip title='Xem chi tiết'>
                    <IconButton size='small' onClick={() => handleViewNotification(notification)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Typography variant='h4' fontWeight='bold' gutterBottom>
        Thông báo
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3, backgroundColor: 'white' }}>
        <CardContent>
          <TextField
            select
            label='Chọn lớp'
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            sx={{ minWidth: 300 }}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.class_id} value={cls.class_id}>
                {cls.class_name} ({cls.class_id})
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      <Card sx={{ backgroundColor: 'white' }}>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label='Gửi thông báo' icon={<SendIcon />} iconPosition='start' />
            <Tab
              label='Lịch sử gửi'
              icon={<HistoryIcon />}
              iconPosition='start'
              onClick={() => setNotificationType('sent')}
            />
            <Tab
              label='Thông báo cũ SV'
              icon={<HistoryIcon />}
              iconPosition='start'
              onClick={() => setNotificationType('student')}
            />
            <Tab
              label='Thông báo hệ thống'
              icon={<HistoryIcon />}
              iconPosition='start'
              onClick={() => setNotificationType('system')}
            />
            <Tab
              label='Thông báo GV'
              icon={<HistoryIcon />}
              iconPosition='start'
              onClick={() => setNotificationType('lecturer')}
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Notification Form */}
              <Grid item xs={12} md={6}>
                <Typography variant='h6' gutterBottom>
                  Soạn thông báo
                </Typography>

                <TextField
                  fullWidth
                  label='Tiêu đề'
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder='Nhập tiêu đề thông báo'
                />

                <TextField
                  select
                  fullWidth
                  label='Loại'
                  value={notificationForm.type}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      type: e.target.value as 'info' | 'warning' | 'urgent'
                    })
                  }
                  sx={{ mb: 2 }}
                >
                  <MenuItem value='info'>Thông tin</MenuItem>
                  <MenuItem value='warning'>Cảnh báo</MenuItem>
                  <MenuItem value='urgent'>Khẩn cấp</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label='Nội dung'
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder='Nhập nội dung thông báo...'
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationForm.sendToAll}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          sendToAll: e.target.checked
                        })
                      }
                    />
                  }
                  label='Gửi tới toàn bộ sinh viên trong lớp'
                />

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant='contained'
                    size='large'
                    startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handleSendNotification}
                    disabled={sending}
                    fullWidth
                  >
                    {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                  </Button>
                </Box>
              </Grid>

              {/* Student Selection */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant='h6'>
                    Chọn người nhận ({selectedStudents.length}/{filteredStudents.length})
                  </Typography>
                  <Button
                    size='small'
                    startIcon={<SelectAllIcon />}
                    onClick={handleSelectAll}
                    disabled={notificationForm.sendToAll}
                  >
                    {selectedStudents.length === filteredStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  size='small'
                  placeholder='Tìm kiếm sinh viên...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  disabled={notificationForm.sendToAll}
                />

                <Paper
                  variant='outlined'
                  sx={{
                    maxHeight: 350,
                    overflow: 'auto',
                    opacity: notificationForm.sendToAll ? 0.5 : 1,
                    backgroundColor: 'white'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Table size='small'>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow
                            key={student.student_id}
                            hover
                            onClick={() => !notificationForm.sendToAll && handleSelectStudent(student.student_id)}
                            sx={{ cursor: notificationForm.sendToAll ? 'default' : 'pointer' }}
                          >
                            <TableCell padding='checkbox'>
                              <Checkbox
                                checked={notificationForm.sendToAll || selectedStudents.includes(student.student_id)}
                                disabled={notificationForm.sendToAll}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                                  {student.student_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant='body2'>{student.student_name}</Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {student.student_id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderNotificationList(notificationHistory)}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderNotificationList(MOCK_STUDENT_NOTIFICATIONS)}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderNotificationList(MOCK_SYSTEM_NOTIFICATIONS)}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {renderNotificationList(MOCK_LECTURER_NOTIFICATIONS)}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Chi tiết thông báo</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary'>
                  Tiêu đề
                </Typography>
                <Typography variant='body1' fontWeight='medium'>
                  {selectedNotification.title}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary'>
                  Loại
                </Typography>
                <Box>
                  <Chip
                    label={selectedNotification.type}
                    color={getTypeColor(selectedNotification.type) as any}
                    size='small'
                  />
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' color='text.secondary'>
                  Nội dung
                </Typography>
                <Paper variant='outlined' sx={{ p: 2, mt: 0.5, backgroundColor: '#f5f5f5' }}>
                  <Typography variant='body2'>{selectedNotification.message}</Typography>
                </Paper>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Thời gian gửi
                </Typography>
                <Typography variant='body2'>
                  {new Date(selectedNotification.sent_at).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NotificationsSend
