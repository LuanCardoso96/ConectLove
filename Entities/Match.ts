export interface Match {
  id?: string;
  profile1_id: string;
  profile2_id: string;
  last_message_preview?: string;
  last_message_timestamp?: string;
}

export class MatchEntity {
  static async create(data: Match): Promise<Match> {
    // Mock implementation - replace with actual API calls
    const match: Match = {
      ...data,
      id: Date.now().toString(),
    };
    return match;
  }

  static async list(): Promise<Match[]> {
    // Mock implementation - replace with actual API calls
    return [];
  }
}
