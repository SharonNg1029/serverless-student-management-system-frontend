import '../style/Pages.css'

export default function StudentsRoute() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Quản lý học sinh</h1>
        <p>Danh sách tất cả học sinh</p>
      </div>

      <div className="page-content">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã học sinh</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Lớp</th>
              <th>Điểm trung bình</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>HS001</td>
              <td>Nguyễn Văn A</td>
              <td>nguyenvana@email.com</td>
              <td>12A1</td>
              <td>8.5</td>
              <td><button className="btn-action">Xem chi tiết</button></td>
            </tr>
            <tr>
              <td>HS002</td>
              <td>Trần Thị B</td>
              <td>tranthib@email.com</td>
              <td>12A2</td>
              <td>9.0</td>
              <td><button className="btn-action">Xem chi tiết</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
