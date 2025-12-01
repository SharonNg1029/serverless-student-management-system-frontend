'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Loader2,
  Filter,
  BarChart3,
  PieChartIcon,
  TableIcon
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { lecturerRankingApi } from '../../services/lecturerApi'
import type { ClassDTO, RankingDTO } from '../../types'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']

const MOCK_CLASSES: ClassDTO[] = [
  {
    id: 1,
    name: 'Lập trình Web 101',
    subject_name: 'Web Development',
    semester: 'Học kỳ I',
    academic_year: '2024-2025'
  },
  {
    id: 2,
    name: 'Cơ sở dữ liệu',
    subject_name: 'Database',
    semester: 'Học kỳ II',
    academic_year: '2024-2025'
  },
  {
    id: 3,
    name: 'Lập trình Python',
    subject_name: 'Python Programming',
    semester: 'Học kỳ I',
    academic_year: '2024-2025'
  }
]

const MOCK_RANKING_DATA: RankingDTO[] = [
  {
    rank: 1,
    student_id: 'S001',
    student_name: 'Nguyễn Văn A',
    student_code: '2020001',
    score: 9.2,
    avatar: '',
    recommendations: 'Xuất sắc'
  },
  {
    rank: 2,
    student_id: 'S002',
    student_name: 'Trần Thị B',
    student_code: '2020002',
    score: 9.0,
    avatar: '',
    recommendations: 'Rất tốt'
  },
  {
    rank: 3,
    student_id: 'S003',
    student_name: 'Lê Văn C',
    student_code: '2020003',
    score: 8.8,
    avatar: '',
    recommendations: 'Tốt'
  },
  {
    rank: 4,
    student_id: 'S004',
    student_name: 'Phạm Thị D',
    student_code: '2020004',
    score: 8.5,
    avatar: '',
    recommendations: 'Tốt'
  },
  {
    rank: 5,
    student_id: 'S005',
    student_name: 'Hoàng Văn E',
    student_code: '2020005',
    score: 8.2,
    avatar: '',
    recommendations: 'Tốt'
  },
  {
    rank: 6,
    student_id: 'S006',
    student_name: 'Vũ Thị F',
    student_code: '2020006',
    score: 7.8,
    avatar: '',
    recommendations: 'Khá'
  },
  {
    rank: 7,
    student_id: 'S007',
    student_name: 'Ngô Văn G',
    student_code: '2020007',
    score: 7.5,
    avatar: '',
    recommendations: 'Khá'
  },
  {
    rank: 8,
    student_id: 'S008',
    student_name: 'Bùi Thị H',
    student_code: '2020008',
    score: 7.2,
    avatar: '',
    recommendations: 'Khá'
  },
  {
    rank: 9,
    student_id: 'S009',
    student_name: 'Đinh Văn I',
    student_code: '2020009',
    score: 6.8,
    avatar: '',
    recommendations: 'Trung bình'
  },
  {
    rank: 10,
    student_id: 'S010',
    student_name: 'Đặng Thị J',
    student_code: '2020010',
    score: 6.5,
    avatar: '',
    recommendations: 'Trung bình'
  },
  {
    rank: 11,
    student_id: 'S011',
    student_name: 'Giang Văn K',
    student_code: '2020011',
    score: 6.2,
    avatar: '',
    recommendations: 'Trung bình'
  },
  {
    rank: 12,
    student_id: 'S012',
    student_name: 'Hà Thị L',
    student_code: '2020012',
    score: 5.8,
    avatar: '',
    recommendations: 'Trung bình yếu'
  },
  {
    rank: 13,
    student_id: 'S013',
    student_name: 'Kiều Văn M',
    student_code: '2020013',
    score: 5.5,
    avatar: '',
    recommendations: 'Trung bình yếu'
  },
  {
    rank: 14,
    student_id: 'S014',
    student_name: 'Lương Thị N',
    student_code: '2020014',
    score: 5.0,
    avatar: '',
    recommendations: 'Yếu'
  },
  {
    rank: 15,
    student_id: 'S015',
    student_name: 'Mạc Văn O',
    student_code: '2020015',
    score: 4.5,
    avatar: '',
    recommendations: 'Yếu'
  }
]

