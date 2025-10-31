const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  instagramHandle: string;
  country: string;
  role: 'user' | 'super_admin';
  owner?: boolean; // Only for super_admin role
  totalEntries: number;
  totalShirtsPurchased: number;
  isWinner: boolean;
  lastWinDate?: string;
  avatar?: string;
  createdAt: string;
  congratsShown?: boolean;
  isGuest?: boolean;
  // Purchase code tracking
  codesUsed?: Array<{
    code: string;
    usedDate: string;
    entriesAwarded: number;
  }>;
  totalCodesUsed?: number;
  totalBonusEntries?: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  instagramHandle: string;
  country: string;
  password: string;
}

export interface WheelEntry {
  userId: string;
  userName: string;
  instagramHandle: string;
}

export interface WheelStats {
  entries: WheelEntry[];
  totalEntries: number;
  totalUsers: number;
}

export interface Winner {
  userId: string;
  userName: string;
  instagramHandle: string;
  winDate: string;
  prize: string;
  spinId: string;
}

export interface StoreItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  entriesPerItem: number;
  image?: string;
  category: string;
  stock: number;
  active: boolean;
}

export interface PurchaseItem {
  itemId: string;
  quantity: number;
}

export interface PurchaseResponse {
  purchaseId: string;
  totalAmount: number;
  totalEntriesEarned: number;
  newTotalEntries: number;
  items: Array<{
    storeItemId: string;
    itemName: string;
    quantity: number;
    price: number;
    entriesEarned: number;
  }>;
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        // Check if logout is required
        if (data.logoutRequired) {
          this.logout();
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
        throw new Error(data.error || data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data) {
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data) {
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    }
    
    throw new Error(response.error || 'Registration failed');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get user');
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  // Wheel Management
  async getWheelEntries(): Promise<WheelStats> {
    const response = await this.request<WheelStats>('/wheel/entries');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get wheel entries');
  }

  // Public Wheel Entries (No auth required - for guests)
  async getPublicWheelEntries(): Promise<WheelStats> {
    const response = await this.request<WheelStats>('/wheel/public-entries');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get public wheel entries');
  }

  async triggerSpin(): Promise<any> {
    const response = await this.request('/wheel/spin', {
      method: 'POST',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to trigger spin');
  }

  async getLatestWinner(): Promise<Winner> {
    const response = await this.request<Winner>('/wheel/latest-winner');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get latest winner');
  }

  async checkWinner(): Promise<{ isWinner: boolean; showWinnerNotification: boolean; winner: Winner | null }> {
    const response = await this.request<{ isWinner: boolean; showWinnerNotification: boolean; winner: Winner | null }>('/wheel/check-winner');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to check winner status');
  }

  async markCongratsShown(): Promise<void> {
    const response = await this.request('/wheel/mark-congrats-shown', {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark congratulations as shown');
    }
  }

  async getWheelStats(): Promise<any> {
    const response = await this.request('/wheel/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get wheel stats');
  }

  // Store
  async getStoreItems(): Promise<StoreItem[]> {
    const response = await this.request<StoreItem[]>('/store/items');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get store items');
  }

  async purchaseItems(items: PurchaseItem[], paymentMethod = 'cash'): Promise<PurchaseResponse> {
    const response = await this.request<PurchaseResponse>('/store/purchase', {
      method: 'POST',
      body: JSON.stringify({ items, paymentMethod }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Purchase failed');
  }

  async getPurchaseHistory(page = 1, limit = 10): Promise<any> {
    const response = await this.request(`/store/purchases?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get purchase history');
  }

  // Dashboard
  async getDashboardData(): Promise<any> {
    const response = await this.request('/dashboard');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get dashboard data');
  }

  async getLeaderboard(limit = 10): Promise<any> {
    const response = await this.request(`/dashboard/leaderboard?limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get leaderboard');
  }

  async getRecentWinners(limit = 10): Promise<any> {
    const response = await this.request(`/dashboard/winners?limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get recent winners');
  }

  // Admin
  async getAdminDashboard(): Promise<any> {
    const response = await this.request('/admin/dashboard');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get admin dashboard');
  }

  async getAdminSettings(): Promise<any> {
    const response = await this.request('/admin/settings');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get admin settings');
  }

  async updateAdminSettings(settings: any): Promise<any> {
    const response = await this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update admin settings');
  }

  async getUsers(page = 1, limit = 10, search = '', role?: string): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search
    });
    
    if (role) {
      params.append('role', role);
    }
    
    const response = await this.request(`/admin/users?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get users');
  }

  async blockUser(userId: string, blocked: boolean): Promise<any> {
    const response = await this.request(`/admin/users/${userId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blocked }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update user status');
  }

  async updateUserEntries(userId: string, totalEntries: number): Promise<any> {
    const response = await this.request(`/admin/users/${userId}/entries`, {
      method: 'PATCH',
      body: JSON.stringify({ totalEntries }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update user entries');
  }

  async declareWinner(userId: string, prize = 'Mystery Prize', notes?: string): Promise<any> {
    const response = await this.request('/admin/declare-winner', {
      method: 'POST',
      body: JSON.stringify({ userId, prize, notes }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to declare winner');
  }

  // Game Settings
  async getGameSettings(): Promise<any> {
    const response = await this.request('/wheel/game-settings');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get game settings');
  }

  // Public Stats (No auth required - for guests)
  async getPublicStats(): Promise<any> {
    const response = await this.request('/wheel/public-stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get public stats');
  }

  async updateGameSettings(settings: any): Promise<any> {
    const response = await this.request('/admin/game-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update game settings');
  }

  // Admin Game Settings (requires authentication)
  async getAdminGameSettings(): Promise<any> {
    const response = await this.request('/admin/game-settings');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get admin game settings');
  }

  async resetGame(): Promise<any> {
    const response = await this.request('/admin/reset-game', {
      method: 'POST',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to reset game');
  }

  // Purchase Codes
  async verifyPurchaseCode(code: string): Promise<any> {
    const response = await this.request('/purchase-codes/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to verify purchase code');
  }

  async getPurchaseCodes(page = 1, limit = 20, status = 'all'): Promise<any> {
    const response = await this.request(`/purchase-codes/admin/codes?page=${page}&limit=${limit}&status=${status}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get purchase codes');
  }

  async generatePurchaseCodes(count: number, entriesPerCode: number = 10): Promise<any> {
    const response = await this.request('/purchase-codes/admin/generate', {
      method: 'POST',
      body: JSON.stringify({ count, entriesPerCode }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to generate purchase codes');
  }

  async getPurchaseCodeStats(): Promise<any> {
    const response = await this.request('/purchase-codes/admin/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get purchase code stats');
  }

  // Unified Password Reset (for both users and admins)
  async requestPasswordReset(email: string): Promise<any> {
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to request password reset');
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<any> {
    const response = await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to reset password');
  }

  async changeUserPassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await this.request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to change password');
  }

  // Admin password change with email verification
  async requestPasswordChangeVerification(): Promise<any> {
    const response = await this.request('/admin/request-password-change', {
      method: 'POST',
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to request password change verification');
  }

  async verifyPasswordChangeToken(token: string, newPassword: string): Promise<any> {
    const response = await this.request('/admin/verify-password-change', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to verify password change');
  }

  async checkToken(token: string): Promise<any> {
    const response = await this.request('/auth/check-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Invalid or expired token');
  }

  // Platform Settings
  async getPlatformSettings(): Promise<any> {
    const response = await this.request('/platform-settings');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get platform settings');
  }

  async updatePlatformSettings(settings: any): Promise<any> {
    const response = await this.request('/platform-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update platform settings');
  }

  async getPlatformSetting(key: string): Promise<any> {
    const response = await this.request(`/platform-settings/${key}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get platform setting');
  }

  async updatePlatformSetting(key: string, value: any): Promise<any> {
    const response = await this.request(`/platform-settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update platform setting');
  }

  async resetPlatformSettings(): Promise<any> {
    const response = await this.request('/platform-settings/reset', {
      method: 'POST',
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to reset platform settings');
  }
}

export const apiService = new ApiService();
