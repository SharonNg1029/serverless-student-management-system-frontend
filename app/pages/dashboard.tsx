import '../style/Dashboard.css'
import '../style/Pages.css'

export default function DashboardRoute() {
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Bảng điều khiển</h1>
        <p>Tổng quan về hệ thống quản lý</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff9900' }}>👥</div>
          <div>
            <div className="stat-label">Tổng học sinh</div>
            <div className="stat-value">245</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff8d0c' }}>📚</div>
          <div>
            <div className="stat-label">Khóa học</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff9900' }}>✓</div>
          <div>
            <div className="stat-label">Hoàn thành</div>
            <div className="stat-value">89%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff8d0c' }}>⭐</div>
          <div>
            <div className="stat-label">Đánh giá trung bình</div>
            <div className="stat-value">4.8/5</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <h2>Nội dung dashboard sẽ được cập nhật</h2>
      </div>
    </div>
  )
}
