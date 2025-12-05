import api from '../utils/axios'

// ============================================
// SEARCH API TYPES
// ============================================

export type SearchType = 'user' | 'class' | 'subject' | 'assignment' | 'all'

export interface SearchParams {
  type: SearchType
  keyword?: string
  filters?: string
}

export interface SearchResult {
  id: string | number
  type: SearchType
  title: string
  description?: string
  url?: string
  metadata?: Record<string, any>
}

export interface SearchResponse {
  data: SearchResult[]
  total?: number
}

// ============================================
// SEARCH API FUNCTIONS
// ============================================

/**
 * GET /api/search
 * Tìm kiếm toàn cục
 */
export const search = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await api.get<SearchResponse>('/api/search', { params })
  return response.data
}

export default {
  search
}
