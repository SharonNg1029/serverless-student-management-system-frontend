"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Search, Edit, Save, X, Loader2, Award, Filter, Users } from "lucide-react"
import {
  lecturerClassApi,
  lecturerGradeApi,
  lecturerGradeColumnApi,
  lecturerStudentApi,
} from "../../../services/lecturerApi"
import { toaster } from "../../../components/ui/toaster"
import type { ClassDTO, StudentDTO, GradeColumnDTO, CreateGradeRequest } from "../../../types"

interface StudentWithGrades extends StudentDTO {
  grades: Record<number, number> // column_id -> value
  totalScore?: number
}

export default function GradesManagementList() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassDTO[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [students, setStudents] = useState<StudentWithGrades[]>([])
  const [gradeColumns, setGradeColumns] = useState<GradeColumnDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Edit mode
  const [editingCell, setEditingCell] = useState<{ studentId: number; columnId: number } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      fetchGradeData()
    }
  }, [selectedClassId])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await lecturerClassApi.getClasses()
      setClasses(response.results || [])
      if (response.results && response.results.length > 0) {
        setSelectedClassId(response.results[0].id)
      }
    } catch (error: any) {
      toaster.create({
        title: "Lỗi",
        description: "Không thể tải danh sách lớp",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchGradeData = async () => {
    if (!selectedClassId) return

    try {
      setLoadingGrades(true)

      // Fetch students, grade columns, and grades in parallel
      const [studentsRes, columnsRes, gradesRes] = await Promise.all([
        lecturerStudentApi.getStudentsInClass(selectedClassId),
        lecturerGradeColumnApi.getGradeColumns(selectedClassId),
        lecturerGradeApi.getGrades(selectedClassId),
      ])

      const studentsList = studentsRes.results || []
      const columnsList = columnsRes.results || []
      const gradesList = gradesRes.results || []

      // Map grades to students
      const studentsWithGrades: StudentWithGrades[] = studentsList.map((student) => {
        const studentGrades: Record<number, number> = {}
        let totalWeightedScore = 0
        let totalPercentage = 0

        gradesList
          .filter((g) => g.student_id === student.id)
          .forEach((grade) => {
            studentGrades[grade.column_id] = grade.value
            const column = columnsList.find((c) => c.id === grade.column_id)
            if (column) {
              totalWeightedScore += grade.value * (column.percentage / 100)
              totalPercentage += column.percentage
            }
          })

        return {
          ...student,
          grades: studentGrades,
          totalScore: totalPercentage > 0 ? (totalWeightedScore / totalPercentage) * 100 : undefined,
        }
      })

      setStudents(studentsWithGrades)
      setGradeColumns(columnsList.filter((c) => c.is_active))
    } catch (error: any) {
      toaster.create({
        title: "Lỗi",
        description: "Không thể tải dữ liệu điểm",
        type: "error",
      })
    } finally {
      setLoadingGrades(false)
    }
  }

  const handleCellClick = (studentId: number, columnId: number, currentValue?: number) => {
    setEditingCell({ studentId, columnId })
    setEditValue(currentValue?.toString() || "")
  }

  const handleSaveGrade = async () => {
    if (!editingCell || !selectedClassId) return

    const value = Number.parseFloat(editValue)
    if (isNaN(value) || value < 0 || value > 10) {
      toaster.create({
        title: "Lỗi",
        description: "Điểm phải là số từ 0 đến 10",
        type: "error",
      })
      return
    }

    try {
      setSaving(true)
      const request: CreateGradeRequest = {
        class_id: selectedClassId,
        student_id: editingCell.studentId,
        column_id: editingCell.columnId,
        value,
      }

      await lecturerGradeApi.createGrade(request)

      toaster.create({
        title: "Thành công",
        description: "Đã cập nhật điểm",
        type: "success",
      })

      setEditingCell(null)
      fetchGradeData()
    } catch (error: any) {
      toaster.create({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể lưu điểm",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const getGradeLabel = (score: number) => {
    if (score >= 8.5) return { label: "A", color: "bg-emerald-100 text-emerald-700" }
    if (score >= 7.0) return { label: "B", color: "bg-blue-100 text-blue-700" }
    if (score >= 5.5) return { label: "C", color: "bg-yellow-100 text-yellow-700" }
    if (score >= 4.0) return { label: "D", color: "bg-orange-100 text-orange-700" }
    return { label: "F", color: "bg-red-100 text-red-700" }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codeUser?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedClass = classes.find((c) => c.id === selectedClassId)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#dd7323] animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Điểm số</h1>
          <p className="text-slate-500 mt-1">Nhập và quản lý điểm sinh viên theo lớp</p>
        </div>
        <button
          onClick={() => navigate("/lecturer/ranking-analyst")}
          className="flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all"
        >
          <Award size={18} />
          Xem xếp hạng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Filter size={14} className="inline mr-1" /> Chọn lớp
            </label>
            <select
              value={selectedClassId || ""}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Search size={14} className="inline mr-1" /> Tìm sinh viên
            </label>
            <input
              type="text"
              placeholder="Nhập tên hoặc mã sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />
            <span>{filteredStudents.length} sinh viên</span>
          </div>
        </div>
      </div>

      {/* Class Info */}
      {selectedClass && (
        <div className="bg-gradient-to-r from-[#dd7323]/10 to-orange-50 rounded-xl p-4 border border-[#dd7323]/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{selectedClass.name}</h3>
              <p className="text-sm text-slate-600">
                {selectedClass.subject_name} | {selectedClass.semester} - {selectedClass.academic_year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Cột điểm</p>
              <p className="font-bold text-[#dd7323]">{gradeColumns.length} cột</p>
            </div>
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loadingGrades ? (
          <div className="p-12 text-center">
            <Loader2 size={32} className="text-[#dd7323] animate-spin mx-auto mb-3" />
            <p className="text-slate-600">Đang tải điểm...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Không có sinh viên nào trong lớp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-slate-800 z-10">STT</th>
                  <th className="px-4 py-3 text-left font-semibold sticky left-12 bg-slate-800 z-10 min-w-[200px]">
                    Sinh viên
                  </th>
                  {gradeColumns.map((col) => (
                    <th key={col.id} className="px-4 py-3 text-center font-semibold min-w-[100px]">
                      <div>{col.name}</div>
                      <div className="text-xs font-normal opacity-75">({col.percentage}%)</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold min-w-[100px]">Tổng kết</th>
                  <th className="px-4 py-3 text-center font-semibold min-w-[80px]">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 sticky left-0 bg-inherit z-10">{index + 1}</td>
                    <td className="px-4 py-3 sticky left-12 bg-inherit z-10">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            student.avatar ||
                            `https://ui-avatars.com/api/?name=${student.name || "/placeholder.svg"}&background=dd7323&color=fff`
                          }
                          alt={student.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.codeUser}</p>
                        </div>
                      </div>
                    </td>
                    {gradeColumns.map((col) => {
                      const isEditing = editingCell?.studentId === student.id && editingCell?.columnId === col.id
                      const gradeValue = student.grades[col.id]

                      return (
                        <td key={col.id} className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                min="0"
                                max="10"
                                step="0.1"
                                className="w-16 px-2 py-1 text-center border border-[#dd7323] rounded focus:outline-none focus:ring-2 focus:ring-[#dd7323]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveGrade()
                                  if (e.key === "Escape") handleCancelEdit()
                                }}
                              />
                              <button
                                onClick={handleSaveGrade}
                                disabled={saving}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              </button>
                              <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCellClick(student.id, col.id, gradeValue)}
                              className="w-full px-2 py-1 rounded hover:bg-slate-100 transition-colors group"
                            >
                              {gradeValue !== undefined ? (
                                <span className="font-medium">{gradeValue.toFixed(1)}</span>
                              ) : (
                                <span className="text-slate-400 group-hover:text-[#dd7323]">
                                  <Edit size={14} className="inline" />
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-center">
                      {student.totalScore !== undefined ? (
                        <span className="font-bold text-[#dd7323]">{student.totalScore.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {student.totalScore !== undefined ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            getGradeLabel(student.totalScore).color
                          }`}
                        >
                          {getGradeLabel(student.totalScore).label}
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
