import api from '../utils/axios'
import type {
  ClassDTO,
  CreateClassRequest,
  UpdateClassRequest,
  StudentDTO,
  MaterialDTO,
  CreateMaterialRequest,
  GradeColumnDTO,
  CreateGradeColumnRequest,
  UpdateGradeColumnRequest,
  GradeDTO,
  CreateGradeRequest,
  UpdateGradeRequest,
  MessageDTO,
  CreateMessageRequest,
  UpdateReactionRequest,
  RankingDTO,
  SendNotificationRequest,
  NotificationDTO,
  SubjectAssignment,
  ProfileDTO,
  UpdateProfileRequest,
  // New types for refactored schema
  AssignmentDTO,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentSubmissionDTO,
  GradeSubmissionRequest,
  PostDTO,
  CreatePostRequest,
  UpdatePostRequest,
  PostCommentDTO,
  CreateCommentRequest,
  ClassDetailDTO,
  AssignmentType
} from '../types'

// Weight constants for auto-calculation
const ASSIGNMENT_WEIGHTS: Record<AssignmentType, number> = {
  homework: 0.2,
  project: 0.3,
  midterm: 0.25,
  final: 0.25
}

// ============================================
// CLASS MANAGEMENT
// ============================================

export const lecturerClassApi = {
  // List classes - GET /api/lecturer/classes
  // Query params: keyword (tên lớp), status (0/1), semester (bỏ qua)
  getClasses: async (params?: { keyword?: string; status?: number }) => {
    const response = await api.get<{ results: ClassDTO[] }>('/api/lecturer/classes', { params })
    return response.data
  },

  // Get class by ID
  getClassById: async (id: number) => {
    const response = await api.get<ClassDTO>(`/lecturer/classes/${id}`)
    return response.data
  },

  // Create class
  createClass: async (data: CreateClassRequest) => {
    const response = await api.post<ClassDTO>('/lecturer/classes', data)
    return response.data
  },

  // Update class
  updateClass: async (id: number, data: UpdateClassRequest) => {
    const response = await api.patch<ClassDTO>(`/lecturer/classes/${id}`, data)
    return response.data
  },

  // Deactivate class (soft delete)
  deactivateClass: async (id: number) => {
    const response = await api.patch<{ message: string }>(`/lecturer/classes/${id}/deactivate`)
    return response.data
  },

  // Get assigned subjects
  getAssignedSubjects: async () => {
    const response = await api.get<{ results: SubjectAssignment[] }>('/lecturer/subjects')
    return response.data
  }
}

// ============================================
// STUDENT MANAGEMENT
// ============================================

export const lecturerStudentApi = {
  // List students in class - GET /api/lecturer/students/{class_id}
  getStudentsInClass: async (classId: string, params?: { keyword?: string; status?: string }) => {
    const response = await api.get(`/api/lecturer/students/${classId}`, { params })
    // BE trả về { data: [...], count, message, status }
    return response.data
  },

  // Get student details
  getStudentById: async (studentId: number) => {
    const response = await api.get<StudentDTO>(`/lecturer/students/detail/${studentId}`)
    return response.data
  }
}

// ============================================
// ASSIGNMENT/MATERIAL MANAGEMENT
// ============================================

export const lecturerMaterialApi = {
  // List materials/assignments
  getMaterials: async (classId: number, params?: { keyword?: string }) => {
    const response = await api.get<{ results: MaterialDTO[] }>(`/lecturer/assignments/${classId}`, { params })
    return response.data
  },

  // Create material/assignment
  createMaterial: async (data: CreateMaterialRequest) => {
    const formData = new FormData()
    formData.append('class_id', data.class_id.toString())
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (data.file) formData.append('file', data.file)

    const response = await api.post<MaterialDTO>('/lecturer/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Delete material
  deleteMaterial: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/lecturer/assignments/${id}`)
    return response.data
  }
}

// ============================================
// GRADE COLUMN MANAGEMENT
// ============================================

export const lecturerGradeColumnApi = {
  // List grade columns
  getGradeColumns: async (classId: number, params?: { is_active?: boolean }) => {
    const response = await api.get<{ results: GradeColumnDTO[] }>(`/lecturer/grade-columns/${classId}`, { params })
    return response.data
  },

  // Create grade column
  createGradeColumn: async (data: CreateGradeColumnRequest) => {
    const response = await api.post<GradeColumnDTO>('/lecturer/grade-columns', data)
    return response.data
  },

  // Update grade column
  updateGradeColumn: async (id: number, data: UpdateGradeColumnRequest) => {
    const response = await api.put<GradeColumnDTO>(`/lecturer/grade-columns/${id}`, data)
    return response.data
  },

  // Delete grade column (soft delete)
  deleteGradeColumn: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/lecturer/grade-columns/${id}`)
    return response.data
  }
}

