'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, Users, TrendingUp, FileText, ChevronRight, Loader2, Award, Calendar, Clock } from 'lucide-react'
import { lecturerClassApi, lecturerRankingApi } from '../../services/lecturerApi'
import type { ClassDTO, RankingDTO } from '../../types'

interface ClassWithAvgScore extends ClassDTO {
  avg_score?: number
}

export default function LecturerDashboard() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassWithAvgScore[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassWithAvgScore | null>(null)
  const [classRanking, setClassRanking] = useState<RankingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRanking, setLoadingRanking] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await lecturerClassApi.getClasses()
      setClasses(response.results || [])

      // Select first class by default
      if (response.results && response.results.length > 0) {
        handleSelectClass(response.results[0])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClass = async (cls: ClassDTO) => {
    setSelectedClass(cls)
    setLoadingRanking(true)

    try {
      const rankingRes = await lecturerRankingApi.getRanking(cls.id)
      setClassRanking(rankingRes.results || [])

      // Calculate avg score
      if (rankingRes.results && rankingRes.results.length > 0) {
        const avgScore = rankingRes.results.reduce((sum, r) => sum + r.score, 0) / rankingRes.results.length
        setSelectedClass({ ...cls, avg_score: avgScore })
      }
    } catch (error) {
      console.error('Error fetching ranking:', error)
      setClassRanking([])
    } finally {
      setLoadingRanking(false)
    }
  }

  const activeClasses = classes.filter((c) => c.status === 1).length
  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mx-auto mb-3' />
          <p className='text-slate-600'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 pb-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Dashboard Giảng viên</h1>
          <p className='text-slate-500 mt-1'>Tổng quan hoạt động giảng dạy của bạn</p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/lecturer/classes-management/form')}
            className='flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all shadow-lg shadow-orange-200 text-sm'
          >
            <BookOpen size={16} />
            Tạo lớp mới
          </button>
        </div>
      </div>

      {/* Stats Cards - Removed avg_score */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Tổng số lớp</p>
              <h3 className='text-2xl font-bold text-slate-800 mt-1'>{classes.length}</h3>
            </div>
            <div className='p-3 bg-blue-50 rounded-xl text-blue-500'>
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Lớp đang mở</p>
              <h3 className='text-2xl font-bold text-emerald-600 mt-1'>{activeClasses}</h3>
            </div>
            <div className='p-3 bg-emerald-50 rounded-xl text-emerald-500'>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Tổng sinh viên</p>
              <h3 className='text-2xl font-bold text-[#dd7323] mt-1'>{totalStudents}</h3>
            </div>
            <div className='p-3 bg-orange-50 rounded-xl text-[#dd7323]'>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className='bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Bài tập đã giao</p>
              <h3 className='text-2xl font-bold text-purple-600 mt-1'>--</h3>
            </div>
            <div className='p-3 bg-purple-50 rounded-xl text-purple-500'>
              <FileText size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Class List with Click to show details */}
        <div className='lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
          <div className='p-4 border-b border-slate-100'>
            <h3 className='font-bold text-slate-800'>Danh sách lớp học</h3>
            <p className='text-xs text-slate-400'>Chọn lớp để xem chi tiết</p>
          </div>

          <div className='max-h-[400px] overflow-y-auto'>
            {classes.length === 0 ? (
              <div className='p-8 text-center text-slate-500'>
                <BookOpen size={40} className='mx-auto mb-3 text-slate-300' />
                <p>Bạn chưa có lớp học nào</p>
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => handleSelectClass(cls)}
                  className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${
                    selectedClass?.id === cls.id ? 'bg-orange-50 border-l-4 border-l-[#dd7323]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-semibold text-slate-800 text-sm'>{cls.name}</h4>
                      <p className='text-xs text-slate-500 mt-1'>{cls.subject_name}</p>
                      <div className='flex items-center gap-3 mt-2 text-xs text-slate-400'>
                        <span className='flex items-center gap-1'>
                          <Users size={12} /> {cls.student_count || 0}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Calendar size={12} /> {cls.semester}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.status === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cls.status === 1 ? 'Mở' : 'Đóng'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='p-3 border-t border-slate-100 bg-slate-50'>
            <button
              onClick={() => navigate('/lecturer/classes-management/list')}
              className='w-full text-center text-sm font-medium text-[#dd7323] hover:text-[#c2621a] flex items-center justify-center gap-1'
            >
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Selected Class Details with avg_score displayed only here */}
        <div className='lg:col-span-2 space-y-6'>
          {selectedClass ? (
            <>
              {/* Class Info Card */}
              <div className='bg-white rounded-2xl shadow-sm border border-slate-100 p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h3 className='text-lg font-bold text-slate-800'>{selectedClass.name}</h3>
                    <p className='text-slate-500'>{selectedClass.subject_name}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/lecturer/classes-management/details/${selectedClass.id}`)}
                    className='px-3 py-1.5 bg-[#dd7323] text-white rounded-lg text-sm hover:bg-[#c2621a] transition-colors'
                  >
                    Chi tiết
                  </button>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='bg-blue-50 rounded-xl p-4 text-center'>
                    <Users size={20} className='text-blue-500 mx-auto mb-1' />
                    <p className='text-xl font-bold text-blue-600'>{selectedClass.student_count || 0}</p>
                    <p className='text-xs text-blue-500'>Sinh viên</p>
                  </div>

                  <div className='bg-orange-50 rounded-xl p-4 text-center'>
                    <Award size={20} className='text-[#dd7323] mx-auto mb-1' />
                    <p className='text-xl font-bold text-[#dd7323]'>{selectedClass.avg_score?.toFixed(1) || '--'}</p>
                    <p className='text-xs text-orange-500'>Điểm TB</p>
                  </div>

                  <div className='bg-emerald-50 rounded-xl p-4 text-center'>
                    <Calendar size={20} className='text-emerald-500 mx-auto mb-1' />
                    <p className='text-sm font-bold text-emerald-600'>{selectedClass.semester}</p>
                    <p className='text-xs text-emerald-500'>{selectedClass.academic_year}</p>
                  </div>

                  <div className='bg-purple-50 rounded-xl p-4 text-center'>
                    <Clock size={20} className='text-purple-500 mx-auto mb-1' />
                    <p className='text-sm font-bold text-purple-600'>
                      {selectedClass.status === 1 ? 'Đang mở' : 'Đã đóng'}
                    </p>
                    <p className='text-xs text-purple-500'>Trạng thái</p>
                  </div>
                </div>
              </div>

              {/* Top Ranking Students */}
              <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
                <div className='p-4 border-b border-slate-100 flex items-center justify-between'>
                  <div>
                    <h3 className='font-bold text-slate-800'>Top sinh viên</h3>
                    <p className='text-xs text-slate-400'>Xếp hạng điểm cao nhất trong lớp</p>
                  </div>
                  <button
                    onClick={() => navigate('/lecturer/ranking-analyst')}
                    className='text-sm text-[#dd7323] hover:underline'
                  >
                    Xem tất cả
                  </button>
                </div>

                {loadingRanking ? (
                  <div className='p-8 text-center'>
                    <Loader2 size={24} className='text-[#dd7323] animate-spin mx-auto' />
                  </div>
                ) : classRanking.length === 0 ? (
                  <div className='p-8 text-center text-slate-500'>
                    <Award size={40} className='mx-auto mb-3 text-slate-300' />
                    <p>Chưa có dữ liệu xếp hạng</p>
                  </div>
                ) : (
                  <div className='divide-y divide-slate-50'>
                    {classRanking.slice(0, 5).map((student, index) => (
                      <div
                        key={student.student_id}
                        className='p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors'
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-600'
                              : index === 1
                                ? 'bg-slate-100 text-slate-600'
                                : index === 2
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <img
                          src={
                            student.avatar ||
                            `https://ui-avatars.com/api/?name=${student.student_name || '/placeholder.svg'}&background=random`
                          }
                          alt={student.student_name}
                          className='w-10 h-10 rounded-full object-cover'
                        />
                        <div className='flex-1'>
                          <h4 className='font-semibold text-slate-800 text-sm'>{student.student_name}</h4>
                          <p className='text-xs text-slate-500'>{student.student_code}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold text-[#dd7323]'>{student.score.toFixed(1)}</p>
                          <p className='text-xs text-slate-400'>điểm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center'>
              <BookOpen size={48} className='mx-auto mb-4 text-slate-300' />
              <p className='text-slate-500'>Chọn một lớp học để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
