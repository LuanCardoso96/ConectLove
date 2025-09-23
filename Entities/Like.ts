export interface Like {
  id?: string;
  liker_profile_id: string;
  liked_profile_id: string;
  type: 'like' | 'super-like' | 'pass';
  created_by?: string;
}

export class LikeEntity {
  static async create(data: Like): Promise<Like> {
    // Mock implementation - replace with actual API calls
    const like: Like = {
      ...data,
      id: Date.now().toString(),
    };
    return like;
  }

  static async filter(filters: any): Promise<Like[]> {
    // Mock implementation - replace with actual API calls
    return [];
  }
}