// ============================================
// GRADE MANAGEMENT
// ============================================

export const lecturerGradeApi = {
  // Get grades for class
  getGrades: async (classId: number) => {
    const response = await api.get<{ results: GradeDTO[] }>(`/lecturer/grades/${classId}`)
    return response.data
  },

  // Create grade
  createGrade: async (data: CreateGradeRequest) => {
    const response = await api.post<GradeDTO>('/lecturer/grades', data)
    return response.data
  },

  // Update grade
  updateGrade: async (id: number, data: UpdateGradeRequest) => {
    const response = await api.put<GradeDTO>(`/lecturer/grades/${id}`, data)
    return response.data
  },

  // Bulk create/update grades
  bulkUpdateGrades: async (grades: CreateGradeRequest[]) => {
    const response = await api.post<{ results: GradeDTO[] }>('/lecturer/grades/bulk', { grades })
    return response.data
  }
}

// ============================================
// CHAT/MESSAGE MANAGEMENT
// ============================================

export const chatApi = {
  // Get messages for class
  getMessages: async (classId: number, params?: { parent_id?: number | null }) => {
    const response = await api.get<{ results: MessageDTO[] }>(`/chat/messages/${classId}`, { params })
    return response.data
  },

  // Create message/post
  createMessage: async (data: CreateMessageRequest) => {
    const formData = new FormData()
    formData.append('class_id', data.class_id.toString())
    formData.append('type', data.type)
    if (data.content) formData.append('content', data.content)
    if (data.parent_id !== undefined && data.parent_id !== null) {
      formData.append('parent_id', data.parent_id.toString())
    }
    if (data.attachment) formData.append('attachment', data.attachment)

    const response = await api.post<MessageDTO>('/chat/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Delete message
  deleteMessage: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/chat/messages/${id}`)
    return response.data
  },

  // Update reactions
  updateReaction: async (id: number, data: UpdateReactionRequest) => {
    const response = await api.put<{ message: string; updatedReactions: Record<string, string> }>(
      `/chat/messages/${id}/reactions`,
      data
    )
    return response.data
  }
}

// ============================================
// RANKING
// ============================================

export const lecturerRankingApi = {
  // Get ranking for class
  getRanking: async (classId: number) => {
    const response = await api.get<{ results: RankingDTO[] }>(`/lecturer/ranking/${classId}`)
    return response.data
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export const lecturerNotificationApi = {
  // Send notification
  sendNotification: async (data: SendNotificationRequest) => {
    const response = await api.post<{ message: string }>('/lecturer/notifications/email', data)
    return response.data
  },

  // Get sent notifications
  getSentNotifications: async () => {
    const response = await api.get<{ results: NotificationDTO[] }>('/lecturer/notifications/sent')
    return response.data
  },

  // Get received notifications (system notifications)
  getReceivedNotifications: async () => {
    const response = await api.get<{ results: NotificationDTO[] }>('/notifications/received')
    return response.data
  },

  // Mark notification as read
  markAsRead: async (id: number) => {
    const response = await api.patch<{ message: string }>(`/notifications/${id}/read`)
    return response.data
  }
}

// ============================================
// ASSIGNMENT MANAGEMENT (New Schema)
// ============================================

export const lecturerAssignmentApi = {
  /**
   * POST /lecturer/assignments
   * Tạo bài tập mới per class (lưu vào assignments, upload file đính kèm optional vào assignment_materials via S3)
   */
  createAssignment: async (data: CreateAssignmentRequest) => {
    const formData = new FormData()
    formData.append('class_id', data.class_id.toString())
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('type', data.type)
    formData.append('deadline', data.deadline)
    formData.append('max_score', (data.max_score || 10).toString())
    formData.append('is_published', (data.is_published ?? false).toString())
    // Auto-calculate weight based on type
    const weight = ASSIGNMENT_WEIGHTS[data.type]
    formData.append('weight', weight.toString())

    // Attach files (optional - for assignment_materials)
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file)
      })
    }

    const response = await api.post<AssignmentDTO>('/lecturer/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * GET /api/lecturer/classes/{class_id}/assignments
   * Lấy list bài tập per class (từ assignments, include materials nếu có)
   */
  getAssignments: async (classId: string, params?: { keyword?: string; type?: string }) => {
    const response = await api.get(`/api/lecturer/classes/${classId}/assignments`, { params })
    // BE trả về { data: [...], count, message, status }
    return response.data
  },

  /**
   * GET /lecturer/classes/{class_id}/assignments/{assignment_id}
   * Get assignment by ID
   */
  getAssignmentById: async (classId: number, assignmentId: number) => {
    const response = await api.get<AssignmentDTO>(`/lecturer/classes/${classId}/assignments/${assignmentId}`)
    return response.data
  },

  /**
   * PUT /lecturer/assignments/{id}
   * Sửa bài tập/cột điểm của bài tập (e.g., thay đổi weight, title, type)
   */
  updateAssignment: async (assignmentId: number, data: UpdateAssignmentRequest) => {
    const response = await api.put<AssignmentDTO>(`/lecturer/assignments/${assignmentId}`, data)
    return response.data
  },

  /**
   * DELETE /lecturer/assignments/{id}
   * Xóa bài tập (soft delete - thay đổi is_published thành false)
   */
  deleteAssignment: async (assignmentId: number) => {
    const response = await api.delete<{ message: string }>(`/lecturer/assignments/${assignmentId}`)
    return response.data
  },

  /**
   * GET /lecturer/assignments/get-submissions
   * Lấy assignment_submissions của all học sinh (theo assignment_submissions)
   */
  getSubmissions: async (classId: number, assignmentId: number) => {
    const response = await api.get<{ results: AssignmentSubmissionDTO[] }>('/lecturer/assignments/get-submissions', {
      params: { class_id: classId, assignment_id: assignmentId }
    })
    return response.data
  },

  /**
   * POST /lecturer/assignments/
   * Tạo/chấm điểm mới cho sinh viên per assignment/class
   */
  createGrade: async (data: { assignment_id: number; student_id: number; score: number; feedback?: string }) => {
    const response = await api.post<AssignmentSubmissionDTO>('/lecturer/assignments/', data)
    return response.data
  },

  /**
   * PUT /lecturer/assignments/{assignment_id}/update-grades
   * Cập nhật điểm cho sinh viên per assignment
   */
  updateGrades: async (
    assignmentId: number,
    grades: Array<{ submission_id: number; score: number; feedback?: string }>
  ) => {
    const response = await api.put<{ results: AssignmentSubmissionDTO[] }>(
      `/lecturer/assignments/${assignmentId}/update-grades`,
      { grades }
    )
    return response.data
  },

  /**
   * Grade a single submission (convenience method)
   */
  gradeSubmission: async (
    classId: number,
    assignmentId: number,
    submissionId: number,
    data: GradeSubmissionRequest
  ) => {
    const response = await api.put<{ results: AssignmentSubmissionDTO[] }>(
      `/lecturer/assignments/${assignmentId}/update-grades`,
      { grades: [{ submission_id: submissionId, score: data.score, feedback: data.feedback }] }
    )
    return response.data.results?.[0]
  },

  // Publish/unpublish assignment (convenience method)
  togglePublish: async (assignmentId: number, is_published: boolean) => {
    const response = await api.put<AssignmentDTO>(`/lecturer/assignments/${assignmentId}`, { is_published })
    return response.data
  }
}

// ============================================
// POST MANAGEMENT (Discussion Posts - Only Lecturer creates)
// ============================================

export const lecturerPostApi = {
  /**
   * POST /api/lecturer/classes/{class_id}/posts
   * Tạo post gốc (chỉ dành cho GV)
   */
  createPost: async (classId: string, data: CreatePostRequest) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    formData.append('is_pinned', (data.is_pinned ?? false).toString())

    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }

    const response = await api.post<PostDTO>(`/api/lecturer/classes/${classId}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * GET /api/lecturer/classes/{class_id}/posts
   * Lấy danh sách posts của một lớp
   */
  getPosts: async (classId: string, params?: { keyword?: string }) => {
    const response = await api.get(`/api/lecturer/classes/${classId}/posts`, { params })
    // BE trả về { data: [...], count, message, status }
    return response.data
  },

  /**
   * GET /classes/{class_id}/posts/{post_id}
   * Lấy chi tiết một post
   */
  getPostById: async (classId: number, postId: number) => {
    const response = await api.get<PostDTO>(`/classes/${classId}/posts/${postId}`)
    return response.data
  },

  /**
   * PUT /classes/{class_id}/posts/{post_id}
   * Cập nhật post
   */
  updatePost: async (classId: number, postId: number, data: UpdatePostRequest) => {
    const response = await api.put<PostDTO>(`/classes/${classId}/posts/${postId}`, data)
    return response.data
  },

  /**
   * DELETE /classes/{class_id}/posts/{post_id}
   * Xóa post
   */
  deletePost: async (classId: number, postId: number) => {
    const response = await api.delete<{ message: string }>(`/classes/${classId}/posts/${postId}`)
    return response.data
  },

  /**
   * POST /posts/{post_id}/comments
   * Tạo comment cho một post (cho GV hoặc HS)
   */
  createComment: async (postId: number, data: CreateCommentRequest) => {
    const formData = new FormData()
    formData.append('content', data.content)
    if (data.parent_id) {
      formData.append('parent_id', data.parent_id.toString())
    }
    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }

    const response = await api.post<PostCommentDTO>(`/posts/${postId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * GET /posts/{post_id}/comments
   * Lấy danh sách comments của một post
   */
  getComments: async (postId: number) => {
    const response = await api.get<{ results: PostCommentDTO[] }>(`/posts/${postId}/comments`)
    return response.data
  },

  // Toggle pin status (convenience method)
  togglePin: async (classId: number, postId: number, is_pinned: boolean) => {
    const response = await api.put<PostDTO>(`/classes/${classId}/posts/${postId}`, { is_pinned })
    return response.data
  },

  // Like/unlike post
  toggleLike: async (classId: number, postId: number) => {
    const response = await api.post<{ message: string; like_count: number }>(`/classes/${classId}/posts/${postId}/like`)
    return response.data
  },

  // Delete comment
  deleteComment: async (postId: number, commentId: number) => {
    const response = await api.delete<{ message: string }>(`/posts/${postId}/comments/${commentId}`)
    return response.data
  }
}

// ============================================
// PROFILE
// ============================================

export const profileApi = {
  // Get profile - Authorization header được tự động thêm bởi axios interceptor
  getProfile: async () => {
    const response = await api.get<{ data: ProfileDTO }>('/api/users/profile')
    return response.data.data
  },

  // Update profile - PATCH với multipart/form-data
  updateProfile: async (data: UpdateProfileRequest & { avatarFile?: File }) => {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth)
    if (data.avatarFile) formData.append('avatarFile', data.avatarFile)

    const response = await api.patch('/api/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // Handle different response formats
    return response.data?.data || response.data
  },

  // Change password - POST /api/auth/change-password
  changePassword: async (data: { old_password: string; new_password: string; confirm_password: string }) => {
    const response = await api.post<{ message: string }>('/api/auth/change-password', {
      oldPassword: data.old_password,
      newPassword: data.new_password
    })
    return response.data
  }
}

export default {
  classes: lecturerClassApi,
  students: lecturerStudentApi,
  materials: lecturerMaterialApi,
  gradeColumns: lecturerGradeColumnApi,
  grades: lecturerGradeApi,
  chat: chatApi,
  ranking: lecturerRankingApi,
  notifications: lecturerNotificationApi,
  profile: profileApi,
  assignments: lecturerAssignmentApi,
  posts: lecturerPostApi
}
