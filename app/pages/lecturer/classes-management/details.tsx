"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import {
  BookOpen,
  Users,
  Calendar,
  Edit,
  Loader2,
  ArrowLeft,
  FileText,
  Award,
  MessageSquare,
  Bell,
  Lock,
} from "lucide-react"
import {
  lecturerClassApi,
  lecturerStudentApi,
  lecturerMaterialApi,
  lecturerRankingApi,
} from "../../../services/lecturerApi"
import { toaster } from "../../../components/ui/toaster"
import type { ClassDTO, StudentDTO, MaterialDTO, RankingDTO } from "../../../types"

export default function LecturerClassDetails() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [classInfo, setClassInfo] = useState<ClassDTO | null>(null)
  const [students, setStudents] = useState<StudentDTO[]>([])
  const [materials, setMaterials] = useState<MaterialDTO[]>([])
  const [ranking, setRanking] = useState<RankingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"students" | "materials" | "ranking">("students")

  useEffect(() => {
    if (classId) {
      fetchClassData(Number.parseInt(classId))
    }
  }, [classId])

  const fetchClassData = async (id: number) => {
    try {
      setLoading(true)
      const [classRes, studentsRes, materialsRes, rankingRes] = await Promise.all([
        lecturerClassApi.getClassById(id),
        lecturerStudentApi.getStudentsInClass(id),
        lecturerMaterialApi.getMaterials(id),
        lecturerRankingApi.getRanking(id),
      ])

      setClassInfo(classRes)
      setStudents(studentsRes.results || [])
      setMaterials(materialsRes.results || [])
      setRanking(rankingRes.results || [])
    } catch (error: any) {
      toaster.create({
        title: "Lỗi tải dữ liệu",
        description: error.response?.data?.message || "Không thể tải thông tin lớp",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#dd7323] animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    )
  }

  if (!classInfo) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">Không tìm thấy lớp học</p>
        <button
          onClick={() => navigate("/lecturer/classes-management/list")}
          className="mt-4 text-[#dd7323] hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const avgScore = ranking.length > 0 ? ranking.reduce((sum, r) => sum + r.score, 0) / ranking.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/lecturer/classes-management/list")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{classInfo.name}</h1>
          <p className="text-slate-500">{classInfo.subject_name}</p>
        </div>
        <button
          onClick={() => navigate(`/lecturer/classes-management/edit/${classId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all"
        >
          <Edit size={16} />
          Chỉnh sửa
        </button>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
          <Users size={24} className="text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-800">{students.length}</p>
          <p className="text-xs text-slate-500">Sinh viên</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
          <FileText size={24} className="text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-800">{materials.length}</p>
          <p className="text-xs text-slate-500">Bài tập</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
          <Award size={24} className="text-[#dd7323] mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-800">{avgScore.toFixed(1)}</p>
          <p className="text-xs text-slate-500">Điểm TB</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
          <Calendar size={24} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">{classInfo.semester}</p>
          <p className="text-xs text-slate-500">{classInfo.academic_year}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
          <Lock size={24} className="text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">{classInfo.password ? "****" : "Không có"}</p>
          <p className="text-xs text-slate-500">Mật khẩu</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate(`/lecturer/assignments-management/form?class_id=${classId}`)}
          className="flex items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#dd7323] hover:shadow-md transition-all"
        >
          <div className="p-2 bg-purple-50 rounded-lg">
            <FileText size={20} className="text-purple-500" />
          </div>
          <span className="font-medium text-slate-700">Tạo bài tập</span>
        </button>

        <button
          onClick={() => navigate(`/lecturer/chat-moderate?class_id=${classId}`)}
          className="flex items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#dd7323] hover:shadow-md transition-all"
        >
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare size={20} className="text-blue-500" />
          </div>
          <span className="font-medium text-slate-700">Thảo luận</span>
        </button>

        <button
          onClick={() => navigate(`/lecturer/ranking-analyst?class_id=${classId}`)}
          className="flex items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#dd7323] hover:shadow-md transition-all"
        >
          <div className="p-2 bg-orange-50 rounded-lg">
            <Award size={20} className="text-[#dd7323]" />
          </div>
          <span className="font-medium text-slate-700">Xếp hạng</span>
        </button>

        <button
          onClick={() => navigate(`/lecturer/notifications-send?class_id=${classId}`)}
          className="flex items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#dd7323] hover:shadow-md transition-all"
        >
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Bell size={20} className="text-emerald-500" />
          </div>
          <span className="font-medium text-slate-700">Gửi thông báo</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {["students", "materials", "ranking"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#dd7323] border-b-2 border-[#dd7323] bg-orange-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab === "students" && <Users size={16} className="inline mr-2" />}
              {tab === "materials" && <FileText size={16} className="inline mr-2" />}
              {tab === "ranking" && <Award size={16} className="inline mr-2" />}
              {tab === "students" ? "Sinh viên" : tab === "materials" ? "Bài tập" : "Xếp hạng"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "students" &&
            (students.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users size={40} className="mx-auto mb-3 text-slate-300" />
                <p>Chưa có sinh viên nào trong lớp</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random`}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{student.name}</h4>
                      <p className="text-sm text-slate-500">
                        {student.codeUser} - {student.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "enrolled"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {student.status === "enrolled" ? "Đã đăng ký" : "Chờ duyệt"}
                    </span>
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "materials" &&
            (materials.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                <p>Chưa có bài tập nào</p>
                <button
                  onClick={() => navigate(`/lecturer/assignments-management/form?class_id=${classId}`)}
                  className="mt-3 text-[#dd7323] hover:underline"
                >
                  Tạo bài tập mới
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{material.title}</h4>
                      <p className="text-sm text-slate-500">
                        {new Date(material.uploaded_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {material.file_url && (
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#dd7323] hover:underline text-sm"
                      >
                        Tải xuống
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "ranking" &&
            (ranking.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Award size={40} className="mx-auto mb-3 text-slate-300" />
                <p>Chưa có dữ liệu xếp hạng</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((student, index) => (
                  <div
                    key={student.student_id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-600"
                          : index === 1
                            ? "bg-slate-200 text-slate-600"
                            : index === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <img
                      src={
                        student.avatar || `https://ui-avatars.com/api/?name=${student.student_name}&background=random`
                      }
                      alt={student.student_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{student.student_name}</h4>
                      <p className="text-sm text-slate-500">{student.student_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#dd7323] text-lg">{student.score.toFixed(1)}</p>
                      <p className="text-xs text-slate-400">điểm</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
