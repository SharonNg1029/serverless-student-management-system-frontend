"use client"

import { useEffect, useState } from "react"
import { Users, BookOpen, Layers, Loader2, TrendingUp, Activity, Clock, Shield } from "lucide-react"
import api from "../../../utils/axios"

interface SystemStats {
  total_users: number
  total_students: number
  total_lecturers: number
  total_admins: number
  total_classes: number
  total_subjects: number
  active_classes: number
}

interface RecentActivity {
  id: number
  action: string
  user_name: string
  timestamp: string
  type: string
}

export default function AdminInfo() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [statsRes, activitiesRes] = await Promise.all([
        api.get<SystemStats>("/admin/stats").catch(() => ({ data: null })),
        api
          .get<{ results: RecentActivity[] }>("/admin/audit-logs", { params: { limit: 5 } })
          .catch(() => ({ data: { results: [] } })),
      ])
      setStats(statsRes.data)
      setActivities(activitiesRes.data?.results || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          Đang tải dữ liệu hệ thống...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#dd7323]" />
          Thống kê hệ thống
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <Users size={24} className="text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats?.total_users || "--"}</p>
            <p className="text-xs text-blue-500 font-medium">Tổng người dùng</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <BookOpen size={24} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{stats?.total_classes || "--"}</p>
            <p className="text-xs text-emerald-500 font-medium">Tổng lớp học</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <Layers size={24} className="text-[#dd7323] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#dd7323]">{stats?.total_subjects || "--"}</p>
            <p className="text-xs text-orange-500 font-medium">Tổng môn học</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <Activity size={24} className="text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{stats?.active_classes || "--"}</p>
            <p className="text-xs text-purple-500 font-medium">Lớp đang mở</p>
          </div>
        </div>

        {/* User breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-700">{stats?.total_students || "--"}</p>
            <p className="text-xs text-slate-500">Sinh viên</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-700">{stats?.total_lecturers || "--"}</p>
            <p className="text-xs text-slate-500">Giảng viên</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-700">{stats?.total_admins || "--"}</p>
            <p className="text-xs text-slate-500">Quản trị</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-[#dd7323]" />
          Hoạt động gần đây
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity size={40} className="mx-auto mb-3 text-slate-300" />
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.action}</p>
                  <p className="text-xs text-slate-400">bởi {activity.user_name}</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(activity.timestamp).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
