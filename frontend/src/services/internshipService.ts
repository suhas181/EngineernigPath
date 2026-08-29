import api from './api';

export interface InternshipItem {
  _id: string;
  externalId: string;
  source: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  country?: string;
  remote?: boolean;
  employmentType?: string;
  skills: string[];
  applicationUrl: string;
  companyUrl?: string;
  sourceUrl?: string;
  salary?: string;
  publishedAt?: string;
  expiresAt?: string;
  lastCheckedAt: string;
  status: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  role:
    | 'Software Engineer'
    | 'Frontend Engineer'
    | 'Backend Engineer'
    | 'AI/ML Engineer'
    | 'Data Analyst'
    | 'DevOps Engineer'
    | 'Mobile Developer'
    | 'Cybersecurity Engineer'
    | 'Other';
  createdAt: string;
  updatedAt: string;
  isBookmarked?: boolean;
}

export interface InternshipStats {
  openCount: number;
  softwareCount: number;
  remoteCount: number;
  companyCount: number;
  lastCheckedAt?: string | null;
}

export interface GetInternshipsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  stats: InternshipStats;
  savedInternshipIds: string[];
  internships: InternshipItem[];
}

export interface GetInternshipsQueryParams {
  role?: string;
  location?: string;
  remote?: boolean | string;
  skills?: string;
  search?: string;
  source?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  bookmarkedOnly?: boolean | string;
}

export interface RecommendedItem {
  item: InternshipItem;
  score: number;
  reason: string;
}

export const internshipService = {
  /**
   * Fetch paginated and filtered internship listings
   */
  async getInternships(params?: GetInternshipsQueryParams): Promise<GetInternshipsResponse> {
    const response = await api.get<GetInternshipsResponse>('/internships', { params });
    return response.data;
  },

  /**
   * Fetch detailed info for a single internship
   */
  async getInternshipById(id: string): Promise<{ success: boolean; internship: InternshipItem }> {
    const response = await api.get<{ success: boolean; internship: InternshipItem }>(`/internships/${id}`);
    return response.data;
  },

  /**
   * Fetch personalized recommendations for the authenticated student
   */
  async getRecommendations(limit: number = 3): Promise<{ success: boolean; recommendations: RecommendedItem[] }> {
    const response = await api.get<{ success: boolean; recommendations: RecommendedItem[] }>(
      '/internships/recommendations',
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Toggle saved/bookmarked status
   */
  async toggleBookmark(id: string): Promise<{ success: boolean; isBookmarked: boolean; savedInternshipIds: string[] }> {
    const response = await api.post<{ success: boolean; isBookmarked: boolean; savedInternshipIds: string[] }>(
      `/internships/${id}/bookmark`
    );
    return response.data;
  },
};

export default internshipService;
