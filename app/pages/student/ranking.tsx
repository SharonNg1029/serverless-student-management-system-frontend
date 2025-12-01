'use client'

import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, Award, Loader2 } from 'lucide-react'

interface RankingData {
  rank: number
  score: number
  totalStudents: number
  className: string
  classCode: string
}

interface ClassOption {
  id: number
  name: string
  code: string
}

const MOCK_CLASSES: ClassOption[] = [
  { id: 1, name: 'Lập trình Web 101', code: 'C001' },
  { id: 2, name: 'Cơ sở dữ liệu', code: 'D001' },
  { id: 3, name: 'Kiến trúc máy tính', code: 'A001' },
  { id: 4, name: 'Lập trình OOP', code: 'C002' },
  { id: 5, name: 'Mạng máy tính', code: 'N001' }
]

const MOCK_RANKINGS: Record<number, RankingData> = {
  1: { rank: 5, score: 8.5, totalStudents: 35, className: 'Lập trình Web 101', classCode: 'C001' },
  2: { rank: 2, score: 9.0, totalStudents: 32, className: 'Cơ sở dữ liệu', classCode: 'D001' },
  3: { rank: 8, score: 7.8, totalStudents: 28, className: 'Kiến trúc máy tính', classCode: 'A001' },
  4: { rank: 3, score: 8.9, totalStudents: 40, className: 'Lập trình OOP', classCode: 'C002' },
  5: { rank: 1, score: 9.5, totalStudents: 30, className: 'Mạng máy tính', classCode: 'N001' }
}

export default function RankingRoute() {
  const [selectedClassId, setSelectedClassId] = useState<number>(1)
  const [ranking, setRanking] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRanking(selectedClassId)
  }, [selectedClassId])

  const fetchRanking = async (classId: number) => {
    setLoading(true)
    try {
      // TODO: Replace with API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      setRanking(MOCK_RANKINGS[classId] || MOCK_RANKINGS[1])
    } catch (error) {
      console.error('Failed to fetch ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankingBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return '📍'
  }

  const getRankingColor = (rank: number, total: number) => {
    const percentage = (rank / total) * 100
    if (percentage <= 10) return 'from-yellow-400 to-yellow-600'
    if (percentage <= 30) return 'from-green-400 to-green-600'
    if (percentage <= 60) return 'from-blue-400 to-blue-600'
    return 'from-slate-400 to-slate-600'
  }

  if (loading && !ranking) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mx-auto mb-3' />
          <p className='text-slate-600'>Đang tải xếp hạng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Xếp hạng cá nhân</h1>
          <p className='text-slate-600 mt-1'>Xem xếp hạng của bạn trong từng lớp học</p>
        </div>

        {/* Class Selection */}
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6'>
          <label className='block text-sm font-semibold text-slate-700 mb-3'>Chọn lớp học</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className='w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none'
          >
            {MOCK_CLASSES.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
        </div>

        {/* Ranking Card */}
        {ranking && (
          <div className='space-y-6'>
            {/* Main Ranking Display */}
            <div
              className={`bg-gradient-to-r ${getRankingColor(ranking.rank, ranking.totalStudents)} rounded-xl shadow-lg p-8 text-white`}
            >
              <div className='text-center'>
                <div className='text-6xl mb-4'>{getRankingBadge(ranking.rank)}</div>
                <p className='text-lg opacity-90 mb-2'>Xếp hạng của bạn</p>
                <div className='flex items-baseline justify-center gap-2'>
                  <span className='text-5xl font-bold'>{ranking.rank}</span>
                  <span className='text-2xl opacity-75'>/ {ranking.totalStudents}</span>
                </div>
                <p className='text-sm opacity-75 mt-4'>
                  {ranking.className} ({ranking.classCode})
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-500 text-sm font-medium'>Điểm số</p>
                    <p className='text-3xl font-bold text-slate-900 mt-2'>{ranking.score.toFixed(1)}</p>
                  </div>
                  <div className='p-3 bg-blue-100 rounded-lg'>
                    <TrendingUp size={24} className='text-blue-600' />
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-500 text-sm font-medium'>Xếp hạng</p>
                    <p className='text-3xl font-bold text-slate-900 mt-2'>#{ranking.rank}</p>
                  </div>
                  <div className='p-3 bg-purple-100 rounded-lg'>
                    <Trophy size={24} className='text-purple-600' />
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-500 text-sm font-medium'>Tổng sinh viên</p>
                    <p className='text-3xl font-bold text-slate-900 mt-2'>{ranking.totalStudents}</p>
                  </div>
                  <div className='p-3 bg-green-100 rounded-lg'>
                    <Award size={24} className='text-green-600' />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-semibold text-slate-900'>Tiến độ xếp hạng</h3>
                <span className='text-sm text-slate-500'>
                  Top {Math.round((ranking.rank / ranking.totalStudents) * 100)}%
                </span>
              </div>
              <div className='w-full bg-slate-200 rounded-full h-3 overflow-hidden'>
                <div
                  className={`h-full bg-gradient-to-r ${getRankingColor(ranking.rank, ranking.totalStudents)} transition-all duration-500`}
                  style={{
                    width: `${Math.max((1 - ranking.rank / ranking.totalStudents) * 100, 5)}%`
                  }}
                ></div>
              </div>
              <p className='text-xs text-slate-500 mt-3'>
                Bạn đứng trên {ranking.totalStudents - ranking.rank} sinh viên khác trong lớp
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
