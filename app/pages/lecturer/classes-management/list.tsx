"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import {
  BookOpen,
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  Loader2,
  Calendar,
  Filter,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { lecturerClassApi } from "../../../services/lecturerApi"
import { toaster } from "../../../components/ui/toaster"
import type { ClassDTO, SubjectAssignment } from "../../../types"

export default function LecturerClassesList() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassDTO[]>([])
  const [subjects, setSubjects] = useState<SubjectAssignment[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [keyword, setKeyword] = useState("")
  const [subjectFilter, setSubjectFilter] = useState<number | "">("")
  const [statusFilter, setStatusFilter] = useState<number | "">("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 500)
    return () => clearTimeout(timer)
  }, [keyword])

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [debouncedKeyword, subjectFilter, statusFilter])

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const res = await lecturerClassApi.getAssignedSubjects()
      setSubjects(res.results || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (debouncedKeyword) params.keyword = debouncedKeyword
      if (subjectFilter !== "") params.subject_id = subjectFilter
      if (statusFilter !== "") params.status = statusFilter

      const response = await lecturerClassApi.getClasses(params)
      setClasses(response.results || [])
    } catch (error: any) {
      toaster.create({
        title: "Lỗi tải dữ liệu",
        description: error.response?.data?.message || "Không thể tải danh sách lớp",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (cls: ClassDTO) => {
    if (!confirm(`Bạn có chắc muốn ${cls.status === 1 ? "đóng" : "mở lại"} lớp "${cls.name}"?`)) return

    try {
      await lecturerClassApi.deactivateClass(cls.id)
      toaster.create({
        title: "Thành công",
        description: `Đã ${cls.status === 1 ? "đóng" : "mở lại"} lớp "${cls.name}"`,
        type: "success",
      })
      fetchData()
    } catch (error: any) {
      toaster.create({
        title: "Thất bại",
        description: error.response?.data?.message || "Không thể thay đổi trạng thái lớp",
        type: "error",
      })
    }
  }

  const clearFilters = () => {
    setKeyword("")
    setSubjectFilter("")
    setStatusFilter("")
  }

  const hasFilters = keyword || subjectFilter !== "" || statusFilter !== ""

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Lớp học</h1>
          <p className="text-slate-500 mt-1">Danh sách các lớp học bạn phụ trách</p>
        </div>
        <button
          onClick={() => navigate("/lecturer/classes-management/form")}
          className="flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all shadow-lg shadow-orange-200"
        >
          <Plus size={18} />
          Tạo lớp mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Search size={14} className="inline mr-1" /> Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Nhập tên lớp..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent"
            />
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Filter size={14} className="inline mr-1" /> Môn học
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent"
            >
              <option value="">Tất cả</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.subject_id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value={1}>Đang mở</option>
              <option value={0}>Đã đóng</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <X size={16} /> Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
          <Loader2 size={40} className="text-[#dd7323] animate-spin mb-3" />
          <p className="text-slate-600">Đang tải danh sách lớp...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Không tìm thấy lớp học nào</p>
          <button
            onClick={() => navigate("/lecturer/classes-management/form")}
            className="mt-4 text-[#dd7323] hover:underline"
          >
            Tạo lớp học mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#dd7323]/10 rounded-xl flex items-center justify-center">
                      <BookOpen size={24} className="text-[#dd7323]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{cls.name}</h3>
                      <p className="text-sm text-slate-500">{cls.subject_name}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cls.status === 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {cls.status === 1 ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span>{cls.student_count || 0} sinh viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>
                      {cls.semester} - {cls.academic_year}
                    </span>
                  </div>
                </div>

                {cls.description && <p className="mt-3 text-sm text-slate-500 line-clamp-2">{cls.description}</p>}
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDeactivate(cls)}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  title={cls.status === 1 ? "Đóng lớp" : "Mở lại lớp"}
                >
                  {cls.status === 1 ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/lecturer/classes-management/details/${cls.id}`)}
                    className="p-2 text-slate-500 hover:text-[#dd7323] hover:bg-orange-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/lecturer/classes-management/edit/${cls.id}`)}
                    className="p-2 text-slate-500 hover:text-[#dd7323] hover:bg-orange-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
