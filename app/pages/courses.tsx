import '../style/Pages.css'

export default function CoursesRoute() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Quản lý khóa học</h1>
        <p>Danh sách tất cả khóa học</p>
      </div>

      <div className="page-content">
        <div className="courses-grid">
          <div className="course-card">
            <div className="course-header">Toán 12</div>
            <p className="course-desc">Kiến thức toán nâng cao</p>
            <div className="course-info">
              <span>45 học sinh</span>
              <span>25 bài học</span>
            </div>
          </div>
          <div className="course-card">
            <div className="course-header">Văn 12</div>
            <p className="course-desc">Phân tích tác phẩm văn học</p>
            <div className="course-info">
              <span>38 học sinh</span>
              <span>20 bài học</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
