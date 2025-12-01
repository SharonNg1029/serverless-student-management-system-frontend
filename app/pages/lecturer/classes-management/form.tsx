"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { BookOpen, Save, Loader2, ArrowLeft, Lock, Calendar, FileText } from "lucide-react"
import { lecturerClassApi } from "../../../services/lecturerApi"
import { toaster } from "../../../components/ui/toaster"
import type { SubjectAssignment, CreateClassRequest } from "../../../types"

export default function LecturerClassForm() {
  const { classId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = Boolean(classId)

  const [subjects, setSubjects] = useState<SubjectAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<CreateClassRequest>({
    subject_id: Number.parseInt(searchParams.get("subject_id") || "") || 0,
    name: "",
    password: "",
    semester: "",
    academic_year: "",
    description: "",
  })

  useEffect(() => {
    fetchSubjects()
    if (isEdit && classId) {
      fetchClass(Number.parseInt(classId))
    } else {
      setLoading(false)
    }
  }, [classId])

  const fetchSubjects = async () => {
    try {
      const res = await lecturerClassApi.getAssignedSubjects()
      setSubjects(res.results || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchClass = async (id: number) => {
    try {
      setLoading(true)
      const data = await lecturerClassApi.getClassById(id)
      setFormData({
        subject_id: data.subject_id,
        name: data.name,
        password: data.password || "",
        semester: data.semester,
        academic_year: data.academic_year,
        description: data.description || "",
      })
    } catch (error: any) {
      toaster.create({
        title: "Lỗi",
        description: "Không thể tải thông tin lớp",
        type: "error",
      })
      navigate("/lecturer/classes-management/list")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject_id) {
      toaster.create({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn môn học",
        type: "error",
      })
      return
    }

    if (!formData.name.trim()) {
      toaster.create({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên lớp",
        type: "error",
      })
      return
    }

    try {
      setSaving(true)

      if (isEdit && classId) {
        await lecturerClassApi.updateClass(Number.parseInt(classId), {
          name: formData.name,
          password: formData.password,
          semester: formData.semester,
          academic_year: formData.academic_year,
          description: formData.description,
        })
        toaster.create({
          title: "Cập nhật thành công",
          description: `Lớp "${formData.name}" đã được cập nhật`,
          type: "success",
        })
      } else {
        await lecturerClassApi.createClass(formData)
        toaster.create({
          title: "Tạo thành công",
          description: `Lớp "${formData.name}" đã được tạo`,
          type: "success",
        })
      }

      navigate("/lecturer/classes-management/list")
    } catch (error: any) {
      toaster.create({
        title: isEdit ? "Cập nhật thất bại" : "Tạo thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#dd7323] animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/lecturer/classes-management/list")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}</h1>
          <p className="text-slate-500">
            {isEdit ? "Cập nhật thông tin lớp học" : "Điền thông tin để tạo lớp học mới"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <BookOpen size={14} className="inline mr-1" /> Môn học <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subject_id}
            onChange={(e) => setFormData({ ...formData, subject_id: Number.parseInt(e.target.value) })}
            disabled={isEdit}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">Chọn môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.subject_id}>
                {subject.subject_name} ({subject.subject_code})
              </option>
            ))}
          </select>
          {subjects.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">Bạn chưa được phân công môn học nào. Vui lòng liên hệ Admin.</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText size={14} className="inline mr-1" /> Tên lớp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Lớp 01 - Buổi sáng"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Lock size={14} className="inline mr-1" /> Mật khẩu tham gia (tùy chọn)
          </label>
          <input
            type="text"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Để trống nếu không cần mật khẩu"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all"
          />
        </div>

        {/* Semester & Academic Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar size={14} className="inline mr-1" /> Học kỳ
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all"
            >
              <option value="">Chọn học kỳ</option>
              <option value="HK1">Học kỳ 1</option>
              <option value="HK2">Học kỳ 2</option>
              <option value="HK3">Học kỳ hè</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Năm học</label>
            <input
              type="text"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="VD: 2024-2025"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả (tùy chọn)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả về lớp học..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/lecturer/classes-management/list")}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || subjects.length === 0}
            className="flex-1 px-4 py-3 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo lớp"}
          </button>
        </div>
      </form>
    </div>
  )
}