export default function RankingAnalyst() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassDTO[]>(MOCK_CLASSES)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [rankingData, setRankingData] = useState<RankingDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'distribution'>('table')

  useEffect(() => {
    if (classes.length > 0) {
      setSelectedClassId(classes[0].id)
    }
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      fetchRanking()
    }
  }, [selectedClassId])

  const fetchRanking = async () => {
    if (!selectedClassId) return

    try {
      setLoadingRanking(true)
      const response = await lecturerRankingApi.getRanking(selectedClassId)
      setRankingData(response.results || MOCK_RANKING_DATA)
    } catch (error: any) {
      console.log('[v0] Using mock data - API not available')
      setRankingData(MOCK_RANKING_DATA)
    } finally {
      setLoadingRanking(false)
    }
  }

  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    rankingData.forEach((student) => {
      const score = student.score || 0
      if (score >= 8.5) distribution.A++
      else if (score >= 7.0) distribution.B++
      else if (score >= 5.5) distribution.C++
      else if (score >= 4.0) distribution.D++
      else distribution.F++
    })
    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  }

  const getStatistics = () => {
    if (rankingData.length === 0) return null

    const scores = rankingData.map((s) => s.score)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const passRate = (scores.filter((s) => s >= 4.0).length / scores.length) * 100

    return { avg, max, min, passRate, total: rankingData.length }
  }

  const getGradeLabel = (score: number) => {
    if (score >= 8.5) return { label: 'A', color: 'bg-emerald-100 text-emerald-700' }
    if (score >= 7.0) return { label: 'B', color: 'bg-blue-100 text-blue-700' }
    if (score >= 5.5) return { label: 'C', color: 'bg-yellow-100 text-yellow-700' }
    if (score >= 4.0) return { label: 'D', color: 'bg-orange-100 text-orange-700' }
    return { label: 'F', color: 'bg-red-100 text-red-700' }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-slate-400'
    if (rank === 3) return 'text-orange-400'
    return 'text-slate-600'
  }

  const stats = getStatistics()
  const selectedClass = classes.find((c) => c.id === selectedClassId)

  return (
    <div className='min-h-screen bg-slate-50 p-4 md:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Xếp hạng & Thống kê</h1>
          <p className='text-slate-500 mt-1'>Phân tích điểm số xếp hạng sinh viên theo từng lớp</p>
        </div>
        <button
          onClick={() => navigate('/lecturer/grades-management/list')}
          className='flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all'
        >
          Quản lý điểm
        </button>
      </div>

      {/* Class Selection */}
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-4'>
        <div className='flex flex-wrap gap-3 items-end'>
          <div className='w-72'>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              <Filter size={14} className='inline mr-1' /> Chọn lớp
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent'
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject_name}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className='text-sm text-slate-500'>
              <span className='font-medium'>{selectedClass.semester}</span> - {selectedClass.academic_year}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && rankingData.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-xl'>
                <Users size={24} />
              </div>
              <div>
                <p className='text-sm opacity-80'>Tổng sinh viên</p>
                <h3 className='text-2xl font-bold'>{stats.total}</h3>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-xl'>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className='text-sm opacity-80'>Điểm TB</p>
                <h3 className='text-2xl font-bold'>{stats.avg.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-[#dd7323] to-orange-500 text-white p-5 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-xl'>
                <Award size={24} />
              </div>
              <div>
                <p className='text-sm opacity-80'>Điểm cao nhất</p>
                <h3 className='text-2xl font-bold'>{stats.max.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-xl'>
                <TrendingDown size={24} />
              </div>
              <div>
                <p className='text-sm opacity-80'>Điểm thấp nhất</p>
                <h3 className='text-2xl font-bold'>{stats.min.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-slate-700 to-slate-800 text-white p-5 rounded-2xl shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-xl'>
                <BarChart3 size={24} />
              </div>
              <div>
                <p className='text-sm opacity-80'>Tỉ lệ đạt</p>
                <h3 className='text-2xl font-bold'>{stats.passRate.toFixed(1)}%</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
        <div className='flex border-b border-slate-200'>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'table'
                ? 'text-[#dd7323] border-b-2 border-[#dd7323] bg-orange-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TableIcon size={18} />
            Bảng xếp hạng
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'chart'
                ? 'text-[#dd7323] border-b-2 border-[#dd7323] bg-orange-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 size={18} />
            Biểu đồ điểm
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'distribution'
                ? 'text-[#dd7323] border-b-2 border-[#dd7323] bg-orange-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PieChartIcon size={18} />
            Phân bố điểm
          </button>
        </div>

        <div className='p-6 bg-white'>
          {loadingRanking ? (
            <div className='py-12 text-center'>
              <Loader2 size={32} className='text-[#dd7323] animate-spin mx-auto mb-3' />
              <p className='text-slate-600'>Đang tải xếp hạng...</p>
            </div>
          ) : rankingData.length === 0 ? (
            <div className='py-12 text-center'>
              <Award size={48} className='mx-auto mb-4 text-slate-300' />
              <p className='text-slate-500'>Chưa có dữ liệu xếp hạng cho lớp này</p>
            </div>
          ) : (
            <>
              {activeTab === 'table' && (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-slate-100 border-b border-slate-200'>
                        <th className='px-4 py-3 text-left font-semibold text-slate-700'>Hạng</th>
                        <th className='px-4 py-3 text-left font-semibold text-slate-700'>Sinh viên</th>
                        <th className='px-4 py-3 text-center font-semibold text-slate-700'>Điểm</th>
                        <th className='px-4 py-3 text-center font-semibold text-slate-700'>Xếp loại</th>
                        <th className='px-4 py-3 text-left font-semibold text-slate-700'>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingData.map((student) => {
                        const gradeInfo = getGradeLabel(student.score)
                        return (
                          <tr
                            key={student.student_id}
                            className='border-b border-slate-100 hover:bg-slate-50 transition-colors'
                          >
                            <td className='px-4 py-3'>
                              <div className='flex items-center gap-2'>
                                {student.rank <= 3 && <Award size={20} className={getRankColor(student.rank)} />}
                                <span className={`font-bold ${getRankColor(student.rank)}`}>#{student.rank}</span>
                              </div>
                            </td>
                            <td className='px-4 py-3'>
                              <div className='flex items-center gap-3'>
                                <img
                                  src={`https://ui-avatars.com/api/?name=${student.student_name}&background=dd7323&color=fff`}
                                  alt={student.student_name}
                                  className='w-10 h-10 rounded-full'
                                />
                                <div>
                                  <p className='font-medium text-slate-800'>{student.student_name}</p>
                                  <p className='text-xs text-slate-500'>{student.student_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className='px-4 py-3 text-center'>
                              <span className='text-lg font-bold text-[#dd7323]'>{student.score.toFixed(2)}</span>
                            </td>
                            <td className='px-4 py-3 text-center'>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${gradeInfo.color}`}>
                                {gradeInfo.label}
                              </span>
                            </td>
                            <td className='px-4 py-3 text-sm text-slate-500'>{student.recommendations || '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'chart' && (
                <div className='h-[400px]'>
                  <h3 className='text-lg font-semibold text-slate-800 mb-4'>Top 10 sinh viên điểm cao nhất</h3>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={rankingData.slice(0, 10).map((s) => ({
                        name: s.student_name?.split(' ').pop() || 'N/A',
                        score: s.score
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                      <XAxis
                        dataKey='name'
                        angle={-45}
                        textAnchor='end'
                        interval={0}
                        height={60}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis domain={[0, 10]} tick={{ fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey='score' fill='#dd7323' name='Điểm' radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeTab === 'distribution' && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-slate-800 mb-4'>Phân bố xếp loại</h3>
                    <ResponsiveContainer width='100%' height={300}>
                      <PieChart>
                        <Pie
                          data={getGradeDistribution()}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {getGradeDistribution().map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-slate-800 mb-4'>Chi tiết phân bố</h3>
                    <div className='space-y-4'>
                      {getGradeDistribution().map((item, index) => (
                        <div key={item.name}>
                          <div className='flex justify-between mb-1'>
                            <span className='font-medium text-slate-700'>Loại {item.name}</span>
                            <span className='font-bold' style={{ color: COLORS[index] }}>
                              {item.value} sinh viên
                            </span>
                          </div>
                          <div className='w-full bg-slate-200 rounded-full h-2 overflow-hidden'>
                            <div
                              className='h-full transition-all'
                              style={{
                                width: `${(item.value / stats.total) * 100}%`,
                                backgroundColor: COLORS[index]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
