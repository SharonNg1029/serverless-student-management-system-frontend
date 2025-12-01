"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router"
import {
  MessageSquare,
  Send,
  Loader2,
  Heart,
  ThumbsUp,
  Trash2,
  Paperclip,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { lecturerClassApi, chatApi } from "../../services/lecturerApi"
import { useAuthStore } from "../../store/authStore"
import { toaster } from "../../components/ui/toaster"
import type { ClassDTO, MessageDTO } from "../../types"

export default function LecturerChatModerate() {
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [classes, setClasses] = useState<ClassDTO[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(
    Number.parseInt(searchParams.get("class_id") || "") || null,
  )
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // New post form
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostFile, setNewPostFile] = useState<File | null>(null)

  // Expanded posts (to show comments)
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchMessages(selectedClass)
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const res = await lecturerClassApi.getClasses({ status: 1 })
      setClasses(res.results || [])

      if (!selectedClass && res.results && res.results.length > 0) {
        setSelectedClass(res.results[0].id)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (classId: number) => {
    try {
      setLoading(true)
      // Get all posts (parent_id = null)
      const res = await chatApi.getMessages(classId, { parent_id: null })

      // For each post, get its comments
      const postsWithComments = await Promise.all(
        (res.results || []).map(async (post) => {
          try {
            const commentsRes = await chatApi.getMessages(classId, { parent_id: post.id })
            return { ...post, replies: commentsRes.results || [] }
          } catch {
            return { ...post, replies: [] }
          }
        }),
      )

      setMessages(postsWithComments)
    } catch (error: any) {
      toaster.create({
        title: "Lỗi tải dữ liệu",
        description: error.response?.data?.message || "Không thể tải tin nhắn",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!selectedClass || (!newPostContent.trim() && !newPostFile)) return

    try {
      setSending(true)
      await chatApi.createMessage({
        class_id: selectedClass,
        content: newPostContent,
        type: newPostFile ? "attachment" : "text",
        attachment: newPostFile || undefined,
        parent_id: null,
      })

      setNewPostContent("")
      setNewPostFile(null)
      fetchMessages(selectedClass)

      toaster.create({
        title: "Đăng thành công",
        type: "success",
      })
    } catch (error: any) {
      toaster.create({
        title: "Đăng thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra",
        type: "error",
      })
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Bạn có chắc muốn xóa tin nhắn này?")) return

    try {
      await chatApi.deleteMessage(messageId)
      if (selectedClass) fetchMessages(selectedClass)

      toaster.create({
        title: "Đã xóa",
        type: "success",
      })
    } catch (error: any) {
      toaster.create({
        title: "Xóa thất bại",
        description: error.response?.data?.message || "Có lỗi xảy ra",
        type: "error",
      })
    }
  }

  const handleReaction = async (messageId: number, type: "like" | "tim", currentReactions: Record<string, string>) => {
    if (!user) return

    const hasReaction = currentReactions[user.id] === type

    try {
      await chatApi.updateReaction(messageId, {
        action: hasReaction ? "remove" : "add",
        type,
      })

      if (selectedClass) fetchMessages(selectedClass)
    } catch (error) {
      console.error("Error updating reaction:", error)
    }
  }

  const toggleExpand = (postId: number) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const countReactions = (reactions: Record<string, string>, type: string) => {
    return Object.values(reactions).filter((r) => r === type).length
  }

  if (loading && classes.length === 0) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thảo luận & Moderate</h1>
          <p className="text-slate-500 mt-1">Đăng bài và quản lý thảo luận trong lớp</p>
        </div>

        <div className="w-64">
          <select
            value={selectedClass || ""}
            onChange={(e) => setSelectedClass(e.target.value ? Number.parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent"
          >
            <option value="">Chọn lớp...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Vui lòng chọn lớp học để xem thảo luận</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Post Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#dd7323]" />
                Đăng bài mới
              </h3>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Nhập nội dung câu hỏi hoặc bài tập..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none resize-none"
              />

              {newPostFile && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <FileText size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-600 flex-1 truncate">{newPostFile.name}</span>
                  <button onClick={() => setNewPostFile(null)} className="text-slate-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-500 hover:text-[#dd7323] hover:bg-orange-50 rounded-lg transition-colors"
                  title="Đính kèm file"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setNewPostFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <button
                  onClick={handleCreatePost}
                  disabled={sending || (!newPostContent.trim() && !newPostFile)}
                  className="flex-1 px-4 py-2 bg-[#dd7323] text-white rounded-lg hover:bg-[#c2621a] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? "Đang đăng..." : "Đăng"}
                </button>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <Loader2 size={32} className="text-[#dd7323] animate-spin mx-auto mb-3" />
                <p className="text-slate-500">Đang tải thảo luận...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Chưa có bài đăng nào</p>
                <p className="text-sm text-slate-400 mt-1">Hãy đăng bài đầu tiên!</p>
              </div>
            ) : (
              messages.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          post.sender_avatar ||
                          `https://ui-avatars.com/api/?name=${post.sender_name}&background=dd7323&color=fff`
                        }
                        alt={post.sender_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800">{post.sender_name}</h4>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            Giảng viên
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString("vi-VN")}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(post.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa bài đăng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="mt-3">
                      <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>

                      {post.attachment_url && (
                        <a
                          href={post.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-sm text-[#dd7323] hover:bg-slate-100 transition-colors"
                        >
                          <FileText size={16} />
                          Xem tệp đính kèm
                        </a>
                      )}
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleReaction(post.id, "like", post.reactions || {})}
                        className={`flex items-center gap-1 text-sm ${
                          user && (post.reactions || {})[user.id] === "like"
                            ? "text-blue-500"
                            : "text-slate-500 hover:text-blue-500"
                        }`}
                      >
                        <ThumbsUp size={16} />
                        <span>{countReactions(post.reactions || {}, "like")}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post.id, "tim", post.reactions || {})}
                        className={`flex items-center gap-1 text-sm ${
                          user && (post.reactions || {})[user.id] === "tim"
                            ? "text-red-500"
                            : "text-slate-500 hover:text-red-500"
                        }`}
                      >
                        <Heart size={16} />
                        <span>{countReactions(post.reactions || {}, "tim")}</span>
                      </button>

                      <button
                        onClick={() => toggleExpand(post.id)}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#dd7323] ml-auto"
                      >
                        <MessageSquare size={16} />
                        <span>{(post.replies || []).length} bình luận</span>
                        {expandedPosts.has(post.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedPosts.has(post.id) && (
                    <div className="bg-slate-50 border-t border-slate-100 p-4">
                      {(post.replies || []).length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Chưa có bình luận nào</p>
                      ) : (
                        <div className="space-y-3">
                          {(post.replies || []).map((reply) => (
                            <div key={reply.id} className="flex gap-3 bg-white p-3 rounded-lg">
                              <img
                                src={
                                  reply.sender_avatar ||
                                  `https://ui-avatars.com/api/?name=${reply.sender_name}&background=random`
                                }
                                alt={reply.sender_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 text-sm">{reply.sender_name}</span>
                                  {reply.sender_role === "Student" && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">SV</span>
                                  )}
                                  <span className="text-xs text-slate-400">
                                    {new Date(reply.timestamp).toLocaleString("vi-VN")}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{reply.content}</p>

                                {reply.attachment_url && (
                                  <a
                                    href={reply.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#dd7323] hover:underline mt-1 inline-block"
                                  >
                                    Xem file đính kèm
                                  </a>
                                )}

                                {/* Reply Reactions */}
                                <div className="flex items-center gap-3 mt-2">
                                  <button
                                    onClick={() => handleReaction(reply.id, "like", reply.reactions || {})}
                                    className={`flex items-center gap-1 text-xs ${
                                      user && (reply.reactions || {})[user.id] === "like"
                                        ? "text-blue-500"
                                        : "text-slate-400 hover:text-blue-500"
                                    }`}
                                  >
                                    <ThumbsUp size={12} />
                                    <span>{countReactions(reply.reactions || {}, "like")}</span>
                                  </button>

                                  <button
                                    onClick={() => handleReaction(reply.id, "tim", reply.reactions || {})}
                                    className={`flex items-center gap-1 text-xs ${
                                      user && (reply.reactions || {})[user.id] === "tim"
                                        ? "text-red-500"
                                        : "text-slate-400 hover:text-red-500"
                                    }`}
                                  >
                                    <Heart size={12} />
                                    <span>{countReactions(reply.reactions || {}, "tim")}</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteMessage(reply.id)}
                                    className="text-xs text-slate-400 hover:text-red-500 ml-auto"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  )
}
