import api from '../utils/axios'
import type {
  CalendarAssignment,
  StudentEnrolledClassDTO,
  EnrolledClassesResponse,
  EnrollUnenrollRequest,
  EnrollUnenrollResponse,
  StudentAssignmentDTO,
  StudentSubmissionDTO,
  StudentSubmitAssignmentRequest,
  PostDTO,
  PostCommentDTO,
  CreatePostCommentRequest
} from '../types'

// ============================================
// STUDENT CLASS API
// ============================================

export const studentClassApi = {
  /**
   * GET /student/classes/class-enrolled
   * Lấy danh sách các lớp đã đăng ký của student
   */
  getEnrolledClasses: async (studentId: string): Promise<StudentEnrolledClassDTO[]> => {
    const { data } = await api.get<EnrolledClassesResponse>('/student/classes/class-enrolled', {
      params: { student_id: studentId }
    })
    return data.results || []
  },

  /**
   * POST /student/enroll
   * Enroll hoặc Unenroll một lớp học
   */
  enrollOrUnenroll: async (request: EnrollUnenrollRequest): Promise<EnrollUnenrollResponse> => {
    const { data } = await api.post<EnrollUnenrollResponse>('/student/enroll', request)
    return data
  },

  /**
   * Enroll vào một lớp học (cần password)
   */
  enroll: async (classId: string, studentId: string, password: string): Promise<EnrollUnenrollResponse> => {
    return studentClassApi.enrollOrUnenroll({
      class_id: classId,
      action: 'enroll',
      studentId,
      password
    })
  },

  /**
   * Unenroll khỏi một lớp học
   */
  unenroll: async (classId: string, studentId: string): Promise<EnrollUnenrollResponse> => {
    return studentClassApi.enrollOrUnenroll({
      class_id: classId,
      action: 'unenroll',
      studentId
    })
  }
}

// ============================================
// STUDENT ASSIGNMENT API
// ============================================

export const studentAssignmentApi = {
  /**
   * GET /student/assignments
   * Lấy danh sách tất cả assignments của student
   */
  getAssignments: async (params?: { class_id?: number }): Promise<StudentAssignmentDTO[]> => {
    const { data } = await api.get<{ results: StudentAssignmentDTO[] }>('/student/assignments', { params })
    return data.results || []
  },

  /**
   * GET /student/assignments/:id
   * Lấy chi tiết một assignment
   */
  getAssignmentById: async (assignmentId: number): Promise<StudentAssignmentDTO> => {
    const { data } = await api.get<StudentAssignmentDTO>(`/student/assignments/${assignmentId}`)
    return data
  },

  /**
   * POST /student/submit
   * Nộp bài tập
   */
  submitAssignment: async (request: StudentSubmitAssignmentRequest): Promise<StudentSubmissionDTO> => {
    const formData = new FormData()
    formData.append('assignment_id', request.assignment_id.toString())
    if (request.file) {
      formData.append('file', request.file)
    }

    const { data } = await api.post<StudentSubmissionDTO>('/student/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  /**
   * GET /student/assignments/get-submissions
   * Lấy submissions của student theo assignment
   */
  getMySubmissions: async (assignmentId: number): Promise<StudentSubmissionDTO[]> => {
    const { data } = await api.get<{ results: StudentSubmissionDTO[] }>('/student/assignments/get-submissions', {
      params: { assignment_id: assignmentId }
    })
    return data.results || []
  },

  /**
   * PUT /student/assignments/get-submissions
   * Cập nhật submission của student
   */
  updateSubmission: async (submissionId: number, file: File): Promise<StudentSubmissionDTO> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.put<StudentSubmissionDTO>(`/student/assignments/get-submissions/${submissionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  /**
   * GET /student/assignments/calendar
   * Lấy danh sách bài tập cho calendar
   */
  getCalendarAssignments: async (month?: number, year?: number): Promise<CalendarAssignment[]> => {
    const params: Record<string, number> = {}
    if (month) params.month = month
    if (year) params.year = year

    const { data } = await api.get('/student/assignments/calendar', { params })
    return data.assignments || data || []
  }
}

// ============================================
// STUDENT POST/COMMENT API
// ============================================

export const studentPostApi = {
  /**
   * GET /classes/:class_id/posts
   * Lấy danh sách posts của một lớp
   */
  getPosts: async (classId: number): Promise<PostDTO[]> => {
    const { data } = await api.get<{ results: PostDTO[] }>(`/classes/${classId}/posts`)
    return data.results || []
  },

  /**
   * GET /classes/:class_id/posts/:post_id
   * Lấy chi tiết một post
   */
  getPostById: async (classId: number, postId: number): Promise<PostDTO> => {
    const { data } = await api.get<PostDTO>(`/classes/${classId}/posts/${postId}`)
    return data
  },

  /**
   * POST /posts/:post_id/comments
   * Tạo comment cho một post (student hoặc lecturer)
   */
  createComment: async (postId: number, request: CreatePostCommentRequest): Promise<PostCommentDTO> => {
    const formData = new FormData()
    formData.append('content', request.content)
    if (request.parent_id) {
      formData.append('parent_id', request.parent_id.toString())
    }
    if (request.attachment) {
      formData.append('attachment', request.attachment)
    }

    const { data } = await api.post<PostCommentDTO>(`/posts/${postId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  /**
   * GET /posts/:post_id/comments
   * Lấy danh sách comments của một post
   */
  getComments: async (postId: number): Promise<PostCommentDTO[]> => {
    const { data } = await api.get<{ results: PostCommentDTO[] }>(`/posts/${postId}/comments`)
    return data.results || []
  },

  /**
   * POST /classes/:class_id/posts/:post_id/like
   * Like/unlike một post
   */
  toggleLike: async (classId: number, postId: number): Promise<{ message: string; like_count: number }> => {
    const { data } = await api.post<{ message: string; like_count: number }>(`/classes/${classId}/posts/${postId}/like`)
    return data
  }
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

// Keep old function names for backward compatibility
export const fetchEnrolledClasses = studentClassApi.getEnrolledClasses
export const enrollOrUnenrollClass = studentClassApi.enrollOrUnenroll
export const enrollClass = studentClassApi.enroll
export const unenrollClass = studentClassApi.unenroll
export const fetchCalendarAssignments = studentAssignmentApi.getCalendarAssignments

export default {
  classes: studentClassApi,
  assignments: studentAssignmentApi,
  posts: studentPostApi
}
