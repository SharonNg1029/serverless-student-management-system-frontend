import api from '../utils/axios'

// ============================================
// SEARCH API TYPES
// ============================================

export type SearchType = 'classes' | 'subjects'

export interface SearchParams {
  type: SearchType
  keyword?: string
  filters?: string
}

export interface SearchResult {
  id: string
  title: string
  subtitle: string | null
  type: string // "class" | "subject"
  avatar: string | null
  extraInfo: string | null
  createdAt: string | null
  status: number | null
}

export interface SearchResponse {
  data: SearchResult[]
  total: number
}

// ============================================
// SEARCH API FUNCTIONS
// ============================================

/**
 * GET /api/search?type=classes|subjects&keyword=xxx&filters=xxx
 * Tìm kiếm lớp học hoặc môn học cho student
 *
 * Query params:
 * - type: 'classes' | 'subjects' (required)
 * - keyword: từ khóa tìm kiếm (optional)
 * - filters: filter theo keyword khi type là classes hoặc subjects (optional)
 *
 * Response: Array trực tiếp [{ id, title, subtitle, type, avatar, extraInfo, createdAt, status }]
 */
export const search = async (params: SearchParams): Promise<SearchResponse> => {
  try {
    // Build query params - dùng filters thay vì keyword cho classes/subjects
    const queryParams: Record<string, string> = {
      type: params.type
    }

    // API yêu cầu dùng filters param cho việc filter classes/subjects
    if (params.keyword) {
      queryParams.filters = params.keyword
    }

    // Nếu có filters riêng thì dùng filters đó (override keyword)
    if (params.filters) {
      queryParams.filters = params.filters
    }

    console.log('Search API params:', queryParams)
    const response = await api.get('/api/search', { params: queryParams })
    console.log('Search API RAW response:', response)
    console.log('Search API response.data:', response.data)

    // Response có thể là nhiều format khác nhau
    let results: SearchResult[] = []
    if (Array.isArray(response.data)) {
      results = response.data
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      results = response.data.results
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      results = response.data.data
    }

    console.log('Search API parsed results:', results)
    return {
      data: results,
      total: results.length
    }
  } catch (error) {
    console.error('Search API error:', error)
    return { data: [], total: 0 }
  }
}

export default {
  search
}
