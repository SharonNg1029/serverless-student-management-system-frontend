'use client'

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { lecturerClassApi } from '~/services/lecturerApi'
import AssignmentsTab from './tabs/AssignmentsTab'
import PostsTab from './tabs/PostsTab'
import type { ClassDTO } from '~/types'

// Tab types
type TabType = 'assignments' | 'posts'

// Loading skeleton for class header
function ClassHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
          <div className="flex gap-6">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Error state component
function ErrorState({ error, onBack }: { error: Error; onBack: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Không thể tải thông tin lớp học</h3>
        <p className="text-slate-500 mb-6">
          {error.message || 'Đã có lỗi xảy ra khi tải thông tin lớp học'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-all"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>
    </div>
  )
}

// Class Header Component
function ClassHeader({ classData }: { classData: ClassDTO }) {
  const navigate = useNavigate()
  
  const statusColors = {
    1: 'bg-emerald-50 text-emerald-700',
    0: 'bg-slate-100 text-slate-600',
  }

  const statusLabels = {
    1: 'Đang hoạt động',
    0: 'Đã đóng',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Color bar */}
      <div className={`h-2 ${classData.status === 1 ? 'bg-linear-to-r from-orange-500 to-amber-500' : 'bg-linear-to-r from-slate-400 to-slate-500'}`} />
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <Link to="/lecturer/my-courses" className="hover:text-orange-600 transition-colors">
                Lớp học của tôi
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">{classData.name}</span>
            </div>

            {/* Title & Status */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{classData.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[classData.status as keyof typeof statusColors] || statusColors[0]}`}>
                {statusLabels[classData.status as keyof typeof statusLabels] || 'Không rõ'}
              </span>
            </div>

            {/* Subject */}
            {classData.subject_name && (
              <p className="text-slate-600 mb-4">{classData.subject_name}</p>
            )}

            {/* Info tags */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>{classData.semester} - {classData.academic_year}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users size={16} className="text-slate-400" />
                <span>{classData.student_count || 0} sinh viên</span>
              </div>
              {classData.password && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-slate-400">Mã lớp:</span>
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-xs">
                    {classData.password}
                  </code>
                </div>
              )}
            </div>

            {/* Description */}
            {classData.description && (
              <p className="text-slate-500 text-sm mt-4 line-clamp-2">
                {classData.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/lecturer/classes-management/edit/${classData.id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-all text-sm"
            >
              <Settings size={16} />
              Cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab Button Component
interface TabButtonProps {
  active: boolean
  icon: React.ReactNode
  label: string
  count?: number
  onClick: () => void
}

function TabButton({ active, icon, label, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
        active
          ? 'text-orange-600'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
      )}
    </button>
  )
}

export default function LecturerClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('assignments')

  const classIdNum = Number(classId)

  // Fetch class details
  const {
    data: classData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['lecturer-class', classIdNum],
    queryFn: () => lecturerClassApi.getClassById(classIdNum),
    enabled: !isNaN(classIdNum),
    staleTime: 1000 * 60 * 5,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/lecturer/my-courses')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>

        <ClassHeaderSkeleton />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-center">
            <Loader2 size={32} className="text-orange-500 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !classData) {
    return <ErrorState error={error as Error} onBack={() => navigate('/lecturer/my-courses')} />
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/lecturer/my-courses')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Quay lại</span>
      </button>

      {/* Class Header */}
      <ClassHeader classData={classData} />

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-slate-100 px-4 flex">
          <TabButton
            active={activeTab === 'assignments'}
            icon={<FileText size={18} />}
            label="Bài tập & Điểm số"
            onClick={() => setActiveTab('assignments')}
          />
          <TabButton
            active={activeTab === 'posts'}
            icon={<MessageSquare size={18} />}
            label="Bài đăng thảo luận"
            onClick={() => setActiveTab('posts')}
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'assignments' && (
            <AssignmentsTab classId={classIdNum} />
          )}
          {activeTab === 'posts' && (
            <PostsTab classId={classIdNum} />
          )}
        </div>
      </div>
    </div>
  )
}
