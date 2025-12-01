"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft, Save, Loader2, Award, Users, Hash } from "lucide-react"
import { lecturerStudentApi, lecturerGradeColumnApi, lecturerGradeApi } from "../../../services/lecturerApi"
import { toaster } from "../../../components/ui/toaster"
import type { StudentDTO, GradeColumnDTO, GradeDTO, CreateGradeRequest } from "../../../types"

interface StudentGrade {
  student: StudentDTO
  grades: Record<number, number> // column_id -> value
}

export default function LecturerAssignmentGrade() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()

  // Note: assignmentId here is actually class_id based on the route structure
  const classId = Number.parseInt(assignmentId || "0")

  const [students, setStudents] = useState<StudentDTO[]>([])
  const [gradeColumns, setGradeColumns] = useState<GradeColumnDTO[]>([])
  const [existingGrades, setExistingGrades] = useState<GradeDTO[]>([])
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (classId) {
      fetchData()
    }
  }, [classId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsRes, columnsRes, gradesRes] = await Promise.all([
        lecturerStudentApi.getStudentsInClass(classId),
        lecturerGradeColumnApi.getGradeColumns(classId),
        lecturerGradeApi.getGrades(classId),
      ])

      setStudents(studentsRes.results || [])
      setGradeColumns(columnsRes.results || [])
      setExistingGrades(gradesRes.results || [])

      // Build student grades map
      const gradesMap: Record<number, Record<number, number>> = {}
      ;(gradesRes.results || []).forEach((grade) => {
        if (!gradesMap[grade.student_id]) {
          gradesMap[grade.student_id] = {}
        }
        gradesMap[grade.student_id][grade.column_id] = grade.value
      })

      const studentGradesData: StudentGrade[] = (studentsRes.results || []).map((student) => ({
        student,
        grades: gradesMap[student.id] || {},
      }))

      setStudentGrades(studentGradesData)
    } catch (error: any) {
      toaster.create({
        title: "Lỗi tải dữ liệu",
        description: error.response?.data?.message || "Không thể tải dữ liệu",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (studentId: number, columnId: number, value: string) => {
    const numValue = Number.parseFloat(value) || 0

    setStudentGrades((prev) =>
      prev.map((sg) => {
        if (sg.student.id === studentId) {
          return {
            ...sg,
            grades: {
              ...sg.grades,
              [columnId]: Math.min(10, Math.max(0, numValue)),
            },
          }
        }
        return sg
      }),
    )
  }

  const handleSaveGrades = async () => {
    try {
      setSaving(true)

      const gradesToSave: CreateGradeRequest[] = []

      studentGrades.forEach(({ student, grades }) => {
        Object.entries(grades).forEach(([columnId, value]) => {
          gradesToSave.push({
            class_id: classId,
            student_id: student.id,
            column_id: Number.parseInt(columnId),
            value,
          })
        })
      })

      await lecturerGradeApi.bulkUpdateGrades(gradesToSave)

      toaster.create({
        title: "Lưu thành công",
        description: "Điểm đã được cập nhật",
        type: "success",
      })

      fetchData() // Refresh data
    } catch (error: any) {
      toaster.create({
        title: "Lưu thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const calculateAverage = (grades: Record<number, number>) => {
    let totalWeight = 0
    let totalScore = 0

    gradeColumns.forEach((col) => {
      if (grades[col.id] !== undefined) {
        totalWeight += col.percentage
        totalScore += grades[col.id] * col.percentage
      }
    })

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#dd7323] animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Đang tải dữ liệu chấm điểm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chấm điểm</h1>
            <p className="text-slate-500">Nhập điểm cho sinh viên theo từng cột điểm</p>
          </div>
        </div>

        <button
          onClick={handleSaveGrades}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Đang lưu..." : "Lưu điểm"}
        </button>
      </div>

      {gradeColumns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Award size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Chưa có cột điểm nào</p>
          <p className="text-sm text-slate-400 mt-1">Vui lòng tạo cột điểm trước khi chấm</p>
        </div>
      ) : studentGrades.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Chưa có sinh viên trong lớp</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50">
                    Sinh viên
                  </th>
                  {gradeColumns.map((col) => (
                    <th
                      key={col.id}
                      className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"
                    >
                      <div>{col.name}</div>
                      <div className="text-[#dd7323] font-normal">({col.percentage}%)</div>
                    </th>
                  ))}
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    TB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentGrades.map(({ student, grades }) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 sticky left-0 bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random`}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{student.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Hash size={10} /> {student.codeUser}
                          </div>
                        </div>
                      </div>
                    </td>
                    {gradeColumns.map((col) => (
                      <td key={col.id} className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={grades[col.id] ?? ""}
                          onChange={(e) => handleGradeChange(student.id, col.id, e.target.value)}
                          className="w-16 px-2 py-1 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none"
                          placeholder="-"
                        />
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold ${
                          calculateAverage(grades) >= 8
                            ? "text-emerald-600"
                            : calculateAverage(grades) >= 5
                              ? "text-[#dd7323]"
                              : "text-red-500"
                        }`}
                      >
                        {Object.keys(grades).length > 0 ? calculateAverage(grades).toFixed(1) : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
