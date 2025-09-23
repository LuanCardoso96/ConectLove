export interface User {
  id?: string;
  email: string;
  plan: 'Free' | 'Premium' | 'Diamante';
  gender?: string;
  likes_today?: number;
  last_like_date?: string;
}

export class UserEntity {
  static async updateMyUserData(data: Partial<User>): Promise<User> {
    // Mock implementation - replace with actual API calls
    return data as User;
  }

  static async loginWithRedirect(redirectUrl: string): Promise<void> {
    // Mock implementation - replace with actual authentication
    console.log('Mock login redirect to:', redirectUrl);
  }
}
