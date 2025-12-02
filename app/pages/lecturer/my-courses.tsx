'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Users,
  Search,
  GraduationCap,
  Plus,
  Filter,
  Grid,
  List as ListIcon,
} from 'lucide-react'
import { lecturerClassApi } from '../../services/lecturerApi'
import type { ClassDTO } from '../../types'
import ClassCard from '../../components/ui/ClassCard'
import CreateClassModal from '../../components/ui/CreateClassModal'
import EditClassModal from '../../components/ui/EditClassModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { toaster } from '../../components/ui/toaster'

// Loading skeleton for class cards
function ClassCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-linear-to-r from-slate-200 to-slate-100" />
      <div className="p-5">
        <div className="h-4 bg-slate-100 rounded w-full mb-3" />
        <div className="flex gap-4 mb-4">
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
        <div className="flex justify-between pt-3 border-t border-slate-100">
          <div className="h-6 bg-slate-100 rounded w-24" />
          <div className="h-8 bg-slate-100 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

// Empty state component
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <GraduationCap size={40} className="text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Chưa có lớp học nào</h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        Bạn chưa được phân công giảng dạy lớp nào. Hãy tạo lớp mới để bắt đầu!
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-all shadow-lg shadow-blue-200"
      >
        <Plus size={18} />
        Tạo lớp mới
      </button>
    </div>
  )
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen size={40} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Không thể tải dữ liệu</h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        {error.message || 'Đã có lỗi xảy ra khi tải danh sách lớp học'}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-all"
      >
        Thử lại
      </button>
    </div>
  )
}

export default function LecturerMyCourses() {
  const queryClient = useQueryClient()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassDTO | null>(null)

  // Fetch classes using TanStack Query
  const {
    data: classesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lecturer-classes', searchKeyword, statusFilter],
    queryFn: async () => {
      const params: { keyword?: string; status?: number } = {}
      if (searchKeyword) params.keyword = searchKeyword
      if (statusFilter !== '') params.status = statusFilter === 'active' ? 1 : 0
      return lecturerClassApi.getClasses(params)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (classId: number) => lecturerClassApi.deactivateClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lecturer-classes'] })
      toaster.create({
        title: 'Thành công',
        description: selectedClass?.status === 1 
          ? 'Đã tạm dừng lớp học' 
          : 'Đã kích hoạt lớp học',
        type: 'success',
      })
      setIsDeactivateDialogOpen(false)
      setSelectedClass(null)
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể thực hiện hành động',
        type: 'error',
      })
    },
  })

  const classes = classesData?.results || []

  // Stats
  const activeClasses = classes.filter((c) => c.status === 1).length
  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)

  // Handlers
  const handleEdit = (classData: ClassDTO) => {
    setSelectedClass(classData)
    setIsEditModalOpen(true)
  }

  const handleDeactivate = (classData: ClassDTO) => {
    setSelectedClass(classData)
    setIsDeactivateDialogOpen(true)
  }

  const confirmDeactivate = () => {
    if (selectedClass) {
      deactivateMutation.mutate(selectedClass.id)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lớp học của tôi</h1>
          <p className="text-slate-500 mt-1">Quản lý các lớp học bạn đang giảng dạy</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng số lớp</p>
              <p className="text-2xl font-bold text-slate-900">{classes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Lớp đang hoạt động</p>
              <p className="text-2xl font-bold text-slate-900">{activeClasses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng sinh viên</p>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên lớp, môn học..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tạm dừng</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => (
            <ClassCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error as Error} onRetry={() => refetch()} />
      ) : classes.length === 0 ? (
        <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-300 hover:bg-blue-600 hover:scale-105 transition-all duration-200 flex items-center justify-center z-40 group"
        title="Tạo lớp mới"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Modals */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedClass(null)
        }}
        classData={selectedClass}
      />

      <ConfirmDialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => {
          setIsDeactivateDialogOpen(false)
          setSelectedClass(null)
        }}
        onConfirm={confirmDeactivate}
        title={selectedClass?.status === 1 ? 'Tạm dừng lớp học' : 'Kích hoạt lớp học'}
        message={
          selectedClass?.status === 1
            ? `Bạn có chắc chắn muốn tạm dừng lớp "${selectedClass?.name}"? Sinh viên sẽ không thể truy cập lớp học này.`
            : `Bạn có chắc chắn muốn kích hoạt lại lớp "${selectedClass?.name}"?`
        }
        confirmText={selectedClass?.status === 1 ? 'Tạm dừng' : 'Kích hoạt'}
        variant={selectedClass?.status === 1 ? 'danger' : 'info'}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  )
}
