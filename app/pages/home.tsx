import { useState } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import '../style/Pages.css'
import '../style/home.css'

export default function HomeRoute() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Bài tập được chấp nhận',
      message: 'Bài tập Toán của bạn đã được chấp nhận',
      timestamp: '5 phút trước',
    },
    {
      id: 2,
      type: 'info',
      title: 'Lớp học mới',
      message: 'Bạn đã được thêm vào lớp Lập trình Python',
      timestamp: '1 giờ trước',
    },
    {
      id: 3,
      type: 'warning',
      title: 'Hạn chót sắp tới',
      message: 'Bài tập Tiếng Anh sẽ hết hạn trong 2 ngày',
      timestamp: '2 giờ trước',
    },
  ])

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Chào mừng trở lại</h1>
        <p>Quản lý học tập của bạn một cách hiệu quả</p>
      </div>

      <div className="home-content">
        <div className="notifications-section">
          <div className="section-header">
            <div className="section-title">
              <Bell size={24} />
              <h2>Thông báo</h2>
            </div>
            <span className="badge">{notifications.length}</span>
          </div>

          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className={`notification-item notification-${notification.type}`}>
                  <div className="notification-icon">
                    {notification.type === 'success' && <CheckCircle size={20} />}
                    {notification.type === 'warning' && <AlertCircle size={20} />}
                    {notification.type === 'info' && <Info size={20} />}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="timestamp">{notification.timestamp}</span>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="btn-close"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Bell size={48} />
                <p>Không có thông báo mới</p>
              </div>
            )}
          </div>
        </div>

        <div className="stats-section">
          <h2>Tổng quan</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ff9900' }}>📚</div>
              <div>
                <div className="stat-label">Khóa học</div>
                <div className="stat-value">12</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ff8d0c' }}>✓</div>
              <div>
                <div className="stat-label">Hoàn thành</div>
                <div className="stat-value">89%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ff9900' }}>⭐</div>
              <div>
                <div className="stat-label">Đánh giá</div>
                <div className="stat-value">4.8/5</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
