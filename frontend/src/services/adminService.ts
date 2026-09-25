import api from './api';

export interface AdminUserItem {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  isVerified: boolean;
  college?: string;
  branch?: string;
  cgpa?: number;
  graduationYear?: number;
  currentSemester?: number;
  preferredCareer?: string;
  skills?: string[];
  dreamCompany?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  studentCount: number;
  adminCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  recentRegistrations: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'admin';
  college?: string;
  branch?: string;
  preferredCareer?: string;
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ai_suggestion' | 'internship_alert' | 'learning_resource' | 'system_announcement' | 'milestone';
  link: string;
  isBroadcast: boolean;
  readCount: number;
  totalRecipients: number;
  createdAt: string;
}

export interface BroadcastNotificationData {
  title: string;
  message: string;
  type: string;
  link?: string;
}

export const adminService = {
  /**
   * Fetch all registered users with optional search and role filters
   */
  async getUsers(params?: { search?: string; role?: string; isVerified?: boolean | string }) {
    const response = await api.get<{ success: boolean; count: number; users: AdminUserItem[] }>('/admin/users', {
      params,
    });
    return response.data;
  },

  /**
   * Create a new user or admin account directly
   */
  async createUser(userData: CreateUserData) {
    const response = await api.post<{ success: boolean; message: string; user: AdminUserItem }>('/admin/users', userData);
    return response.data;
  },

  /**
   * Fetch summary statistics for the Admin Dashboard
   */
  async getStats() {
    const response = await api.get<{ success: boolean; stats: AdminStats }>('/admin/stats');
    return response.data;
  },

  /**
   * Fetch all notifications with read statistics
   */
  async getNotifications() {
    const response = await api.get<{ success: boolean; count: number; notifications: AdminNotificationItem[] }>('/admin/notifications');
    return response.data;
  },

  /**
   * Broadcast a notification to all registered students
   */
  async broadcastNotification(data: BroadcastNotificationData) {
    const response = await api.post<{ success: boolean; message: string; notification: any }>('/admin/notifications', data);
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/notifications/${id}`);
    return response.data;
  },
};

export default adminService;
