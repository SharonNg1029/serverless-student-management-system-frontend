'use client'

import { Link, useLocation, useNavigate } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Search, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import ChatSidebar from '../chat/ChatSidebar'
import NotificationBell from '../notifications/NotificationBell'
import UserMenu from './UserMenu'
import { search, type SearchResult, type SearchType } from '../../services/searchApi'
import '../../style/navbar.css'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get search type based on user role
  const getSearchType = (): SearchType => {
    if (!user) return 'all'
    switch (user.role) {
      case 'Admin':
        return 'all'
      case 'Lecturer':
        return 'class'
      case 'Student':
        return 'class'
      default:
        return 'all'
    }
  }

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await search({
        type: getSearchType(),
        keyword: query
      })
      setSearchResults(response.data || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value)
    }, 300)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    setShowResults(false)
    setSearchQuery('')
    if (result.url) {
      navigate(result.url)
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Role-based navigation items
  const getNavItems = () => {
    if (!user) return []

    switch (user.role) {
      case 'Admin':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Người dùng', href: '/admin/users-management/list' },
          { label: 'Môn học', href: '/admin/subjects-management/list' },
          { label: 'Lớp học', href: '/admin/classes-management/list' },
          { label: 'Cấu hình', href: '/admin/settings' },
          { label: 'Nhật ký', href: '/admin/audit-logs' }
        ]

      case 'Lecturer':
        return [
          { label: 'Dashboard', href: '/lecturer/dashboard' },
          { label: 'Lớp học của tôi', href: '/lecturer/my-courses' }
        ]

      case 'Student':
        return [
          { label: 'Dashboard', href: '/student/dashboard' },
          { label: 'Lớp của tôi', href: '/student/my-courses' },
          { label: 'Tất cả khóa học', href: '/student/all-courses' },
          { label: 'Xếp hạng', href: '/student/ranking' }
        ]

      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className='navbar-wrapper'>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/home' className='navbar-logo'>
            <img src='/Logo_AWS_FCJ.png' alt='LMS FCJ' style={{ height: '40px' }} />
          </Link>

          <div className='navbar-menu'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`navbar-item ${location.pathname === item.href ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div
            className='navbar-actions'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {/* Search bar */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  gap: '0.5rem',
                  minWidth: '200px'
                }}
              >
                <Search size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <input
                  type='text'
                  placeholder='Tìm kiếm...'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowResults(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
                {isSearching && <Loader2 size={16} className='animate-spin' style={{ color: '#e38214' }} />}
                {searchQuery && !isSearching && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setShowResults(false)
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div style={{ fontWeight: 500, color: '#333', fontSize: '14px' }}>{result.title}</div>
                        {result.description && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{result.description}</div>
                        )}
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#e38214',
                            marginTop: '4px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {result.type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                      Không tìm thấy kết quả
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat icon */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              title='Chat'
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(227, 130, 20, 0.1)'
                e.currentTarget.style.color = '#e38214'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#fff'
              }}
            >
              <MessageCircle size={20} />
            </button>

            {/* Notification bell */}
            <NotificationBell />

            {/* User Menu with Avatar and Dropdown */}
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Chat Sidebar */}
      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
