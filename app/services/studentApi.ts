import api from '../utils/axios'
import type { CalendarAssignment } from '../types'

// ============================================
// STUDENT API FUNCTIONS
// ============================================

// Types for enrolled classes
export interface ClassDTO {
  class_id: string
  name: string
  student_count: number
  status: number
  subjectName: string
  lecturerName: string
  semester?: string
  academic_year?: string
  description?: string
  enrolled_at?: string
}

export interface EnrolledClassesResponse {
  results: ClassDTO[]
}

export interface EnrollUnenrollRequest {
  class_id: string
  action: 'enroll' | 'unenroll'
  studentId: string
  password?: string // Required only for enroll action
}

export interface EnrollUnenrollResponse {
  message: string
}

/**
 * GET /student/classes/class-enrolled
 * Lấy danh sách các lớp đã đăng ký của student
 * @param studentId - ID của student
 */
export const fetchEnrolledClasses = async (studentId: string): Promise<ClassDTO[]> => {
  const { data } = await api.get<EnrolledClassesResponse>('/student/classes/class-enrolled', {
    params: { student_id: studentId }
  })
  return data.results || []
}

/**
 * POST /student/enroll
 * Enroll hoặc Unenroll một lớp học
 * @param request - Thông tin enroll/unenroll
 */
export const enrollOrUnenrollClass = async (
  request: EnrollUnenrollRequest
): Promise<EnrollUnenrollResponse> => {
  const { data } = await api.post<EnrollUnenrollResponse>('/student/enroll', request)
  return data
}

/**
 * Enroll vào một lớp học (cần password)
 * @param classId - ID của lớp
 * @param studentId - ID của student
 * @param password - Mật khẩu để enroll
 */
export const enrollClass = async (
  classId: string,
  studentId: string,
  password: string
): Promise<EnrollUnenrollResponse> => {
  return enrollOrUnenrollClass({
    class_id: classId,
    action: 'enroll',
    studentId,
    password
  })
}

/**
 * Unenroll khỏi một lớp học (không cần password)
 * @param classId - ID của lớp
 * @param studentId - ID của student
 */
export const unenrollClass = async (
  classId: string,
  studentId: string
): Promise<EnrollUnenrollResponse> => {
  return enrollOrUnenrollClass({
    class_id: classId,
    action: 'unenroll',
    studentId
  })
}

/**
 * GET /student/assignments/calendar
 * Lấy danh sách bài tập của các lớp mà student đang enrolled
 * @param month - Tháng (1-12)
 * @param year - Năm
 */
export const fetchCalendarAssignments = async (
  month?: number,
  year?: number
): Promise<CalendarAssignment[]> => {
  const params: Record<string, number> = {}
  if (month) params.month = month
  if (year) params.year = year
  
  const { data } = await api.get('/student/assignments/calendar', { params })
  return data.assignments || data || []
}
