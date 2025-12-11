/**
 * Helper để chuyển đổi lỗi kỹ thuật thành thông báo thân thiện với người dùng
 * Không hiển thị status code hay error message từ BE
 */

// Map các loại lỗi theo context/feature
export const ERROR_MESSAGES = {
  // Auth errors
  auth: {
    default: 'Đã xảy ra lỗi xác thực. Vui lòng đăng nhập lại.',
    expired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    unauthorized: 'Bạn không có quyền thực hiện thao tác này.',
    notFound: 'Không tìm thấy thông tin tài khoản.'
  },

  // Class/Course errors
  class: {
    fetch: 'Không thể tải danh sách lớp học. Vui lòng thử lại.',
    create: 'Không thể tạo lớp học. Vui lòng thử lại.',
    update: 'Không thể cập nhật lớp học. Vui lòng thử lại.',
    delete: 'Không thể xóa lớp học. Vui lòng thử lại.',
    enroll: 'Không thể đăng ký lớp học. Vui lòng kiểm tra mật khẩu.',
    unenroll: 'Không thể hủy đăng ký lớp học. Vui lòng thử lại.',
    notFound: 'Không tìm thấy lớp học.'
  },

  // Assignment errors
  assignment: {
    fetch: 'Không thể tải danh sách bài tập. Vui lòng thử lại.',
    create: 'Không thể tạo bài tập. Vui lòng thử lại.',
    update: 'Không thể cập nhật bài tập. Vui lòng thử lại.',
    delete: 'Không thể xóa bài tập. Vui lòng thử lại.',
    submit: 'Không thể nộp bài. Vui lòng thử lại.',
    grade: 'Không thể chấm điểm. Vui lòng thử lại.',
    notFound: 'Không tìm thấy bài tập.'
  },

  // Post errors
  post: {
    fetch: 'Không thể tải bài đăng. Vui lòng thử lại.',
    create: 'Không thể tạo bài đăng. Vui lòng thử lại.',
    update: 'Không thể cập nhật bài đăng. Vui lòng thử lại.',
    delete: 'Không thể xóa bài đăng. Vui lòng thử lại.',
    notFound: 'Không tìm thấy bài đăng.'
  },

  // Comment errors
  comment: {
    fetch: 'Không thể tải bình luận. Vui lòng thử lại.',
    create: 'Không thể gửi bình luận. Vui lòng thử lại.',
    delete: 'Không thể xóa bình luận. Vui lòng thử lại.'
  },

  // Student errors
  student: {
    fetch: 'Không thể tải danh sách sinh viên. Vui lòng thử lại.',
    notFound: 'Không tìm thấy sinh viên.'
  },

  // User errors
  user: {
    fetch: 'Không thể tải thông tin người dùng. Vui lòng thử lại.',
    update: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
    notFound: 'Không tìm thấy người dùng.'
  },

  // Subject errors
  subject: {
    fetch: 'Không thể tải danh sách môn học. Vui lòng thử lại.',
    create: 'Không thể tạo môn học. Vui lòng thử lại.',
    update: 'Không thể cập nhật môn học. Vui lòng thử lại.',
    delete: 'Không thể xóa môn học. Vui lòng thử lại.'
  },

  // Upload errors
  upload: {
    default: 'Không thể tải file lên. Vui lòng thử lại.',
    tooLarge: 'File quá lớn. Vui lòng chọn file nhỏ hơn.',
    invalidType: 'Định dạng file không hợp lệ.'
  },

  // Notification errors
  notification: {
    fetch: 'Không thể tải thông báo. Vui lòng thử lại.'
  },

  // Search errors
  search: {
    default: 'Không thể tìm kiếm. Vui lòng thử lại.'
  },

  // Generic errors
  generic: {
    default: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    network: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối.',
    server: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    timeout: 'Yêu cầu quá thời gian. Vui lòng thử lại.'
  }
}

type ErrorCategory = keyof typeof ERROR_MESSAGES
type ErrorAction<T extends ErrorCategory> = keyof (typeof ERROR_MESSAGES)[T]

/**
 * Lấy thông báo lỗi thân thiện dựa trên category và action
 */
export function getErrorMessage<T extends ErrorCategory>(category: T, action: ErrorAction<T>): string {
  return (ERROR_MESSAGES[category] as Record<string, string>)[action as string] || ERROR_MESSAGES.generic.default
}

/**
 * Chuyển đổi error từ API thành thông báo thân thiện
 * Không hiển thị status code hay technical details
 */
export function formatApiError(error: unknown, category: ErrorCategory, action: string): string {
  // Log error cho debugging (chỉ trong console, không hiển thị cho user)
  console.error(`[${category}/${action}] API Error:`, error)

  // Trả về thông báo thân thiện
  const messages = ERROR_MESSAGES[category] as Record<string, string>
  return messages[action] || messages['default'] || ERROR_MESSAGES.generic.default
}
