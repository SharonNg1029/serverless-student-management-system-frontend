"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { FileText, Save, Loader2, ArrowLeft, Upload, X, File } from "lucide-react"
import { lecturerClassApi, lecturerMaterialApi } from "../../../services/lecturerApi"
import { toaster } from "../../../components/ui/toaster"
import type { ClassDTO } from "../../../types"

export default function LecturerAssignmentForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [classes, setClasses] = useState<ClassDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    class_id: Number.parseInt(searchParams.get("class_id") || "") || 0,
    title: "",
    description: "",
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await lecturerClassApi.getClasses({ status: 1 })
      setClasses(res.results || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toaster.create({
          title: "Tệp quá lớn",
          description: "Vui lòng chọn tệp nhỏ hơn 10MB",
          type: "error",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.class_id) {
      toaster.create({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn lớp học",
        type: "error",
      })
      return
    }

    if (!formData.title.trim()) {
      toaster.create({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề bài tập",
        type: "error",
      })
      return
    }

    try {
      setSaving(true)

      await lecturerMaterialApi.createMaterial({
        class_id: formData.class_id,
        title: formData.title,
        description: formData.description,
        file: file || undefined,
      })

      toaster.create({
        title: "Tạo thành công",
        description: `Bài tập "${formData.title}" đã được đăng`,
        type: "success",
      })

      navigate(`/lecturer/assignments-management/list?class_id=${formData.class_id}`)
    } catch (error: any) {
      toaster.create({
        title: "Tạo thất bại",
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
          onClick={() => navigate("/lecturer/assignments-management/list")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo bài tập mới</h1>
          <p className="text-slate-500">Đăng bài tập hoặc tài liệu cho sinh viên</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lớp học <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: Number.parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all"
          >
            <option value="">Chọn lớp học</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText size={14} className="inline mr-1" /> Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VD: Bài tập chương 1 - Cơ sở dữ liệu"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nội dung / Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả yêu cầu bài tập, hướng dẫn cho sinh viên..."
            rows={5}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none transition-all resize-none"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Upload size={14} className="inline mr-1" /> Tệp đính kèm (tùy chọn)
          </label>

          {file ? (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <File size={20} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#dd7323] hover:bg-orange-50/30 transition-all"
            >
              <Upload size={32} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600">Kéo thả hoặc click để chọn tệp</p>
              <p className="text-sm text-slate-400 mt-1">PDF, DOCX, XLSX, ZIP... (tối đa 10MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png"
          />
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Lưu ý:</strong> Sau khi đăng, sinh viên trong lớp sẽ thấy bài tập này và có thể trả lời bằng bình
            luận hoặc nộp file.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/lecturer/assignments-management/list")}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Đang đăng..." : "Đăng bài tập"}
          </button>
        </div>
      </form>
    </div>
  )
}
