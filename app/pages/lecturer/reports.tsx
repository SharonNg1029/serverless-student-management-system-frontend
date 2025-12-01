'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { RefreshCw as Refresh, Printer, FileDown, Users, TrendingUp, Award } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import type { LecturerClass, ClassReport } from '../../types'

const MOCK_CLASSES: LecturerClass[] = [
  { class_id: 'C001', class_name: 'Lập trình Web 101 (C001)', subject_name: 'Web Development', semester: 'Học kỳ I' },
  { class_id: 'C002', class_name: 'Cơ sở dữ liệu (C002)', subject_name: 'Database', semester: 'Học kỳ II' }
]

const generateMockReport = (classId: string): ClassReport => ({
  class_id: classId,
  total_students: 35,
  average_score: 7.2,
  pass_rate: 88.5,
  attendance_rate: 92.3,
  grade_distribution: [
    { grade: 'A', count: 12 },
    { grade: 'B', count: 15 },
    { grade: 'C', count: 6 },
    { grade: 'D', count: 2 }
  ],
  score_trends: [
    { period: 'W1', average: 6.5, highest: 8.5, lowest: 4.2 },
    { period: 'W2', average: 6.8, highest: 8.7, lowest: 4.5 },
    { period: 'W3', average: 7.1, highest: 9.0, lowest: 4.8 },
    { period: 'W4', average: 7.2, highest: 9.2, lowest: 5.0 }
  ],
  top_performers: [
    { student_id: 'S001', student_name: 'Nguyễn Văn A', total_score: 9.2 },
    { student_id: 'S002', student_name: 'Trần Thị B', total_score: 9.0 },
    { student_id: 'S003', student_name: 'Lê Văn C', total_score: 8.8 }
  ],
  students_at_risk: [
    { student_id: 'S028', student_name: 'Phạm Văn D', total_score: 3.5, issue: 'Điểm thấp' },
    { student_id: 'S029', student_name: 'Hoàng Thị E', total_score: 4.0, issue: 'Vắng nhiều' }
  ]
})

const LecturerReports: React.FC = () => {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<LecturerClass[]>(MOCK_CLASSES)
  const [selectedClassId, setSelectedClassId] = useState<string>('C001')
  const [report, setReport] = useState<ClassReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (classes.length > 0) {
      setSelectedClassId(classes[0].class_id)
    }
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      fetchReport()
    }
  }, [selectedClassId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      setReport(generateMockReport(selectedClassId))
    } catch (error) {
      console.error('Error fetching report:', error)
      setReport(generateMockReport(selectedClassId))
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    alert('PDF export feature coming soon')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className='min-h-screen bg-slate-50 p-4 md:p-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900 mb-2'>Báo cáo lớp học</h1>
        <p className='text-slate-600'>Xem chi tiết hiệu suất học tập của lớp</p>
      </div>

      {/* Filter and Actions */}
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8'>
        <div className='flex flex-col md:flex-row md:items-end gap-4 justify-between'>
          <div className='flex flex-col md:flex-row gap-4 flex-1'>
            <div className='flex-1 md:max-w-xs'>
              <label className='block text-sm font-medium text-slate-700 mb-2'>Chọn lớp</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent bg-white'
              >
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex-1 md:max-w-xs'>
              <label className='block text-sm font-medium text-slate-700 mb-2'>Loại báo cáo</label>
              <select className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent bg-white'>
                <option value='overview'>Tổng quan</option>
                <option value='attendance'>Điểm danh</option>
                <option value='assignments'>Bài tập</option>
              </select>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={fetchReport}
              className='px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2'
            >
              <Refresh size={18} />
              <span className='hidden sm:inline'>Làm mới</span>
            </button>
            <button
              onClick={handlePrint}
              className='px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2'
            >
              <Printer size={18} />
              <span className='hidden sm:inline'>In</span>
            </button>
            <button
              onClick={handleExportPDF}
              className='px-4 py-2 bg-[#dd7323] text-white rounded-lg font-medium hover:bg-[#c2621a] transition-colors flex items-center gap-2'
            >
              <FileDown size={18} />
              <span className='hidden sm:inline'>Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center'>
          <div className='inline-block animate-spin'>
            <div className='w-8 h-8 border-4 border-slate-200 border-t-[#dd7323] rounded-full' />
          </div>
          <p className='text-slate-600 mt-4'>Đang tải báo cáo...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Stats */}
          <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8'>
            <h3 className='text-lg font-bold text-slate-900 mb-6'>Tóm tắt báo cáo</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <div className='text-3xl font-bold text-blue-600'>{report.total_students}</div>
                <p className='text-sm text-slate-600 mt-1'>Tổng sinh viên</p>
              </div>
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <div className='text-3xl font-bold text-green-600'>{report.average_score?.toFixed(1)}</div>
                <p className='text-sm text-slate-600 mt-1'>Điểm TB</p>
              </div>
              <div className='text-center p-4 bg-emerald-50 rounded-lg'>
                <div className='text-3xl font-bold text-emerald-600'>{report.pass_rate?.toFixed(1)}%</div>
                <p className='text-sm text-slate-600 mt-1'>Tỉ lệ đạt</p>
              </div>
              <div className='text-center p-4 bg-orange-50 rounded-lg'>
                <div className='text-3xl font-bold text-orange-600'>{report.attendance_rate?.toFixed(1)}%</div>
                <p className='text-sm text-slate-600 mt-1'>Tỉ lệ có mặt</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            {/* Score Distribution */}
            <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>Phân bố điểm</h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={report.grade_distribution || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='grade' />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey='count' fill='#3b82f6' name='Sinh viên' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Score Trend */}
            <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>Xu hướng điểm số</h3>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={report.score_trends || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='period' />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type='monotone' dataKey='average' stroke='#10b981' name='Cao nhất' strokeWidth={2} />
                  <Line type='monotone' dataKey='highest' stroke='#06b6d4' name='TB lớp' strokeWidth={2} />
                  <Line type='monotone' dataKey='lowest' stroke='#f97316' name='Thấp nhất' strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Rankings */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Top Performers */}
            <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <Award size={20} className='text-yellow-500' />
                Sinh viên xuất sắc
              </h3>
              <div className='space-y-3'>
                {(report.top_performers || []).map((student, index) => (
                  <div
                    key={student.student_id}
                    className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-2xl font-bold text-yellow-500'>#{index + 1}</span>
                      <div>
                        <p className='font-medium text-slate-800'>{student.student_name}</p>
                        <p className='text-xs text-slate-500'>{student.student_id}</p>
                      </div>
                    </div>
                    <span className='text-lg font-bold text-[#dd7323]'>{student.total_score?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Needing Support */}
            <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <TrendingUp size={20} className='text-red-500' />
                Sinh viên cần hỗ trợ
              </h3>
              <div className='space-y-3'>
                {(report.students_at_risk || []).map((student) => (
                  <div key={student.student_id} className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-slate-800'>{student.student_name}</p>
                      <p className='text-xs text-red-600'>{student.issue}</p>
                    </div>
                    <span className='text-lg font-bold text-red-600'>{student.total_score?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center'>
          <Users size={48} className='mx-auto mb-4 text-slate-300' />
          <p className='text-slate-500'>Chọn lớp để xem báo cáo</p>
        </div>
      )}
    </div>
  )
}

export default LecturerReports
